import { Link } from "react-router-dom";

function AuthSuccess() {

    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1 className="auth-title">
                    Success 🎉
                </h1>

                <p
                    className="auth-subtitle"
                    style={{
                        marginTop: "10px",
                        lineHeight: "1.6"
                    }}
                >
                    Your account action
                    completed successfully.
                </p>

                <Link to="/login">

                    <button
                        className="auth-button"
                        style={{
                            marginTop: "20px"
                        }}
                    >
                        Go To Login
                    </button>

                </Link>

            </div>

        </div>
    );
}

export default AuthSuccess;