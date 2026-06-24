import {

    useEffect,
    useState

} from "react";

import {

    Link

} from "react-router-dom";

import {

    Search as SearchIcon,
    X

} from "lucide-react";

import API from "../api/axios";

import "../styles/search.css";

import {
    useSearchStore
}
from "../store/searchStore";

function Search() {

    const [query, setQuery] =
    useState("");

    const [users, setUsers] =
    useState([]);

    const [loading, setLoading] =
    useState(false);

    const recentSearches =
    useSearchStore(
        state => state.recentSearches
    );

    const setRecentSearches =
    useSearchStore(
        state => state.setRecentSearches
    );

    // SEARCH USERS

    useEffect(() => {

        const delayDebounce =
        setTimeout(() => {

            if (
                query.trim() !== ""
            ) {

                searchUsers();
            }

            else {

                setUsers([]);
            }

        }, 400);

        return () =>
            clearTimeout(
                delayDebounce
            );

    }, [query]);

    // API CALL

    const searchUsers =
    async () => {

        try {

            setLoading(true);

            const response =
            await API.get(

                `/auth/search-users?q=${query}`
            );

            setUsers(
                response.data.users || []
            );

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    // SAVE RECENT SEARCH

    const saveRecentSearch =
    (user) => {

        let updated = [

            user,

            ...recentSearches.filter(

                (u) =>
                    u.username !==
                    user.username
            )
        ];

        updated =
        updated.slice(0, 8);

        setRecentSearches(
            updated
        );

    };

    // REMOVE RECENT

    const removeRecent =
    (username) => {

        const updated =
        recentSearches.filter(

            (u) =>
                u.username !==
                username
        );

        setRecentSearches(
            updated
        );

    };

    return (

        <div className="search-page">

            <div className="search-container">

                {/* SEARCH BAR */}

                <div className="search-bar-wrapper">

                    <SearchIcon
                        size={18}
                        className="search-icon"
                    />

                    <input

                        type="text"

                        placeholder="Search users..."

                        value={query}

                        onChange={(e) =>
                            setQuery(
                                e.target.value
                            )
                        }

                        className="search-input"
                    />

                </div>

                {/* LOADING */}

                {

                    loading && (

                        <div className="search-loading">

                            Searching...

                        </div>
                    )
                }

                {/* RESULTS */}

                {

                    query &&
                    users.length > 0 && (

                        <div className="search-results">

                            {

                                users.map(

                                    (user) => (

                                        <Link

                                            key={user.id}

                                            to={`/profile/${user.username}`}

                                            className="search-user-card"

                                            onClick={() =>
                                                saveRecentSearch(user)
                                            }
                                        >

                                            <div className="search-user-left">

                                                <div className="search-avatar">

                                                    {

                                                        user.profilePhoto

                                                        ?

                                                        <img
                                                            src={user.profilePhoto}
                                                            alt=""
                                                        />

                                                        :

                                                        user.username
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                    }

                                                </div>

                                                <div>

                                                    <h3 className="search-username">

                                                        {user.username}

                                                    </h3>

                                                    <p className="search-name">

                                                        {user.name}

                                                    </p>

                                                </div>

                                            </div>

                                        </Link>
                                    )
                                )
                            }

                        </div>
                    )
                }

                {/* EMPTY RESULT */}

                {

                    query &&
                    !loading &&
                    users.length === 0 && (

                        <div className="search-empty">

                            No users found

                        </div>
                    )
                }

                {/* RECENT SEARCHES */}

                {

                    !query &&
                    recentSearches.length > 0 && (

                        <div className="recent-searches">

                            <div className="recent-header">

                                <h2>

                                    Recent

                                </h2>

                            </div>

                            {

                                recentSearches.map(

                                    (user) => (

                                        <Link

                                            key={user.username}

                                            to={`/profile/${user.username}`}

                                            className="search-user-card"
                                        >

                                            <div className="search-user-left">

                                                <div className="search-avatar">

                                                    {

                                                        user.profilePhoto

                                                        ?

                                                        <img
                                                            src={user.profilePhoto}
                                                            alt=""
                                                        />

                                                        :

                                                        user.username
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                    }

                                                </div>

                                                <div>

                                                    <h3 className="search-username">

                                                        {user.username}

                                                    </h3>

                                                    <p className="search-name">

                                                        {user.name}

                                                    </p>

                                                </div>

                                            </div>

                                            <button

                                                className="remove-recent-btn"

                                                onClick={(e) => {

                                                    e.preventDefault();

                                                    removeRecent(
                                                        user.username
                                                    );
                                                }}
                                            >

                                                <X size={18} />

                                            </button>

                                        </Link>
                                    )
                                )
                            }

                        </div>
                    )
                }

            </div>

        </div>
    );
}

export default Search;