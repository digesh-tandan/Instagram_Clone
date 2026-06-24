import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../api/axios";

function ForgotPassword() {

    const navigate =
    useNavigate();

    const [emailOrUsername, setEmailOrUsername] =
    useState("");

    const [error, setError] =
    useState("");

    const [success, setSuccess] =
    useState("");

    const [loading, setLoading] =
    useState(false);

    // SEND OTP

    const handleSubmit =
    async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        if (!emailOrUsername.trim()) {

            return setError(

                "Email or username is required"
            );
        }

        try {

            setLoading(true);

            const response =
            await API.post(

                "/auth/forgot-password",

                {
                    emailOrUsername
                }
            );

            setSuccess(
                response.data.message
            );

            // NAVIGATE TO OTP PAGE

            navigate(
                "/verify-otp",
                {
                    state: {
                    
                        email:
                        response.data.email,
                    
                        username:
                        response.data.username,
                    
                        profilePhoto:
                        response.data.profilePhoto,
                    
                        forgotPassword:
                        true
                    }
                }
            );

        } catch (error) {

            setError(

                error.response?.data?.message ||

                "Failed to send OTP"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1 className="auth-title">

                    Forgot Password

                </h1>

                <p className="auth-subtitle">

                    Enter your email or username
                    to receive OTP

                </p>

                {

                    error && (

                        <div className="auth-error">

                            {error}

                        </div>
                    )
                }

                {

                    success && (

                        <div className="auth-success">

                            {success}

                        </div>
                    )
                }

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <input

                        type="text"

                        placeholder="Email or Username"

                        className="auth-input"

                        value={emailOrUsername}

                        onChange={(e) =>

                            setEmailOrUsername(
                                e.target.value
                            )
                        }

                        required
                    />

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {

                            loading

                            ?

                            "Sending OTP..."

                            :

                            "Send OTP"
                        }

                    </button>

                </form>

                <div className="auth-links">

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

export default ForgotPassword;