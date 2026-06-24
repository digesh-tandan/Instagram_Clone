import { create }
from "zustand";

import { persist }
from "zustand/middleware";

export const useSearchStore =
create(

    persist(

        (set) => ({

            recentSearches: [],

            setRecentSearches: (
                searches
            ) =>

                set({
                    recentSearches: searches
                })

        }),

        {
            name:
            "search-storage"
        }
    )
);