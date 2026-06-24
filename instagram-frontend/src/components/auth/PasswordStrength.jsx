import { useState } from "react";

function PasswordStrength({

    password

}) {

    const [showRules, setShowRules] =
    useState(false);

    const validations = [

        password.length >= 8,

        /[A-Z]/.test(password),

        /[a-z]/.test(password),

        /[0-9]/.test(password),

        /[!@#$%^&*~?]/.test(password)
    ];

    const score =
    validations.filter(Boolean).length;

    let strengthText =
    "Weak";

    if (score >= 4)
        strengthText = "Strong";

    else if (score >= 3)
        strengthText = "Medium";

    if (!password)
        return null;

    return (

        <div className="password-strength-wrapper">

            <div className="password-header">

                <span>

                    Password Strength

                </span>

                <button

                    type="button"

                    className="password-info-btn"

                    onClick={() =>

                        setShowRules(
                            !showRules
                        )
                    }
                >

                    ⓘ

                </button>

            </div>

            <div className="password-strength-bar">

                <div

                    className={`password-strength-fill strength-${score}`}

                />

            </div>

            <div className="password-strength-text">

                Password Strength:
                <span> {strengthText}</span>

            </div>
            {

                showRules && (

                    <div className="password-rules">

                        <div
                            className={
                                password.length >= 8
                                ?
                                "rule-valid"
                                :
                                "rule-invalid"
                            }
                        >
                        
                            {
                                password.length >= 8
                                ? "✓ "
                                : "✗ "
                            }
                    
                            Minimum 8 characters
                        
                        </div>
                        
                        <div
                            className={
                                /[A-Z]/.test(password)
                                ?
                                "rule-valid"
                                :
                                "rule-invalid"
                            }
                        >
                        
                            {
                                /[A-Z]/.test(password)
                                ? "✓ "
                                : "✗ "
                            }
                    
                            One uppercase letter (A-Z)
                        
                        </div>
                        
                        <div
                            className={
                                /[a-z]/.test(password)
                                ?
                                "rule-valid"
                                :
                                "rule-invalid"
                            }
                        >
                        
                            {
                                /[a-z]/.test(password)
                                ? "✓ "
                                : "✗ "
                            }
                    
                            One lowercase letter (a-z)
                        
                        </div>
                        
                        <div
                            className={
                                /[0-9]/.test(password)
                                ?
                                "rule-valid"
                                :
                                "rule-invalid"
                            }
                        >
                        
                            {
                                /[0-9]/.test(password)
                                ? "✓ "
                                : "✗ "
                            }
                    
                            One number (0-9)
                        
                        </div>
                        
                        <div
                            className={
                                /[!@#$%^&*~?]/.test(password)
                                ?
                                "rule-valid"
                                :
                                "rule-invalid"
                            }
                        >
                        
                            {
                                /[!@#$%^&*~?]/.test(password)
                                ? "✓ "
                                : "✗ "
                            }
                    
                            One special character
                        
                        </div>
                        
                    </div>
                )
            }

        </div>
    );
}

export default PasswordStrength;