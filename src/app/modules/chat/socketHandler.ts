/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import http from 'http';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { SOCKET_EVENTS } from './chat.constant';
import {
    IConnectedUser,
    IBroadcastRequestPayload,
    IAcceptBroadcastPayload,
    IChatMessagePayload,
} from './chat.interface';
import { chatService } from './chat.service';
import { jwtHelpers } from '../../helpers/jwtHelpers/jwtHelpers';
import config from '../../config';
import { Types } from 'mongoose';
import { USER_ROLE } from '../user/user.constant';

/**
 * Class to handle all Socket.IO operations
 */
export class SocketHandler {
    private io: Server;
    private connectedUsers: Map<string, IConnectedUser>;

    constructor(server: http.Server) {
        // Initialize Socket.IO with the HTTP server
        this.io = new Server(server);

        // Configure Socket.IO settings
        this.io.engine.opts.cors = {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        };
        this.io.engine.opts.pingTimeout = 60000;

        this.connectedUsers = new Map<string, IConnectedUser>();
        this.initialize();
    }

    /**
     * Initialize the Socket.IO server
     */
    private initialize(): void {
        this.io.use(this.authMiddleware.bind(this));
        this.io.on(SOCKET_EVENTS.CONNECT, this.handleConnection.bind(this));
    }

    /**
     * Authentication middleware for Socket.IO
     */
    // eslint-disable-next-line no-unused-vars
    private authMiddleware(socket: Socket, next: (err?: Error) => void): void {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication token is missing'));
            }

            const decoded = jwtHelpers.verifyToken(
                token,
                config.jwt_access_token_secret,
            );

