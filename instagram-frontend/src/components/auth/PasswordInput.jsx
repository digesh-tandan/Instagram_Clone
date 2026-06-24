import {
    useState
} from "react";

import {
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

function PasswordInput({

    name,
    value,
    onChange,
    placeholder,

    onFocus,
    onBlur,

    isValid = null

}) {

    const [showPassword, setShowPassword] =
    useState(false);

    return (

        <div
            style={{
                position: "relative",
                marginBottom: "14px"
            }}
        >

            <input

                type={
                    showPassword
                    ?
                    "text"
                    :
                    "password"
                }

                name={name}

                value={value}

                onChange={onChange}

                onFocus={onFocus}

                onBlur={onBlur}

                placeholder={placeholder}

                className="auth-input"

                required
            />

            <div
                style={{

                    position: "absolute",

                    right: "15px",

                    top: "50%",

                    transform:
                    "translateY(-50%)",

                    display: "flex",

                    alignItems: "center",

                    gap: "10px"
                }}
            >

                {
                    isValid !== null && (

                        <span
                            style={{

                                color:

                                isValid

                                ?

                                "#00d26a"

                                :

                                "#ff4d4d",

                                fontSize:
                                "16px",

                                fontWeight:
                                "bold"
                            }}
                        >

                            {

                                isValid

                                ?

                                "✓"

                                :

                                "✖"
                            }

                        </span>
                    )
                }

                <button

                    type="button"

                    onClick={() =>

                        setShowPassword(
                            !showPassword
                        )
                    }

                    style={{

                        background:
                        "transparent",

                        color:
                        "#999",

                        border:
                        "none",

                        cursor:
                        "pointer",

                        display:
                        "flex",

                        alignItems:
                        "center",

                        justifyContent:
                        "center",

                        padding: 0
                    }}
                >

                    {
                        showPassword
                        ?
                        <FaEyeSlash />
                        :
                        <FaEye />
                    }

                </button>

            </div>

        </div>
    );
}

export default PasswordInput;