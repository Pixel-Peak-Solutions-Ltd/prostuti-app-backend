import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { jwtHelpers } from '../helpers/jwtHelpers/jwtHelpers';
import config from '../config';
import { TJWTDecodedUser } from '../interfaces/jwt/jwt.type';

interface IConnectedUser {
    userId: string;
    socketId: string;
}

export class SocketService {
    private io: Server;
    private connectedUsers: IConnectedUser[] = [];

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: [
                    'http://localhost:5173',
                    'https://prostuti-app-teacher-admin-dashb-production.up.railway.app'
                ],
                credentials: true,
            },
        });

        this.setupSocketEvents();
    }

    private setupSocketEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`User connected: ${socket.id}`);

            // Authenticate socket
            this.authenticateSocket(socket);

            // Listen for disconnect
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                this.removeUserSocket(socket.id);
            });
        });
    }

    private authenticateSocket(socket: Socket): void {
        const token = socket.handshake.auth.token as string;

        if (!token) {
            socket.disconnect();
            return;
        }

        try {
            // Verify token
            const decoded = jwtHelpers.verifyToken(
                token,
                config.jwt_access_token_secret
            ) as TJWTDecodedUser;

            // Save user connection
            this.addUserSocket(decoded.userId, socket.id);

            // Set user data on socket
            socket.data.user = decoded;

            // Join personal room
            socket.join(`user_${decoded.userId}`);

            // Listen for message events
            this.setupChatEvents(socket);

            // Emit authenticated event
            socket.emit('authenticated');
        } catch (error) {
            console.error('Socket authentication error:', error);
            socket.disconnect();
        }
    }

    private setupChatEvents(socket: Socket): void {
        // Listen for new messages
        socket.on('send_message', (data) => {
            const { conversationId, message } = data;

            // Broadcast to all users in the conversation
            socket.to(`conversation_${conversationId}`).emit('receive_message', {
                ...message,
                senderId: socket.data.user.userId,
            });
        });

        // Listen for join conversation
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
        });

        // Listen for leave conversation
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });

        // Listen for typing events
        socket.on('typing', (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.data.user.userId,
                conversationId,
            });
        });

        // Listen for stop typing events
        socket.on('stop_typing', (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
                userId: socket.data.user.userId,
                conversationId,
            });
        });
    }

    private addUserSocket(userId: string, socketId: string): void {
        // Remove any existing sockets for this user
        this.connectedUsers = this.connectedUsers.filter(
            (user) => user.userId !== userId
        );

        // Add new socket connection
        this.connectedUsers.push({ userId, socketId });
    }

    private removeUserSocket(socketId: string): void {
        this.connectedUsers = this.connectedUsers.filter(
            (user) => user.socketId !== socketId
        );
    }

    public getUserSockets(userId: string): string[] {
        return this.connectedUsers
            .filter((user) => user.userId === userId)
            .map((user) => user.socketId);
    }

    public emitToUser(userId: string, event: string, data: any): void {
        this.io.to(`user_${userId}`).emit(event, data);
    }

    public emitToConversation(conversationId: string, event: string, data: any): void {
        this.io.to(`conversation_${conversationId}`).emit(event, data);
    }
}

let socketService: SocketService | null = null;

export const initSocketService = (server: HttpServer): SocketService => {
    socketService = new SocketService(server);
    return socketService;
};

export const getSocketService = (): SocketService | null => {
    return socketService;
};