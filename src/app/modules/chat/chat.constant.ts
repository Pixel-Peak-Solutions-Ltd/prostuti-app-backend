// Socket.IO Events
export const SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    AUTHENTICATE: 'authenticate',
    AUTHENTICATED: 'authenticated',
    AUTHENTICATION_ERROR: 'authentication_error',

    // Broadcast request events
    BROADCAST_REQUEST: 'broadcast_request',
    NEW_BROADCAST_AVAILABLE: 'new_broadcast_available',
    ACCEPT_BROADCAST: 'accept_broadcast',
    BROADCAST_ACCEPTED: 'broadcast_accepted',
    DECLINE_BROADCAST: 'decline_broadcast',
    BROADCAST_EXPIRED: 'broadcast_expired',

    // Chat events
    JOIN_CONVERSATION: 'join_conversation',
    LEAVE_CONVERSATION: 'leave_conversation',
    SEND_MESSAGE: 'send_message',
    RECEIVE_MESSAGE: 'receive_message',
    TYPING: 'typing',
    STOP_TYPING: 'stop_typing',

    // Status events
    ONLINE_STATUS: 'online_status',
    USER_CONNECTED: 'user_connected',
    USER_DISCONNECTED: 'user_disconnected',

    // Error events
    ERROR: 'error',

    // Notification events
    COURSE_ENROLLED: 'course_enrolled',
    COURSE_NOTIFICATION: 'course_notification',
};

// Broadcast request expiration time in hours
export const BROADCAST_EXPIRY_HOURS = 24;

// Pagination defaults
export const CHAT_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};

export const BROADCAST_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired',
};
