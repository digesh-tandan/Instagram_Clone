import {

    Routes,
    Route,
    Navigate,
    useLocation

} from "react-router-dom";

// COMPONENTS

import Navbar
from "./components/common/Navbar";

// PAGES

import Login
from "./pages/Login";

import Register
from "./pages/Register";

import ForgotPassword
from "./pages/ForgotPassword";

import VerifyOTP
from "./pages/VerifyOTP";

import ResetPassword
from "./pages/ResetPassword";

import RecoverAccountOTP
from "./pages/RecoverAccountOTP";

import Home
from "./pages/Home";

import Profile
from "./pages/Profile";

import Search
from "./pages/Search";

import CreatePost
from "./pages/CreatePost";

import EditProfile
from "./pages/EditProfile";

import Settings
from "./pages/Settings";

import AuthSuccess
from "./pages/AuthSuccess";

import Notifications
from "./pages/Notifications";

import SavedPosts
from "./pages/SavedPosts";

import MyActivity
from "./pages/MyActivity";

import Messages 
from "./pages/Messages";
// ROUTES

import PrivateRoute
from "./routes/PrivateRoute";

import { useAuth }
from "./context/AuthContext";

// STYLES

import "./styles/global.css";

import "./styles/auth.css";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/post.css";
import "./styles/profile.css";
import "./styles/settings.css";

function App() {

    const location =
    useLocation();

    const { isAuthenticated } = useAuth();

    // HIDE NAVBAR ON AUTH PAGES

    const authRoutes = [

        "/login",

        "/register",

        "/forgot-password",

        "/verify-otp",

        "/reset-password",

        "/auth-success",

        "/recover-account-otp"
    ];

    const hideNavbar =
    authRoutes.includes(
        location.pathname
    );

    // CHECK LOGIN
  
    return (

        <div className="app-layout">

            {/* NAVBAR */}

            {
                !hideNavbar &&
                isAuthenticated &&
                <Navbar />
            }

            {/* MAIN */}

            <main
                className={

                    hideNavbar

                    ?

                    "main-auth"

                    :

                    "main-app"
                }
            >

                <Routes>

                    {/* DEFAULT */}

                    <Route

                        path="/"

                        element={
                            isAuthenticated
                            ?
                            <Navigate to="/home" />
                            :
                            <Navigate to="/login" />
                        }
                    />

                    {/* AUTH ROUTES */}

                    <Route

                        path="/login"

                        element={<Login />}
                    />

                    <Route

                        path="/register"

                        element={<Register />}
                    />

                    <Route

                        path="/forgot-password"

                        element={<ForgotPassword />}
                    />

                    <Route

                        path="/verify-otp"

                        element={<VerifyOTP />}
                    />

                    <Route

                        path="/reset-password"

                        element={<ResetPassword />}
                    />

                    <Route
                    
                        path="/recover-account-otp"
                                        
                        element={
                            <RecoverAccountOTP />
                        }
                    />                    

                    <Route

                        path="/auth-success"

                        element={<AuthSuccess />}
                    />



                    {/* PRIVATE ROUTES */}

                    <Route

                        path="/home"

                        element={

                            <PrivateRoute>

                                <Home />

                            </PrivateRoute>
                        }
                    />

                    <Route

                        path="/profile/:username"

                        element={

                            <PrivateRoute>

                                <Profile />

                            </PrivateRoute>
                        }
                    />

                    <Route

                        path="/search"

                        element={

                            <PrivateRoute>

                                <Search />

                            </PrivateRoute>
                        }
                    />

                    <Route

                        path="/create-post"

                        element={

                            <PrivateRoute>

                                <CreatePost />

                            </PrivateRoute>
                        }
                    />

                    <Route

                        path="/edit-profile"

                        element={

                            <PrivateRoute>

                                <EditProfile />

                            </PrivateRoute>
                        }
                    />

                    <Route

                        path="/settings"

                        element={

                            <PrivateRoute>

                                <Settings />

                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/messages"
                        element={
                            <PrivateRoute>
                                <Messages />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/settings/saved-posts"
                        element={
                     
                            <PrivateRoute>
                            
                                <SavedPosts />
                        
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/settings/my-activity"
                        element={
                        
                            <PrivateRoute>
                            
                                <MyActivity />
                        
                            </PrivateRoute>
                        }
                    />

                    {/* Notifications */}

                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />
                    
                    {/* INVALID ROUTE */}

                    <Route

                        path="*"

                        element={

                            <div
                                style={{

                                    minHeight:
                                    "100vh",

                                    display:
                                    "flex",

                                    justifyContent:
                                    "center",

                                    alignItems:
                                    "center",

                                    flexDirection:
                                    "column",

                                    background:
                                    "#000",

                                    color:
                                    "white"
                                }}
                            >

                                <h1
                                    style={{
                                        fontSize:
                                        "70px",

                                        marginBottom:
                                        "10px"
                                    }}
                                >

                                    404

                                </h1>

                                <p
                                    style={{
                                        color:
                                        "#aaa",

                                        marginBottom:
                                        "20px"
                                    }}
                                >

                                    Page Not Found

                                </p>

                                <button

                                    onClick={() => {

                                        window.location.href =
                                        isAuthenticated
                                        ?
                                        "/home"
                                        :
                                        "/login";
                                    }}

                                    className="auth-button"

                                    style={{
                                        width:
                                        "200px"
                                    }}
                                >

                                    Go Back

                                </button>

                            </div>
                        }
                    />

                </Routes>

            </main>

        </div>
    );
}

export default App;