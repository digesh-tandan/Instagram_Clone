import axios from "axios";

import { useAuthStore }
from "../store/authStore";
// CREATE INSTANCE

const API = axios.create({

    baseURL:
    `${import.meta.env.VITE_API_URL}/api`,

    headers: {

        "Content-Type":
        "application/json"
    },

    timeout: 15000
});

// REQUEST INTERCEPTOR

API.interceptors.request.use(

    (config) => {

        // console.log(
            // "AXIOS TOKEN:",
            // useAuthStore.getState().token
        // );

        const token =
        useAuthStore
            .getState()
            .token;

        if (token) {

            config.headers.Authorization =
            `Bearer ${token}`;
        }

        return config;
    },

    (error) => {

        return Promise.reject(
            error
        );
    }
);

// RESPONSE INTERCEPTOR

API.interceptors.response.use(

    (response) => {

        return response;
    },

    (error) => {

        // UNAUTHORIZED

        if (

            error.response &&
            error.response.status === 401

        ) {

            // CLEAR AUTH

            useAuthStore
                .getState()
                .logoutAuth();

            // REDIRECT LOGIN

            if (

                window.location.pathname !==
                "/login"

            ) {

                // window.location.href =
                // "/login";
            }
        }

        // NETWORK ERROR

        if (
            error.code === "ECONNABORTED"
        ) {

            console.log(
                "Request Timeout"
            );
        }

        return Promise.reject(
            error
        );
    }
);

export default API;