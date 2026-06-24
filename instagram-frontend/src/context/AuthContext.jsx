import {

    createContext,
    useContext,
    useEffect,
    useMemo,
    useState

} from "react";

import {
    useAuthStore
}
from "../store/authStore";

// CREATE CONTEXT

const AuthContext =
createContext();

// PROVIDER

export const AuthProvider = ({
    children
}) => {

    // STATES

    const user =
    useAuthStore(
        state => state.user
    );

    const token =
    useAuthStore(
        state => state.token
    );

    const loading =
    useAuthStore(
        state => state.loading
    );

    const setAuth =
    useAuthStore(
        state => state.setAuth
    );

    const logoutAuth =
    useAuthStore(
        state => state.logoutAuth
    );

    const setLoading =
    useAuthStore(
        state => state.setLoading
    );

    // LOGIN

    const login = (
        authToken,
        userData
    ) => {

        setAuth(
            userData,
            authToken
        );
    };

    // LOGOUT

    const logout = () => {

        logoutAuth();
    };
    // AUTH STATUS

    const isAuthenticated =
    !!token;
    
    // CONTEXT VALUE

    const value =
    useMemo(() => ({

        user,

        token,

        loading,

        login,

        logout,

        isAuthenticated

    }), [

        user,
        token,
        loading
    ]);

    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>
    );
};

// CUSTOM HOOK

export const useAuth = () => {

    return useContext(
        AuthContext
    );
};