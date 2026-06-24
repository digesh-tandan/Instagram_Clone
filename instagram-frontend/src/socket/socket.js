import { io } from "socket.io-client";

import {
    useSocketStore
}
from "../store/socketStore";

const socket = io(

    import.meta.env.VITE_API_URL,

    {

        transports: ["websocket"],

        autoConnect: true,

        reconnection: true,

        reconnectionAttempts: 10,

        reconnectionDelay: 1000
    }
);

socket.on(
    "connect",
    () => {

        useSocketStore
            .getState()
            .setConnected(true);
    }
);

socket.on(
    "disconnect",
    () => {

        useSocketStore
            .getState()
            .setConnected(false);
    }
);

socket.on(
    "connect_error",
    (err) => {

        useSocketStore
            .getState()
            .setConnected(false);

        console.log(
            "Socket Error:",
            err.message
        );
    }
);

socket.on(
    "onlineUsers",
    (users) => {

        useSocketStore
            .getState()
            .setOnlineUsers(users);
    }
);

socket.on(
    "userTyping",
    (data) => {

        console.log(
            "USER TYPING",
            data
        );

        useSocketStore
            .getState()
            .setTypingUser(
                data.conversationId,
                data.userId
            );
    }
);

socket.on(
    "userStoppedTyping",
    (data) => {

        console.log(
            "STOP TYPING",
            data
        );

        useSocketStore
            .getState()
            .clearTypingUser(
                data.conversationId
            );
    }
);

socket.onAny((event,...args)=>{});
export default socket;