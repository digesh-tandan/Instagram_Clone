import {
    useState,
    useEffect
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import API from "../api/axios";

function VerifyOTP() {

    const navigate =
    useNavigate();

    const location =
    useLocation();

    const email =
    location.state?.email;

    const username =
    location.state?.username;

    const profilePhoto =
    location.state?.profilePhoto;

    const forgotPassword =
    location.state?.forgotPassword;

    const [otp, setOtp] =
    useState([
        "", "", "",
        "", "", ""
    ]);

    const [message, setMessage] =
    useState("");

    const [messageType, setMessageType] =
    useState("");

    const [loading, setLoading] =
    useState(false);

    const [resendLoading, setResendLoading] =
    useState(false);
    
    const [countdown, setCountdown] =
    useState(60);

    // AUTO HIDE MESSAGE

    useEffect(() => {

        if (message) {

            const timer =
            setTimeout(() => {

                setMessage("");
                setMessageType("");

            }, 3000);

            return () =>
            clearTimeout(timer);
        }

    }, [message]);

    // RESEND COUNTDOWN

    useEffect(() => {

        if (countdown <= 0)
            return;

        const timer =
        setInterval(() => {

            setCountdown(

                prev => prev - 1
            );

        }, 1000);

        return () =>

            clearInterval(timer);

    }, [countdown]);

    // INVALID ACCESS

    if (!email) {

        navigate("/login");

        return null;
    }

    // OTP CHANGE

    const handleOTPChange = (
        value,
        index
    ) => {

        if (
            !/^\d?$/.test(value)
        ) {
            return;
        }

        const newOtp =
        [...otp];

        newOtp[index] =
        value;

        setOtp(newOtp);

        if (
            value &&
            index < 5
        ) {

            document
            .getElementById(
                `otp-${index + 1}`
            )
            ?.focus();
        }
    };

    // BACKSPACE

    const handleKeyDown = (
        e,
        index
    ) => {

        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {

            document
            .getElementById(
                `otp-${index - 1}`
            )
            ?.focus();
        }
    };

    // PASTE OTP

    const handlePaste =
    (e) => {

        const pasted =
        e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

        if (
            pasted.length === 6
        ) {

            setOtp(
                pasted.split("")
            );
        }
    };

    // VERIFY OTP

    const handleSubmit =
    async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");

        const finalOTP =
        otp.join("");

        if (
            finalOTP.length !== 6
        ) {

            setMessage(
                "Please enter all 6 digits"
            );

            setMessageType(
                "error"
            );

            return;
        }

        try {

            setLoading(true);

            // FORGOT PASSWORD FLOW

            if (forgotPassword) {

                await API.post(

                    "/auth/verify-reset-otp",

                    {
                        email,
                        otp: finalOTP
                    }
                );

                navigate(

                    "/reset-password",

                    {
                        state: {
                            email,
                            username,
                            profilePhoto
                        }
                    }
                );

            } else {

                // REGISTER FLOW

                await API.post(

                    "/auth/verify-register-otp",

                    {
                        email,
                        otp: finalOTP
                    }
                );

                navigate(

                    "/auth-success",

                    {
                        state: {
                            username
                        }
                    }
                );
            }

        } catch (error) {

            setMessage(

                error.response?.data?.message ||

                "Invalid OTP. Please try again"
            );

            setMessageType(
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    // RESEND OTP

    const handleResendOTP =
    async () => {

        try {

            setMessage("");
            setMessageType("");

            setResendLoading(true);

            if (forgotPassword) {

                await API.post(
                    "/auth/forgot-password",
                    {
                        emailOrUsername: email
                    }
                );
            
            } else {
            
                await API.post(
                    "/auth/resend-register-otp",
                    {
                        email
                    }
                );
            }

            setMessage(
                "A OTP has been sent"
            );
            setCountdown(60);
            setMessageType(
                "success"
            );

        } catch (error) {

            setMessage(

                error.response?.data?.message ||

                "Failed to resend OTP"
            );

            setMessageType(
                "error"
            );

        } finally {

            setResendLoading(false);
        }
    };

    return (

        <div className="auth-container">

            <div className="auth-card otp-card">

                {/* PROFILE */}

                <div className="otp-profile">

                    <img

                        src={
                            profilePhoto ||

                            `https://ui-avatars.com/api/?name=${username || "User"}&background=0095f6&color=fff`
                        }

                        alt="profile"

                        className="otp-avatar"
                    />

                    <h3>

                        {
                            username

                            ?

                            `@${username}`

                            :

                            "Instagram User"
                        }

                    </h3>

                </div>

                {/* HEADING */}

                <h1 className="otp-heading">

                    Verify it's really you

                </h1>

                <p className="otp-info">

                    OTP has been sent to your
                    email address

                </p>

                {/* MESSAGE */}

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
                    onSubmit={handleSubmit}
                >

                    <div

                        className="otp-container"

                        onPaste={handlePaste}
                    >

                        {otp.map(

                            (
                                digit,
                                index
                            ) => (

                                <input

                                    key={index}

                                    id={`otp-${index}`}

                                    type="text"

                                    value={digit}

                                    maxLength="1"

                                    className="otp-box"

                                    onChange={(e) =>

                                        handleOTPChange(

                                            e.target.value,

                                            index
                                        )
                                    }

                                    onKeyDown={(e) =>

                                        handleKeyDown(

                                            e,

                                            index
                                        )
                                    }
                                />
                            )
                        )}

                    </div>

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

                            "Verify OTP"
                        }

                    </button>

                </form>

                {/* RESEND */}

                <div
                    className="otp-resend-section"
                >

                    Didn't receive the code?

                    <button

                        onClick={handleResendOTP}

                        className="otp-resend-btn"

                        disabled={
                            resendLoading ||
                            countdown > 0
                        }
                    >

                        {
                            resendLoading

                            ?

                            "Sending..."

                            :

                            countdown > 0

                            ?

                            `Resend in ${countdown}s`

                            :

                            "Resend OTP"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}

export default VerifyOTP;