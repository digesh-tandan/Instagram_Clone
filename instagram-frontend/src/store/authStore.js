import { create } from "zustand";

import { persist }
from "zustand/middleware";

export const useAuthStore = create(

    persist(

        (set) => ({

            user: null,

            token: null,

            loading: false,

            setAuth: (
                user,
                token
            ) =>

                set({

                    user,

                    token
                }),

            logoutAuth: () =>

                set({

                    user: null,

                    token: null
                }),

            setLoading: (
                value
            ) =>

                set({
                    loading: value
                })
        }),

        {
            name: "auth-storage"
        }
    )
);