/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { jwtHelpers } from '../helpers/jwtHelpers/jwtHelpers';
import config from '../config';

let io: SocketIOServer;

// Map to store active connections: userId -> Set of socketIds
const activeConnections = new Map<string, Set<string>>();

// Map to store role-based connections for quicker lookup
const roleConnections = new Map<string, Set<string>>();

export const initializeSocketIO = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'https://prostuti-app-teacher-admin-dashb-production.up.railway.app'
            ],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            const decoded = jwtHelpers.verifyToken(token, config.jwt_access_token_secret);
            socket.data.user = decoded;

            // Add this connection to our user map
            if (!activeConnections.has(decoded.userId)) {
                activeConnections.set(decoded.userId, new Set<string>());
            }

            // TypeScript safety: ensure the Set exists before adding to it
            const userConnections = activeConnections.get(decoded.userId);
            if (userConnections) {
                userConnections.add(socket.id);
            }

            // Add this connection to our role map
            if (!roleConnections.has(decoded.role)) {
                roleConnections.set(decoded.role, new Set<string>());
            }

            // TypeScript safety: ensure the Set exists before adding to it
            const roleSocketIds = roleConnections.get(decoded.role);
            if (roleSocketIds) {
                roleSocketIds.add(socket.id);
            }

            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.data.user.userId} (${socket.data.user.role})`);

        // Handle disconnection
        socket.on('disconnect', () => {
            const userId = socket.data.user?.userId;
            const role = socket.data.user?.role;

            if (userId && activeConnections.has(userId)) {
                const userConnections = activeConnections.get(userId);
                if (userConnections) {
                    userConnections.delete(socket.id);

                    if (userConnections.size === 0) {
                        activeConnections.delete(userId);
                    }
                }
            }

            if (role && roleConnections.has(role)) {
                const roleSocketIds = roleConnections.get(role);
                if (roleSocketIds) {
                    roleSocketIds.delete(socket.id);

                    if (roleSocketIds.size === 0) {
                        roleConnections.delete(role);
                    }
                }
            }

            console.log(`User disconnected: ${socket.data.user?.userId}`);
        });
    });

    return io;
};

// Function to emit events to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
    if (activeConnections.has(userId)) {
        const socketIds = activeConnections.get(userId);
        if (socketIds) {
            socketIds.forEach((socketId: string) => {
                io.to(socketId).emit(event, data);
            });
            return true;
        }
    }
    return false;
};

// Function to emit events to users with a specific role
export const emitToRole = (role: string, event: string, data: any) => {
    if (roleConnections.has(role)) {
        const socketIds = roleConnections.get(role);
        if (socketIds) {
            socketIds.forEach((socketId: string) => {
                io.to(socketId).emit(event, data);
            });
            return true;
        }
    }
    return false;
};

// Function to emit events to all connected clients
export const emitToAll = (event: string, data: any) => {
    io.emit(event, data);
    return true;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};