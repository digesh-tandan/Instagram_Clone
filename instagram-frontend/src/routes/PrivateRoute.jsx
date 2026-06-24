import {

    Navigate,
    useLocation

} from "react-router-dom";

import {

    useAuth

} from "../context/AuthContext";

function PrivateRoute({
    children
}) {

    const {

        isAuthenticated,
        loading

    } = useAuth();

    const location =
    useLocation();

    // LOADING STATE

    if (loading) {

        return (

            <div
                style={{

                    minHeight:
                    "100vh",

                    display:
                    "flex",

                    justifyContent:
                    "center",

                    alignItems:
                    "center",

                    background:
                    "#000",

                    color:
                    "white",

                    fontSize:
                    "20px",

                    fontWeight:
                    "600"
                }}
            >

                Loading...

            </div>
        );
    }

    // NOT AUTHENTICATED

    if (!isAuthenticated) {

        return (

            <Navigate

                to="/login"

                state={{
                    from: location
                }}

                replace
            />
        );
    }

    // AUTHORIZED

    return children;
}

export default PrivateRoute;