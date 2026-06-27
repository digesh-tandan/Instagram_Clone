const { Server } = require("socket.io");

const db = require("../config/db");

let io;

const onlineUsers = new Map();

const initializeSocket = (server) => {

    io = new Server(server, {

        cors: {
        
            origin: [
                "http://localhost:5173",
                "https://instaclonebydigesh.vercel.app"
            ],
        
            methods: ["GET", "POST"],
        
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log(
            "User Connected:",
            socket.id
        );

        // ==========================
        // USER ONLINE
        // ==========================

        socket.on("join", (userId) => {

            console.log(
                "JOIN EVENT:",
                userId,
                socket.id
            );
        
            onlineUsers.set(
                Number(userId),
                socket.id
            );
        
            // SAVE ONLINE STATUS
        
            db.query(
                `
                UPDATE users
                SET is_online = 1
                WHERE id = ?
                `,
                [userId],
                (err) => {
                    if (err) {
                        console.log(
                            "ONLINE UPDATE ERROR:",
                            err
                        );
                    }
                }
            );
        
            io.emit(
                "onlineUsers",
                Array.from(
                    onlineUsers.keys()
                )
            );
        
            console.log(
                "Joined:",
                userId
            );
        });

        // ==========================
        // JOIN CONVERSATION ROOM
        // ==========================

        socket.on(

            "joinConversation",

            (conversationId) => {

                socket.join(
                    `conversation_${conversationId}`
                );

                console.log(
                    `Joined conversation ${conversationId}`
                );
            }
        );

        // ==========================
        // SEND MESSAGE
        // ==========================

        socket.on(

            "sendMessage",

            (data) => {

                io.to(
                    `conversation_${data.conversationId}`
                ).emit(
                    "newMessage",
                    data
                );
            }
        );

        // ==========================
        // MESSAGE EDITED
        // ==========================

        socket.on(

            "messageEdited",

            (data) => {

                io.to(
                    `conversation_${data.conversationId}`
                ).emit(
                    "messageEdited",
                    data
                );
            }
        );

        // ==========================
        // MESSAGE DELETED
        // ==========================

        socket.on(

            "messageDeleted",

            (data) => {

                io.to(
                    `conversation_${data.conversationId}`
                ).emit(
                    "messageDeleted",
                    data
                );
            }
        );

        // ==========================
        // CHAT PINNED / UNPINNED
        // ==========================

        socket.on(

            "chatPinned",

            (data) => {

                io.emit(
                    "chatPinned",
                    data
                );
            }
        );

        // ==========================
        // TYPING
        // ==========================

        socket.on(
            "typing",
            (data) => {
            
                socket.to(
                    `conversation_${data.conversationId}`
                ).emit(
                    "userTyping",
                    {
                        userId:
                        data.userId,
                    
                        conversationId:
                        data.conversationId
                    }
                );
            }
        );

        // ==========================
        // STOP TYPING
        // ==========================

        socket.on(
            "stopTyping",
            (data) => {
            
                socket.to(
                    `conversation_${data.conversationId}`
                ).emit(
                    "userStoppedTyping",
                    {
                        userId:
                        data.userId,
                    
                        conversationId:
                        data.conversationId
                    }
                );
            }
        );

        // ==========================
        // GET ONLINE USERS
        // ==========================

        socket.on(

            "getOnlineUsers",

            () => {

                socket.emit(

                    "onlineUsers",

                    Array.from(
                        onlineUsers.keys()
                    )
                );
            }
        );

        // ==========================
        // MESSAGE DELIVERED
        // ==========================

        socket.on(

            "messageDelivered",

            (data) => {

                io.to(
                    `conversation_${data.conversationId}`
                ).emit(
                    "messageDelivered",
                    data
                );
            }
        );

        // LEAVE CONVERSATION

        socket.on(
            "leaveConversation",
            (conversationId) => {
            
                socket.leave(
                    `conversation_${conversationId}`
                );
            
            }
        );

        // SEEN STATUS
        socket.on(
            "messagesSeen",
            (conversationId) => {
            
                io.to(
                    `conversation_${conversationId}`
                ).emit(
                    "messagesSeen",
                    conversationId
                );
            }
        );

        // ==========================
        // DISCONNECT
        // ==========================

        socket.on(
            "disconnect",
            () => {
            
                for (
                
                    const [userId, socketId]
                
                    of onlineUsers.entries()
                
                ) {
                
                    if (
                    
                        socketId ===
                        socket.id
                    
                    ) {
                    
                        onlineUsers.delete(
                            userId
                        );
                    
                        // SAVE OFFLINE STATUS
                    
                        db.query(
                            `
                            UPDATE users
                            SET
                            is_online = 0,
                            last_seen = NOW()
                            WHERE id = ?
                            `,
                            [userId],
                            (err) => {
                            
                                if (err) {
                                
                                    console.log(
                                        "OFFLINE UPDATE ERROR:",
                                        err
                                    );
                                }
                            }
                        );
                    
                        break;
                    }
                }
            
                io.emit(
                
                    "onlineUsers",
                
                    Array.from(
                        onlineUsers.keys()
                    )
                );
            
                console.log(
                    "Disconnected:",
                    socket.id
                );
            }
        );
    });

    return io;
};

const getIO = () => io;

const getOnlineUsers = () =>
onlineUsers;

const isUserOnline = (userId) => {

    return onlineUsers.has(
        Number(userId)
    );
};

module.exports = {

    initializeSocket,

    getIO,

    getOnlineUsers,

    isUserOnline
};