            socket.data.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    }

    /**
     * Handle new socket connections
     */
    private handleConnection(socket: Socket): void {
        const user = socket.data.user as TJWTDecodedUser;
        console.log(`User connected: ${user.userId} (${user.role})`);

        // Store connected user
        this.connectedUsers.set(user.userId, {
            user_id: user.userId,
            role: user.role,
            socket_id: socket.id,
        });

        // Set up event listeners
        this.setupEventListeners(socket, user);

        // Notify other users that this user is online
        this.io.emit(SOCKET_EVENTS.USER_CONNECTED, {
            user_id: user.userId,
            role: user.role,
        });

        // Notify the connected user that they're authenticated
        socket.emit(SOCKET_EVENTS.AUTHENTICATED, { success: true });

        // Handle disconnections
        socket.on(SOCKET_EVENTS.DISCONNECT, () =>
            this.handleDisconnect(socket, user),
        );
    }

    /**
     * Set up event listeners for a socket
     */
    private setupEventListeners(socket: Socket, user: TJWTDecodedUser): void {
        // Student broadcast request
        if (user.role === USER_ROLE.student) {
            socket.on(
                SOCKET_EVENTS.BROADCAST_REQUEST,
                (payload: IBroadcastRequestPayload) =>
                    this.handleBroadcastRequest(socket, user, payload),
            );
        }

        // Teacher accepting broadcast request
        if (user.role === USER_ROLE.teacher) {
            socket.on(
                SOCKET_EVENTS.ACCEPT_BROADCAST,
                (payload: IAcceptBroadcastPayload) =>
                    this.handleAcceptBroadcast(socket, user, payload),
            );

            socket.on(
                SOCKET_EVENTS.DECLINE_BROADCAST,
                (payload: IAcceptBroadcastPayload) =>
                    this.handleDeclineBroadcast(socket, user, payload),
            );
        }

        // Chat messages - for both roles
        socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversation_id: string) =>
            this.handleJoinConversation(socket, conversation_id),
        );

        socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (conversation_id: string) =>
            this.handleLeaveConversation(socket, conversation_id),
        );

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (payload: IChatMessagePayload) =>
            this.handleSendMessage(socket, user, payload),
        );

        socket.on(SOCKET_EVENTS.TYPING, (conversation_id: string) =>
            this.handleTyping(socket, user, conversation_id),
        );

        socket.on(SOCKET_EVENTS.STOP_TYPING, (conversation_id: string) =>
            this.handleStopTyping(socket, user, conversation_id),
        );
    }

    /**
     * Handle socket disconnections
     */
    private handleDisconnect(socket: Socket, user: TJWTDecodedUser): void {
        console.log(`User disconnected: ${user.userId}`);

        // Remove from connected users
        this.connectedUsers.delete(user.userId);

        // Notify other users that this user is offline
        this.io.emit(SOCKET_EVENTS.USER_DISCONNECTED, {
            user_id: user.userId,
            role: user.role,
        });
    }

    /**
     * Handle broadcast request from student
     */
    private async handleBroadcastRequest(
        socket: Socket,
        user: TJWTDecodedUser,
        payload: IBroadcastRequestPayload,
    ): Promise<void> {
        try {
            const { message, subject } = payload;

            // Create broadcast in database
            const broadcastRequest = await chatService.createBroadcastRequest(
                user.userId,
                message,
                subject,
            );

            // Emit to all connected teachers
            this.io.emit(SOCKET_EVENTS.NEW_BROADCAST_AVAILABLE, {
                id: broadcastRequest._id?.toString(),
                student_id: broadcastRequest.student_id,
                message: broadcastRequest.message,
                subject: broadcastRequest.subject,
                created_at: broadcastRequest.createdAt,
            });

            // Confirm to the student
            socket.emit(SOCKET_EVENTS.BROADCAST_REQUEST, {
                success: true,
                broadcast_id: broadcastRequest._id?.toString(),
            });
        } catch (error) {
            console.error('Error creating broadcast request:', error);
            socket.emit(SOCKET_EVENTS.ERROR, {
                event: SOCKET_EVENTS.BROADCAST_REQUEST,
                message: 'Failed to create broadcast request',
            });
        }
    }

    /**
     * Handle a teacher accepting a broadcast
     */
    private async handleAcceptBroadcast(
        socket: Socket,
        user: TJWTDecodedUser,
        payload: IAcceptBroadcastPayload,
    ): Promise<void> {
        try {
            const { broadcast_id } = payload;

            // Accept broadcast in database
            const broadcastRequest = await chatService.acceptBroadcastRequest(
                broadcast_id,
                user.userId,
            );

            // Get the student's socket if they're online
            const studentUser = this.connectedUsers.get(
                broadcastRequest.student_id.toString(),
            );

            // Create a room for this conversation
            const roomName = broadcastRequest.conversation_id as string;
            socket.join(roomName);

            // If student is online, add them to the room and notify them
            if (studentUser) {
                const studentSocket = this.io.sockets.sockets.get(
                    studentUser.socket_id,
                );
                if (studentSocket) {
                    studentSocket.join(roomName);

                    // Notify the student
                    studentSocket.emit(SOCKET_EVENTS.BROADCAST_ACCEPTED, {
                        broadcast_id: broadcastRequest._id?.toString(),
                        teacher_id: user.userId,
                        conversation_id: broadcastRequest.conversation_id,
                    });
                }
            }

            // Notify other teachers that this broadcast has been accepted
            this.io.emit(SOCKET_EVENTS.BROADCAST_ACCEPTED, {
                broadcast_id: broadcastRequest._id?.toString(),
                teacher_id: user.userId,
            });

            // Confirm to the teacher
            socket.emit(SOCKET_EVENTS.ACCEPT_BROADCAST, {
                success: true,
                broadcast_id: broadcastRequest._id?.toString(),
                conversation_id: broadcastRequest.conversation_id,
            });
        } catch (error) {
            console.error('Error accepting broadcast request:', error);
            socket.emit(SOCKET_EVENTS.ERROR, {
                event: SOCKET_EVENTS.ACCEPT_BROADCAST,
                message: 'Failed to accept broadcast request',
            });
        }
    }

    /**
     * Handle a teacher declining a broadcast
     */
    private async handleDeclineBroadcast(
        socket: Socket,
        user: TJWTDecodedUser,
        payload: IAcceptBroadcastPayload,
    ): Promise<void> {
        try {
            const { broadcast_id } = payload;

            // Decline broadcast in database
            await chatService.declineBroadcastRequest(
                broadcast_id,
                user.userId,
            );

            // Confirm to the teacher
            socket.emit(SOCKET_EVENTS.DECLINE_BROADCAST, {
                success: true,
                broadcast_id,
            });
        } catch (error) {
            console.error('Error declining broadcast request:', error);
            socket.emit(SOCKET_EVENTS.ERROR, {
                event: SOCKET_EVENTS.DECLINE_BROADCAST,
                message: 'Failed to decline broadcast request',
            });
        }
    }

    /**
     * Handle joining a conversation
     */
    private handleJoinConversation(
        socket: Socket,
        conversation_id: string,
    ): void {
        socket.join(conversation_id);
        socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
            success: true,
            conversation_id,
        });
    }

    /**
     * Handle leaving a conversation
     */
    private handleLeaveConversation(
        socket: Socket,
        conversation_id: string,
    ): void {
        socket.leave(conversation_id);
        socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, {
            success: true,
            conversation_id,
        });
    }

    /**
     * Handle sending a message
     */
    private async handleSendMessage(
        socket: Socket,
        user: TJWTDecodedUser,
        payload: IChatMessagePayload,
    ): Promise<void> {
        try {
            const { conversation_id, message, recipient_id } = payload;

            // Store message in database
            const chatMessage = await chatService.storeMessage({
                sender_id: new Types.ObjectId(user.userId),
                sender_role: user.role as any,
                recipient_id: new Types.ObjectId(recipient_id),
                conversation_id,
                message,
                read: false,
            });

            // Emit message to the conversation room
            this.io.to(conversation_id).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
                id: chatMessage._id?.toString(),
                sender_id: chatMessage.sender_id,
                sender_role: chatMessage.sender_role,
                recipient_id: chatMessage.recipient_id,
                conversation_id: chatMessage.conversation_id,
                message: chatMessage.message,
                created_at: chatMessage.createdAt,
            });

            // If recipient is not in the conversation room but is online, send notification
            const recipientUser = this.connectedUsers.get(recipient_id);
            if (recipientUser) {
                const recipientSocket = this.io.sockets.sockets.get(
                    recipientUser.socket_id,
                );
                if (
                    recipientSocket &&
                    !recipientSocket.rooms.has(conversation_id)
                ) {
                    recipientSocket.emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
                        id: chatMessage._id?.toString(),
                        sender_id: chatMessage.sender_id,
                        sender_role: chatMessage.sender_role,
                        recipient_id: chatMessage.recipient_id,
                        conversation_id: chatMessage.conversation_id,
                        message: chatMessage.message,
                        created_at: chatMessage.createdAt,
                        as_notification: true,
                    });
                }
            }

            // Confirm to sender
            socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
                success: true,
                message_id: chatMessage._id?.toString(),
            });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit(SOCKET_EVENTS.ERROR, {
                event: SOCKET_EVENTS.SEND_MESSAGE,
                message: 'Failed to send message',
            });
        }
    }

    /**
     * Handle typing indicator
     */
    private handleTyping(
        socket: Socket,
        user: TJWTDecodedUser,
        conversation_id: string,
    ): void {
        socket.to(conversation_id).emit(SOCKET_EVENTS.TYPING, {
            user_id: user.userId,
            conversation_id,
        });
    }

    /**
     * Handle stop typing indicator
     */
    private handleStopTyping(
        socket: Socket,
        user: TJWTDecodedUser,
        conversation_id: string,
    ): void {
        socket.to(conversation_id).emit(SOCKET_EVENTS.STOP_TYPING, {
            user_id: user.userId,
            conversation_id,
        });
    }

    /**
     * Get the Socket.IO server instance
     */
    public getIO(): Server {
        return this.io;
    }

    /**
     * Emit course enrolled notification to the student
     */
    public emitCourseEnrolledNotification(
        studentData: { user_id: string; subscriptionEndDate?: Date },
        courseData: { name: string },
    ) {
        const studentUser = this.connectedUsers.get(studentData.user_id);

        if (studentUser) {
            const studentSocket = this.io.sockets.sockets.get(
                studentUser.socket_id,
            );
            if (studentSocket) {
                const baseMessage = `You have successfully enrolled in "${courseData.name}". Enjoy and share your review.`;

                studentSocket.emit(SOCKET_EVENTS.COURSE_ENROLLED, {
                    message: studentData.subscriptionEndDate
                        ? `${baseMessage} You have subscription till ${studentData.subscriptionEndDate.toDateString()}.`
                        : baseMessage,
                });
            }
        }
    }
}
