import { create }
from "zustand";

export const useNotificationStore = create(

    (set) => ({

        totalUnread: 0,

        notifications: [],

        setTotalUnread: (count) =>

            set({
                totalUnread: count
            }),

        setNotifications: (notifications) =>

            set({
                notifications
            })
    })
);