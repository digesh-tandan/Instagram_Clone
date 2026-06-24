import socket
from "../../socket/socket";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    FaHome,
    FaSearch,
    FaPlusSquare,
    FaCog,
    FaSignOutAlt,
    FaHeart
}
from "react-icons/fa";

import {
    FiSend
}
from "react-icons/fi";

import {
    useEffect,
    useState
} from "react";

import {
    useAuth
} from "../../context/AuthContext";

import instagramWordmark
from "../../icons/instagram_wordmark.svg";

import {
    getUnreadCounts
}
from "../../api/messageApi";

import {
    useNotificationStore
}
from "../../store/notificationStore";

import { useAuthStore }
from "../../store/authStore";

function Navbar() {

    const location =
    useLocation();

    const navigate =
    useNavigate();

    const {
        logout
    } = useAuth();

    const totalUnread =
    useNotificationStore(
        state => state.totalUnread
    );

    const setTotalUnread =
    useNotificationStore(
        state => state.setTotalUnread
    );
    // LIVE USER STATE

    const user =
    useAuthStore(
        state => state.user
    );

    const loadUnread = async () => {

        try {

            const data =
            await getUnreadCounts();

            const total =
            data.reduce(

                (sum,item) =>

                sum +
                Number(item.unreadCount),

                0
            );

            setTotalUnread(
                total
            );

        } catch(err){

            console.log(err);
        }
    };

    // PROFILE UPDATE LISTENER

    useEffect(() => {

        loadUnread();

        socket.on(
            "newMessage",
            loadUnread
        );

        socket.on(
            "refreshChats",
            loadUnread
        );

        socket.on(
            "messagesSeen",
            loadUnread
        );

        socket.on(
            "messageDeleted",
            loadUnread
        );

        socket.on(
            "connect",
            loadUnread
        );

        socket.on(
            "navbarRefresh",
            loadUnread
        );

        return () => {

            socket.off(
                "newMessage",
                loadUnread
            );

            socket.off(
                "refreshChats",
                loadUnread
            );

            socket.off(
                "messagesSeen",
                loadUnread
            );

            socket.off(
                "messageDeleted",
                loadUnread
            );

            socket.off(
                "connect",
                loadUnread
            );

            socket.off(
                "navbarRefresh",
                loadUnread
            );
        };

    }, []);

    // ACTIVE LINK

    const isActive = (path) => {

        return (
            location.pathname === path
        );
    };

    // LOGOUT

    const handleLogout = () => {

        logout();

        navigate("/login");
    };

    // PROFILE IMAGE URL

    const profileImageUrl =

        user?.profilePhoto

        ||

        (
            user?.profile_photo
            ?
            `http://localhost:8080/uploads/profile/${user.profile_photo}`
            :
            null
        );

    return (

        <aside className="sidebar">

            {/* TOP */}

            <div className="sidebar-top">

                {/* LOGO */}

                <Link
                    to="/home"
                    className="sidebar-logo"
                >
                    
                    <img
                        src={instagramWordmark}
                        alt="Instagram"
                        className="instagram-wordmark"
                        draggable={false}
                    />
                
                </Link>

                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    {/* HOME */}

                    <Link
                        to="/home"
                        className={`sidebar-link ${
                            isActive("/home")
                            ? "active"
                            : ""
                        }`}
                    >
                        <FaHome />

                        <span>
                            Home
                        </span>

                    </Link>

                    {/* MESSAGES */}

                    <Link
                        to="/messages"
                        className={`sidebar-link ${
                            location.pathname.startsWith(
                                "/messages"
                            )
                            ? "active"
                            : ""
                        }`}
                    >
                    
                        <div className="navbar-message-icon">
                    
                            <FiSend className="navbar-send-icon" />
                    
                            {
                                totalUnread > 0 && (
                                
                                    <span className="navbar-message-dot">
                                    
                                        {
                                            totalUnread > 9
                                            ? "9+"
                                            : totalUnread
                                        }

                                    </span>

                                )
                            }

                        </div>
                        
                        <span>
                        
                            Messages
                        
                        </span>
                        
                    </Link>

                    {/* SEARCH */}

                    <Link
                        to="/search"
                        className={`sidebar-link ${
                            isActive("/search")
                            ? "active"
                            : ""
                        }`}
                    >
                        <FaSearch />

                        <span>
                            Search
                        </span>

                    </Link>

                    {/* CREATE */}

                    <Link
                        to="/create-post"
                        className={`sidebar-link ${
                            isActive("/create-post")
                            ? "active"
                            : ""
                        }`}
                    >
                        <FaPlusSquare />

                        <span>
                            Create
                        </span>

                    </Link>

                    {/* NOTIFICATIONS */}

                    <Link
                        to="/notifications"
                        className={`sidebar-link ${
                            isActive("/notifications")
                            ? "active"
                            : ""
                        }`}
                    >
                        <FaHeart />
                    
                        <span>
                            Notifications
                        </span>
                    
                    </Link>

                    {/* PROFILE */}

                    <Link
                        to={`/profile/${user?.username}`}
                        className={`sidebar-link ${
                            location.pathname.includes("/profile")
                            ? "active"
                            : ""
                        }`}
                    >

                        {
                            profileImageUrl

                            ?

                            <img
                                src={profileImageUrl}
                                alt="profile"
                                className="navbar-profile-photo"
                                onError={(e) => {

                                    e.target.style.display =
                                    "none";
                                }}
                            />

                            :

                            <div className="navbar-profile-fallback">

                                {
                                    user?.username
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                            </div>
                        }

                        <span>
                            Profile
                        </span>

                    </Link>

                    {/* SETTINGS */}

                    <Link
                        to="/settings"
                        className={`sidebar-link ${
                            isActive("/settings")
                            ? "active"
                            : ""
                        }`}
                    >
                        <FaCog />

                        <span>
                            Settings
                        </span>

                    </Link>

                </nav>

            </div>

            {/* BOTTOM */}

            <div className="sidebar-bottom">

                <button
                    onClick={handleLogout}
                    className="sidebar-link logout-btn"
                >
                    <FaSignOutAlt />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default Navbar;