import {useEffect,useState} from "react";

import { useAuth } from "../context/AuthContext";

import {Link,useNavigate} from "react-router-dom";

import API from "../api/axios";

import PasswordInput from "../components/auth/PasswordInput";

import instagramLogo from "../icons/instagram_logo.svg";

import instagramWordmark from "../icons/instagram_wordmark.svg";

import "../styles/auth.css";

import {
    useAuthStore
}
from "../store/authStore";

function Login() {

    const navigate =
    useNavigate();

    const { login } =
    useAuth();

    // STATES

    const [formData, setFormData] =
    useState({

        emailOrUsername: "",

        password: ""
    });

    const token =
    useAuthStore(
        state => state.token
    );

    const [loading, setLoading] =
    useState(false);

    const [error, setError] =
    useState("");

    const [success, setSuccess] =
    useState("");

    const [recoverable, setRecoverable] =
    useState(false);

    const [recoveryEmail, setRecoveryEmail] =
    useState("");

    const [recoveryUsername, setRecoveryUsername] =
    useState("");

    //Already Logged in
    useEffect(() => {

        if(token){

            navigate(
                "/home",
                {
                    replace:true
                }
            );
        }

    }, [token,navigate]);
    // HANDLE INPUT

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
            e.target.value
        });

        setError("");

        setSuccess("");
    };

    // LOGIN

    const handleSubmit =
    async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        // VALIDATION

        if (

            !formData.emailOrUsername.trim() ||

            !formData.password.trim()

        ) {

            return setError(
                "All fields are required"
            );
        }

        try {

            setLoading(true);

            const response =
            await API.post(
            
                "/auth/login",
            
                {
                
                    emailOrUsername:
                    formData.emailOrUsername
                    .trim(),
                
                    password:
                    formData.password
                }
            );
            // SAVE TOKEN

            login(
                response.data.token,
                response.data.user
            );
            navigate(
                "/home",
                { replace: true }
            );

            setSuccess(
                "Login successful"
            );

            // REDIRECT

        } catch (error) {

            const data =
            error.response?.data;

            // RECOVERABLE ACCOUNT

            if (
                data?.recoverable
            ) {
            
                setRecoverable(true);
            
                setRecoveryEmail(
                    data.email
                );
            
                setRecoveryUsername(
                    data.username
                );
            
                setError("");
            
                return;
            }
        
            setError(
            
                data?.message ||
            
                "Invalid credentials"
            );
        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="login-page">

            {/* LEFT SECTION */}

            <div className="login-left">

                <div className="login-brand">

                    <div className="insta-logo">
                        <img
                            src={instagramLogo}
                            alt="Instagram Logo"
                        />                 
                    </div>

                    <h1>
                        See everyday moments from
                        <br />
                        your
                        <span> close friends.</span>
                    </h1>

                    <div className="preview-card">

                        <img
                            src="https://static.cdninstagram.com/rsrc.php/yN/r/-erGonz07kB.webp"
                            alt="preview"
                        />

                    </div>

                </div>

            </div>

            {/* RIGHT SECTION */}

            <div className="login-right">

                <div className="auth-card">

                {/* TITLE */}

                <div className="auth-title">

                    <img
                        src={instagramWordmark}
                        alt="Instagram"
                    />
                
                </div>

                <p className="auth-subtitle">

                    Log in to continue

                </p>

                {/* ERROR */}

                {

                    error && (

                        <div className="auth-error">

                            {error}

                        </div>
                    )
                }

                {/* SUCCESS */}

                {

                    success && (

                        <div className="auth-success">

                            {success}

                        </div>
                    )
                }
                
                {
                    recoverable && (
                    
                        <div className="recover-account-box">
                        
                            <h3>
                    
                                Recover Account
                    
                            </h3>
                    
                            <p>
                    
                                Your account
                                <b>
                                    {" "}
                                    @{recoveryUsername}
                                </b>
                                {" "}
                                is scheduled for deletion.
                    
                            </p>
                    
                            <button

                                className="recover-btn"
                    
                                onClick={async () => {
                                
                                    try {
                                    
                                        const response =
                                        await API.post(
                                        
                                            "/auth/send-recovery-otp",
                                        
                                            {
                                                email:
                                                recoveryEmail
                                            }
                                        );
                                    
                                        setSuccess(
                                            response.data.message
                                        );
                                    
                                        navigate(
                                            "/recover-account-otp",
                                            {
                                                state: {
                                                    email:
                                                    recoveryEmail
                                                }
                                            }
                                        );
                                    
                                    } catch (error) {
                                    
                                        setError(
                                        
                                            error.response?.data?.message ||
                                        
                                            "Failed to send recovery OTP"
                                        );
                                    }
                                }}
                            >
                            
                                Recover Account
                            
                            </button>
                            
                        </div>
                    )
                }
                
                {/* FORM */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    {/* EMAIL / USERNAME */}

                    <input

                        type="text"

                        name="emailOrUsername"

                        placeholder="Email or Username"

                        className="auth-input"

                        value={
                            formData.emailOrUsername
                        }

                        onChange={handleChange}

                        required
                    />

                    {/* PASSWORD */}

                    <PasswordInput

                        name="password"

                        value={formData.password}

                        onChange={handleChange}

                        placeholder="Password"
                    />

                    {/* BUTTON */}

                    <button

                        type="submit"

                        className="auth-button"

                        disabled={loading}
                    >

                        {

                            loading

                            ?

                            "Logging in..."

                            :

                            "Login"
                        }

                    </button>

                </form>

                {/* LINKS */}

                <div className="auth-links">

                    <Link
                        to="/forgot-password"
                        className="auth-link"
                    >
                        Forgot password?
                    </Link>

                    <Link
                        to="/register"
                        className="create-account-btn"
                    >
                        Create new account
                    </Link>

                </div>
            </div>

        </div>

    </div>

);
}

export default Login;