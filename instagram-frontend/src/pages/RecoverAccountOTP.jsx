import {
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import API from "../api/axios";

import "../styles/auth.css";

function RecoverAccountOTP() {

    const navigate =
    useNavigate();

    const location =
    useLocation();

    const email =
    location.state?.email;

    const [otp, setOTP] =
    useState("");

    const [loading, setLoading] =
    useState(false);

    const [error, setError] =
    useState("");

    const [success, setSuccess] =
    useState("");

    // VERIFY OTP

    const handleVerifyOTP =
    async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        // VALIDATION

        if (!otp.trim()) {

            return setError(
                "OTP is required"
            );
        }

        try {

            setLoading(true);
            <button
                disabled={loading}
                className="recover-btn"
            >
                {
                    loading
                    ?
                    "Recovering..."
                    :
                    "Recover Account"
                }
            </button>
            const response =
            await API.post(

                "/auth/verify-recovery-otp",

                {
                    email,
                    otp
                }
            );

            setSuccess(
                response.data.message
            );

            // REDIRECT LOGIN

            setTimeout(() => {

                navigate("/login");

            }, 2000);

        } catch (error) {

            setError(

                error.response?.data?.message ||

                "OTP verification failed"
            );
        }

        finally {

            setLoading(false);
        }
    };

    return (

        <div className="auth-container">

            <div className="auth-card">

                {/* TITLE */}

                <h1 className="auth-title">

                    Recover Account

                </h1>

                <p className="auth-subtitle">

                    Enter the recovery OTP sent to your email

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

                {/* FORM */}

                <form
                    className="auth-form"
                    onSubmit={handleVerifyOTP}
                >

                    <input

                        type="text"

                        placeholder="Enter OTP"

                        className="auth-input"

                        value={otp}

                        onChange={(e) => {

                            setOTP(
                                e.target.value
                            );

                            setError("");
                        }}

                        maxLength={6}

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

                            "Verifying..."

                            :

                            "Recover Account"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}

export default RecoverAccountOTP;