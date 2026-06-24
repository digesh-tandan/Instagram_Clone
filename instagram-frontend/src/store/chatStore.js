import { create } from "zustand";

import { persist }
from "zustand/middleware";

export const useChatStore = create(

    persist(

        (set) => ({

            selectedChat: null,

            unreadCounts: {},

            setSelectedChat: (chat) =>

                set({
                    selectedChat: chat
                }),

            clearSelectedChat: () =>

                set({
                    selectedChat: null
                }),

            setUnreadCounts: (counts) =>

                set({
                    unreadCounts: counts
                }),
        }),

        {
            name: "chat-storage"
        }

    )

);