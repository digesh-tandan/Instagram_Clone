import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../api/axios";

import PasswordInput from "../components/auth/PasswordInput";

import PasswordStrength from "../components/auth/PasswordStrength";

import instagramWordmark from "../icons/instagram_wordmark.svg";

import BirthdayPicker from "../components/auth/BirthdayPicker";

function Register() {

    const navigate =
    useNavigate();

    const [formData, setFormData] =
    useState({

        name: "",

        username: "",

        email: "",

        birthday: "",

        password: "",

        confirmPassword: ""
    });

    const [loading, setLoading] =
    useState(false);

    const [error, setError] =
    useState("");

    const [success, setSuccess] =
    useState("");

    const [checkingUsername, setCheckingUsername] =
    useState(false);

    const [usernameAvailable, setUsernameAvailable] =
    useState(null);

    const [usernameSuggestions, setUsernameSuggestions] = useState([]);

    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const [passwordFocused, setPasswordFocused] =
    useState(false);

    const [confirmFocused, setConfirmFocused] =
    useState(false);

    const [registerSuccess, setRegisterSuccess] =
    useState(false);

    const [successOverlay, setSuccessOverlay] =
    useState(false);
    
    const [birthMonth, setBirthMonth] =
    useState("");
    
    const [birthDay, setBirthDay] =
    useState("");
    
    const [birthYear, setBirthYear] =
    useState("");

    const today =
    new Date();

    const maxBirthDate =
    new Date(

        today.getFullYear() - 14,

        today.getMonth(),

        today.getDate()

);
    // HANDLE INPUT

    const handleChange = (e) => {

        let {

            name,

            value

        } = e.target;

        if (

            name === "username"

        ) {

            value =

            value

            .toLowerCase()

            .replace(

                /[^a-z0-9._]/g,

                ""
            )

            .slice(
                0,
                30
            );
        }

        setFormData({

            ...formData,

            [name]:
            value
        });

        setError("");
    };

    // PASSWORD VALIDATION

    const passwordChecks = {

        length:
        formData.password.length >= 8,

        upper:
        /[A-Z]/.test(formData.password),

        lower:
        /[a-z]/.test(formData.password),

        number:
        /[0-9]/.test(formData.password),

        special:
        /[!@#$%^&*~?]/.test(formData.password)
    };

    const isPasswordValid = () => {

        return Object.values(
            passwordChecks
        ).every(Boolean);
    };

    // AGE VALIDATION

    const isAgeValid = () => {

        const today =
        new Date();

        const birthDate =
        new Date(
        
        `${birthYear}-${birthMonth}-${birthDay}`
        
        );

        let age =
        today.getFullYear() -
        birthDate.getFullYear();

        const month =
        today.getMonth() -
        birthDate.getMonth();

        if (

            month < 0 ||

            (
                month === 0 &&
                today.getDate() <
                birthDate.getDate()
            )

        ) {

            age--;
        }

        return age >= 14;
    };

    // Fetch Username Suggestions

    const fetchUsernameSuggestions =

    async (username) => {

        try {

            setLoadingSuggestions(true);

            const response =

            await API.get(

                `/auth/username-suggestions/${username}`
            );

            setUsernameSuggestions(

                response.data.suggestions
            );

        }

        catch (error) {

            console.log(error);
        }

        finally {

            setLoadingSuggestions(false);
        }
    };
    // USERNAME CHECK

    useEffect(() => {

        if (

            !formData.username ||

            formData.username.length < 3

        ) {

            setUsernameAvailable(null);

            return;
        }

        const timeout =

        setTimeout(async () => {

            try {

                setCheckingUsername(true);

                const response =

                await API.get(
                
                    `/auth/check-username/${formData.username}`
                
                );

                setUsernameAvailable(
                
                    response.data.available
                
                );

                if (

                    response.data.available === false

                ) {
                
                    fetchUsernameSuggestions(
                    
                        formData.username
                    );
                }

                else {
                
                    setUsernameSuggestions([]);
                
                }

            } catch (error) {

                setUsernameAvailable(null);

            } finally {

                setCheckingUsername(false);

            }

        }, 500);

        return () =>

            clearTimeout(timeout);

    },
    [
        formData.username
    ]);

    // BIRTHDAY VALIDATION

    useEffect(() => {

        if (

            !birthYear ||

            !birthMonth ||

            !birthDay

        ) {

            return;
        }

        const selectedDate =

        new Date(
        
            Number(birthYear),
        
            Number(birthMonth) - 1,
        
            Number(birthDay)
        
        );

        if (

            selectedDate >

            maxBirthDate

        ) {

            setError(

                "Minimum age must be 14 years old"

            );

        }

        else {

            setError("");

        }

    },
    [
        birthYear,
        birthMonth,
        birthDay
    ]);
    useEffect(() => {
    
        if (
        
            birthDay &&
        
            Number(birthDay) >
        
            getDaysInMonth()
        
        ) {
        
            setBirthDay("");
        }
    
    }, [
    
        birthMonth,
    
        birthYear
    ]);
    useEffect(() => {

        if (
        
            Number(birthYear) ===
        
            maxBirthDate.getFullYear()
        
        ) {
        
            const maxMonth =
        
            maxBirthDate.getMonth() + 1;
        
            if (
            
                Number(birthMonth) >
            
                maxMonth
            
            ) {
            
                setBirthMonth("");
            
                setBirthDay("");
            }
        }
    
    }, [
    
        birthYear,
    
        birthMonth
    ]);
    // REGISTER
    const isBirthdayValid =
    () => {

        if (

            !birthDay ||

            !birthMonth ||

            !birthYear

        ) {

            return false;
        }

        const selectedDate =
        new Date(

            Number(birthYear),

            Number(birthMonth) - 1,

            Number(birthDay)

        );

        return (
            selectedDate <=
            maxBirthDate
        );
    };

    const handleRegister =
    async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        // USERNAME

        if (
            usernameAvailable !== true
        ) {
        
            return setError(
                "The username is not available."
            );
        }
        // PASSWORD MATCH

        if (

            formData.password !==
            formData.confirmPassword

        ) {

            return setError(
                "Passwords do not match"
            );
        }

        // PASSWORD VALID

        if (
            !isPasswordValid()
        ) {

            return setError(
                "Password is too weak"
            );
        }

        // AGE VALID
        const birthday =

        `${birthYear}-${
        birthMonth
        .toString()
        .padStart(2,"0")
        }-${
        birthDay
        .toString()
        .padStart(2,"0")
        }`;
        if (
            !isBirthdayValid()
        ) {
        
            return setError(
                "Minimum age must be 14 years old"
            );
        }

        try {

            setLoading(true);

            const response =
            await API.post(

                "/auth/register",

                {

                    name:
                    formData.name,

                    username:
                    formData.username,

                    email:
                    formData.email,

                    birthday,

                    password:
                    formData.password
                }
            );

            setSuccess(
                response.data.message
            );
            
            setSuccessOverlay(true);
            
            setTimeout(() => {
            
                navigate(
                
                    "/verify-otp",
                    {
                        state: {
                        
                            email:
                            formData.email,
                        
                            username:
                            formData.username,
                        
                            registerFlow:
                            true
                        }
                    }
                );
            
            }, 1500);

        } catch (error) {

            setError(

                error.response?.data?.message ||

                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };

    // MAX DATE

    const maxDate = () => {

        const today =
        new Date();

        today.setFullYear(
            today.getFullYear() - 14
        );

        return today
        .toISOString()
        .split("T")[0];
    };

    const months = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const getAvailableMonths = () => {

        if (

            Number(birthYear) ===

            maxBirthDate.getFullYear()

        ) {

            return months.slice(

                0,

                maxBirthDate.getMonth() + 1

            );
        }

        return months;
    };
    const getDaysInMonth = () => {

        if (!birthMonth) {

            return 31;
        }

        const year =

        Number(birthYear) ||

        maxBirthDate.getFullYear();

        let maxDays =

        new Date(

            year,

            Number(birthMonth),

            0

        ).getDate();

        if (

            Number(birthYear) ===

            maxBirthDate.getFullYear()

            &&

            Number(birthMonth) ===

            maxBirthDate.getMonth() + 1

        ) {

            maxDays = Math.min(

                maxDays,

                maxBirthDate.getDate()

            );
        }

        return maxDays;
    };

    const days = Array.from(

        {

            length:
            getDaysInMonth()
        },

        (_, index) => index + 1
    );

    const years = [];

    for (

        let year =
        maxBirthDate.getFullYear();

        year >= 1900;

        year--

    ) {

        years.push(year);
    }

    return (

        <div className="auth-container register-page">

            <div className="auth-card register-card">

                <div className="register-header">

                    <img
                        src={instagramWordmark}
                        alt="Instagram"
                        className="register-wordmark"
                    />

                    <p className="register-subtitle">

                        Create your account and start sharing moments.

                    </p>
                </div>

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
                    onSubmit={handleRegister}
                >

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="auth-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <div className="username-input-wrapper">

                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className={`auth-input username-input ${
                                usernameAvailable === true
                                ? "username-valid"
                                : usernameAvailable === false
                                ? "username-invalid"
                                : ""
                            }`}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        {
                            formData.username && (
                            
                                <span className="username-counter-inside">
                                
                                    {formData.username.length}/30
                            
                                </span>
                            )
                        }

                        {
                            usernameAvailable === true &&
                        
                            <span className="username-icon valid">
                                ✓
                            </span>
                        }

                        {
                            usernameAvailable === false &&
                        
                            <span className="username-icon invalid">
                                ✕
                            </span>
                        }

                    </div>
                    {
                        formData.username.length >= 3 && (
                        
                            <div className="username-status">
                            
                                {
                                
                                    checkingUsername ?

                                    (
                                        <span
                                            className="checking-username"
                                        >
                                        
                                            <span
                                                className="checking-spinner"
                                            />

                                            Checking username...
                                    
                                        </span>
                                    )
                                
                                    :
                                
                                    usernameAvailable === true ?
                                
                                    (
                                    
                                        <span
                                            style={{
                                                color:"#00c853"
                                            }}
                                        >
                                        
                                            ✓ Username available
                                        
                                        </span>
                                    )
                                
                                    :
                                
                                    usernameAvailable === false ?
                                
                                    (
                                    
                                        <span
                                            style={{
                                                color:"#ff4d4f"
                                            }}
                                        >
                                        
                                            Username taken.
                                            Try one below.
                                        
                                        </span>
                                    )
                                
                                    :
                                
                                    null
                                
                                }
                            </div>
                            
                        )
                    }
                    
                    <div className="username-rules">

                        Allowed:
                        a-z • 0-9 • _ • .

                    </div>
                    
                    {
                        usernameAvailable === false &&

                        usernameSuggestions.length > 0 && (
                        
                            <div className="username-suggestions-wrapper">
                            
                                <div className="suggestions-header">
                        
                                    <span>
                        
                                        Suggested for you
                        
                                    </span>
                        
                                    <button

                                        type="button"
                        
                                        className="refresh-suggestions"
                        
                                        onClick={() =>
                                        
                                            fetchUsernameSuggestions(
                                            
                                                formData.username
                                            )
                                        }
                                    >
                                    
                                        ↻
                                    
                                    </button>
                                    
                                </div>
                                    
                                <div className="username-suggestions">
                                    
                                    {
                                    
                                        usernameSuggestions.map(
                                        
                                            suggestion => (
                                            
                                                <button
                                            
                                                    key={suggestion}
                                            
                                                    type="button"
                                            
                                                    className="username-chip"
                                            
                                                    onClick={() => {
                                                    
                                                        setFormData({
                                                        
                                                            ...formData,
                                                        
                                                            username:
                                                            suggestion
                                                        });
                                                    
                                                        setUsernameAvailable(
                                                            null
                                                        );
                                                    
                                                    }}
                                                >
                                                
                                                    {suggestion}
                                                
                                                </button>
                                            )
                                        )
                                    }

                                </div>
                                
                                {
                                
                                    loadingSuggestions && (
                                    
                                        <div
                                            className="suggestions-loading"
                                        >
                                        
                                            Generating new suggestions...
                                    
                                        </div>
                                    )
                                }

                            </div>
                        )
                    }

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="auth-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                        <div className="birthday-section">
                                    
                            <label className="birthday-label">
                                        
                                Birthday
                                        
                            </label>
                                        
                            <p className="birthday-helper">
                                        
                                Select your date of birth
                                        
                            </p>
                                        
                            <BirthdayPicker

                                birthMonth={birthMonth}
                                setBirthMonth={setBirthMonth}

                                birthDay={birthDay}
                                setBirthDay={setBirthDay}

                                birthYear={birthYear}
                                setBirthYear={setBirthYear}

                                days={days}
                                years={years}

                                getAvailableMonths={getAvailableMonths}

                            />
                            <div className="birthday-info">

                                ⓘ Minimum age required: 14 years

                            </div>
                                
                        </div>

                    <PasswordInput

                        name="password"
                                    
                        value={formData.password}
                                    
                        onChange={handleChange}
                                    
                        onFocus={() =>
                            setPasswordFocused(true)
                        }
                    
                        onBlur={() =>
                            setPasswordFocused(false)
                        }
                    
                        placeholder="Create Password"
                    />
                    {/* PASSWORD CHECK PANEL */}

                    {
                        formData.password && (
                        
                            <PasswordStrength
                                password={formData.password}
                            />
                        
                        )
                    }

                    <PasswordInput

                        name="confirmPassword"

                        value={formData.confirmPassword}

                        onChange={handleChange}

                        onFocus={() =>
                            setConfirmFocused(true)
                        }
                    
                        onBlur={() =>
                            setConfirmFocused(false)
                        }
                    
                        placeholder="Confirm Password"
                    
                        isValid={
                            formData.confirmPassword
                            ?
                            formData.password ===
                            formData.confirmPassword
                            :
                            null
                        }
                    />
                    {
                        formData.confirmPassword && (
                        
                            <div
                                className={
                                    formData.password ===
                                    formData.confirmPassword
                                
                                    ?
                                
                                    "password-match success"
                                
                                    :
                                
                                    "password-match error"
                                }
                            >
                            
                                {
                                    formData.password ===
                                    formData.confirmPassword
                                
                                    ?
                                
                                    "✓ Passwords match"
                                
                                    :
                                
                                    "✕ Passwords do not match"
                                }

                            </div>
                        )
                    }
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {

                            loading

                            ?

                            "Creating Account..."

                            :

                            "Create your account"
                        }

                    </button>

                </form>

                <div className="auth-divider">

                    <span>Already have an account?</span>

                </div>

                <div className="auth-switch">

                    <Link
                        to="/login"
                        className="login-link-modern"
                    >
                    
                        Log In

                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;