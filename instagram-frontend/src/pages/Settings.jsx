import {
    useState,
    useEffect
} from "react";

import {
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import {
    useNavigate,
    Link
} from "react-router-dom";

import API from "../api/axios";

import {
    Shield,
    KeyRound,
    Trash2,
    ChevronRight
} from "lucide-react";

import "../styles/settings.css";

import { useAuthStore }
from "../store/authStore";

function Settings() {

    const navigate =
    useNavigate();

    const user =
    useAuthStore(
        state => state.user
    );

    const logoutAuth =
    useAuthStore(
        state => state.logoutAuth
    );

    // PASSWORD VISIBILITY

    const [showCurrent, setShowCurrent] =
    useState(false);

    const [showNew, setShowNew] =
    useState(false);

    const [showConfirm, setShowConfirm] =
    useState(false);

    const [showDelete, setShowDelete] =
    useState(false);

    // STATES

    const [loading, setLoading] =
    useState(false);

    const [message, setMessage] =
    useState("");

    const [error, setError] =
    useState("");

    useEffect(() => {

        if(message){

                const timer =
                setTimeout(() => {
                
                    setMessage("");
                
                },10000);
            
                return () => clearTimeout(timer);
            }
        
        }, [message]);

        useEffect(() => {
        
            if(error){
            
                const timer =
                setTimeout(() => {
                
                    setError("");
                
                },10000);
            
                return () => clearTimeout(timer);
            }
        
        }, [error]);

    const [showDeleteOTP, setShowDeleteOTP] =
    useState(false);

    const [otp, setOTP] =
    useState("");

    const [deletePassword, setDeletePassword] =
    useState("");

    const [passwordData, setPasswordData] =
    useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // CHANGE PASSWORD

    const handlePasswordChange =
    async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        try {

            setLoading(true);

            const response =
            await API.put(
                "/auth/change-password",
                passwordData
            );

            setMessage(
                response.data.message
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to change password"
            );

        } finally {

            setLoading(false);
        }
    };

    // DELETE REQUEST

    const handleDeleteRequest = async () => {

        setError("");
        setMessage("");

        try {

            setLoading(true);

            const currentUser = user;

            const response =
            await API.post(
                "/auth/request-delete-account",
                {
                    emailOrUsername:
                    currentUser.email,

                    password:
                    deletePassword
                }
            );

            setShowDeleteOTP(true);

            setMessage(
                response.data.message
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to send delete OTP"
            );

        } finally {

            setLoading(false);
        }
    };
    // VERIFY DELETE OTP

    const handleVerifyDeleteOTP =
    async () => {

        setError("");
        setMessage("");

        try {

            setLoading(true);
            
            const currentUser = user;

            const response =
            await API.post(
                "/auth/verify-delete-account-otp",
                {
                    email:
                    currentUser.email,
                
                    otp:
                    otp
                }
            );

            setMessage(
                response.data.message
            );

            logoutAuth();

            setTimeout(() => {

                navigate("/login");

            }, 2000);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "OTP verification failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="settings-page">

            <div className="settings-container">

                {/* HEADER */}

                <div className="settings-header">

                    <h1>
                        Account Center
                    </h1>

                    <p>
                        Manage your profile,
                        privacy, security and
                        account preferences.
                    </p>

                </div>

                {/* ALERTS */}

                {
                    message && (

                        <div className="settings-success">
                            {message}
                        </div>
                    )
                }

                {
                    error && (

                        <div className="settings-error">
                            {error}
                        </div>
                    )
                }

                {/* ACCOUNT */}

                <div className="settings-card">

                    <div className="settings-card-title">

                        <Shield size={22} />

                        <h2>
                            Account
                        </h2>

                    </div>

                    <button
                        className="settings-option"
                        onClick={() =>
                            navigate("/edit-profile")
                        }
                    >
                        <div>
                            <h3>
                                Edit Profile
                            </h3>

                            <p>
                                Update your profile information
                            </p>
                        </div>

                        <ChevronRight size={22} />
                    </button>

                    <button
                        className="settings-option"
                        onClick={() =>
                            navigate("/settings/saved-posts")
                        }
                    >
                    
                        <div>
                    
                            <h3>
                                Saved Posts
                            </h3>
                    
                            <p>
                                View all saved posts
                            </p>
                    
                        </div>
                    
                        <ChevronRight size={22} />
                    
                    </button>
                    
                    <button
                        className="settings-option"
                        onClick={() =>
                            navigate("/settings/my-activity")
                        }
                    >
                    
                        <div>
                    
                            <h3>
                                My Activity
                            </h3>
                    
                            <p>
                                View your all likes and comments
                            </p>
                    
                        </div>
                    
                        <ChevronRight size={22} />
                    
                    </button>

                </div>

                {/* SECURITY */}

                <div className="settings-card">

                    <div className="settings-card-title">

                        <KeyRound size={22} />

                        <h2>
                            Security
                        </h2>

                    </div>

                    <form
                        onSubmit={handlePasswordChange}
                    >

                        {/* CURRENT */}

                        <div className="password-wrapper">

                            <input
                                type={
                                    showCurrent
                                    ? "text"
                                    : "password"
                                }
                                placeholder="Current Password"
                                className="settings-input"
                                value={
                                    passwordData.currentPassword
                                }
                                onChange={(e)=>
                                    setPasswordData({
                                        ...passwordData,
                                        currentPassword:
                                        e.target.value
                                    })
                                }
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={()=>
                                    setShowCurrent(
                                        !showCurrent
                                    )
                                }
                            >

                                {
                                    showCurrent
                                    ?
                                    <FaEyeSlash />
                                    :
                                    <FaEye />
                                }

                            </button>

                        </div>

                        {/* NEW */}

                        <div className="password-wrapper">

                            <input
                                type={
                                    showNew
                                    ? "text"
                                    : "password"
                                }
                                placeholder="New Password"
                                className="settings-input"
                                value={
                                    passwordData.newPassword
                                }
                                onChange={(e)=>
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword:
                                        e.target.value
                                    })
                                }
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={()=>
                                    setShowNew(
                                        !showNew
                                    )
                                }
                            >

                                {
                                    showNew
                                    ?
                                    <FaEyeSlash />
                                    :
                                    <FaEye />
                                }

                            </button>

                        </div>

                        {/* CONFIRM */}

                        <div className="password-wrapper">

                            <input
                                type={
                                    showConfirm
                                    ? "text"
                                    : "password"
                                }
                                placeholder="Confirm Password"
                                className="settings-input"
                                value={
                                    passwordData.confirmPassword
                                }
                                onChange={(e)=>
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword:
                                        e.target.value
                                    })
                                }
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={()=>
                                    setShowConfirm(
                                        !showConfirm
                                    )
                                }
                            >

                                {
                                    showConfirm
                                    ?
                                    <FaEyeSlash />
                                    :
                                    <FaEye />
                                }

                            </button>

                        </div>

                        <button
                            type="submit"
                            className="settings-btn"
                            disabled={loading}
                        >

                            {
                                loading
                                ?
                                "Updating..."
                                :
                                "Change Password"
                            }

                        </button>

                    </form>

                </div>

                {/* DANGER ZONE */}

                <div className="settings-card danger-card">

                    <div className="settings-card-title danger-title">

                        <Trash2 size={22} />

                        <h2>
                            Danger Zone
                        </h2>

                    </div>

                    <p className="danger-text">

                        Your account can be recovered
                        for 30 days after deletion.

                    </p>

                    {
                        !showDeleteOTP ? (

                            <>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showDelete
                                            ? "text"
                                            : "password"
                                        }
                                        placeholder="Enter Password"
                                        className="settings-input"
                                        value={deletePassword}
                                        onChange={(e)=>
                                            setDeletePassword(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={()=>
                                            setShowDelete(
                                                !showDelete
                                            )
                                        }
                                    >

                                        {
                                            showDelete
                                            ?
                                            <FaEyeSlash />
                                            :
                                            <FaEye />
                                        }

                                    </button>

                                </div>

                                <button
                                    className="danger-btn"
                                    onClick={handleDeleteRequest}
                                    disabled={loading}
                                >

                                    {
                                        loading
                                        ?
                                        "Sending OTP..."
                                        :
                                        "Request Delete Account"
                                    }

                                </button>

                            </>

                        ) : (

                            <>

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="settings-input"
                                    value={otp}
                                    onChange={(e)=>
                                        setOTP(
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    className="danger-btn"
                                    onClick={handleVerifyDeleteOTP}
                                    disabled={loading}
                                >

                                    {
                                        loading
                                        ?
                                        "Verifying..."
                                        :
                                        "Verify & Delete Account"
                                    }

                                </button>

                            </>
                        )
                    }

                </div>

            </div>

        </div>
    );
}

export default Settings;