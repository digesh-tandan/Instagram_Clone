import { create }
from "zustand";

export const useSocketStore = create(

    (set) => ({

        connected: false,

        onlineUsers: [],

        typingUsers: {},

        setConnected: (status) =>

            set({
                connected: status
            }),

        setOnlineUsers: (users) =>

            set({
                onlineUsers: users
            }),

        setTypingUser: (
            conversationId,
            userId
        ) =>

            set(
                state => ({
                    typingUsers: {

                        ...state.typingUsers,

                        [conversationId]:
                        userId
                    }
                })
            ),

        clearTypingUser: (
            conversationId
        ) =>

            set(
                state => {

                    const updated = {
                        ...state.typingUsers
                    };

                    delete updated[
                        conversationId
                    ];

                    return {
                        typingUsers:
                        updated
                    };
                }
            )
    })
);