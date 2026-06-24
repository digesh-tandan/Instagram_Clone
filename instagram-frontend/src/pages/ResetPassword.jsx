import "../styles/ResetPassword.css";

import {
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import API from "../api/axios";

import PasswordInput from "../components/auth/PasswordInput";
import PasswordStrength from "../components/auth/PasswordStrength";

function ResetPassword() {

    const navigate =
    useNavigate();

    const location =
    useLocation();

    const email =
    location.state?.email;

    const username =
    location.state?.username || "instagram_user";

    const profilePhoto =
    location.state?.profilePhoto;

    if (!email) {

        navigate("/forgot-password");

        return null;
    }

    const [newPassword, setNewPassword] =
    useState("");

    const [confirmPassword, setConfirmPassword] =
    useState("");

    const [message, setMessage] =
    useState("");

    const [messageType, setMessageType] =
    useState("");

    const [loading, setLoading] =
    useState(false);

    const passwordChecks = {

        length:
        newPassword.length >= 8,

        upper:
        /[A-Z]/.test(newPassword),

        lower:
        /[a-z]/.test(newPassword),

        number:
        /[0-9]/.test(newPassword),

        special:
        /[!@#$%^&*~?]/.test(newPassword)
    };

    const isPasswordValid = () => {

        return Object.values(
            passwordChecks
        ).every(Boolean);
    };

    const handleSubmit =
    async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (!isPasswordValid()) {

            setMessage(
                "Password is too weak"
            );

            setMessageType(
                "error"
            );

            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {

            setMessage(
                "Passwords do not match"
            );

            setMessageType(
                "error"
            );

            return;
        }

        try {

            setLoading(true);

            const response =
            await API.post(

                "/auth/create-new-password",

                {
                    email,
                    newPassword,
                    confirmPassword
                }
            );

            setMessage(
                response.data.message
            );

            setMessageType(
                "success"
            );

            setTimeout(() => {

                navigate(
                    "/login"
                );

            }, 2500);

        } catch (error) {

            setMessage(

                error.response?.data?.message ||

                "Password reset failed"
            );

            setMessageType(
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="auth-container">

            <div className="auth-card reset-card">

                {/* PROFILE */}

                <div className="reset-profile">

                    <img

                        src={
                            profilePhoto ||

                            `https://ui-avatars.com/api/?name=${username}&background=0095f6&color=fff`
                        }

                        alt="profile"

                        className="reset-avatar"
                    />

                    <h3>

                        @{username}

                    </h3>

                </div>

                {/* SECURITY BADGE */}

                <div
                    className="security-badge"
                >

                    🔒 Secure Password Reset

                </div>

                {/* TITLE */}

                <h1
                    className="reset-heading"
                >

                    Create New Password

                </h1>

                <p
                    className="reset-subtitle"
                >

                    Your identity has been
                    verified.

                    <br />

                    Create a strong password
                    to keep your account safe.

                </p>

                {/* ALERT */}

                {message && (

                    <div

                        className={

                            messageType === "error"

                            ?

                            "auth-error"

                            :

                            "auth-success"
                        }
                    >

                        {message}

                    </div>
                )}

                {/* FORM */}

                <form

                    className="auth-form"

                    onSubmit={
                        handleSubmit
                    }
                >

                    <PasswordInput

                        name="newPassword"

                        value={
                            newPassword
                        }

                        onChange={(e) =>

                            setNewPassword(
                                e.target.value
                            )
                        }

                        placeholder="New Password"
                    />

                    {newPassword && (

                        <div
                            className="password-panel"
                        >

                            <PasswordStrength

                                password={
                                    newPassword
                                }
                            />

                        </div>
                    )}

                    <PasswordInput

                        name="confirmPassword"

                        value={
                            confirmPassword
                        }

                        onChange={(e) =>

                            setConfirmPassword(
                                e.target.value
                            )
                        }

                        placeholder="Confirm Password"
                    />

                    {confirmPassword && (

                        <div

                            style={{

                                fontSize:
                                "13px",

                                marginBottom:
                                "15px",

                                fontWeight:
                                "600",

                                color:

                                newPassword ===
                                confirmPassword

                                ?

                                "#00ff88"

                                :

                                "#ff4d4d"
                            }}
                        >

                            {

                                newPassword ===
                                confirmPassword

                                ?

                                "✔ Passwords match"

                                :

                                "✖ Passwords do not match"
                            }

                        </div>
                    )}

                    <button

                        type="submit"

                        className="auth-button"

                        disabled={loading}
                    >

                        {

                            loading

                            ?

                            "Updating Password..."

                            :

                            "Reset Password"
                        }

                    </button>

                </form>

                {/* FOOTER */}

                <div
                    className="auth-links"
                >

                    <Link

                        to="/login"

                        className="auth-link"
                    >

                        Back to Login

                    </Link>

                </div>

            </div>

        </div>
    );
}

export default ResetPassword;