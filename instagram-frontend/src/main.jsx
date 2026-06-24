import React from "react";

import ReactDOM from "react-dom/client";

import {
    QueryClient,
    QueryClientProvider
}
from "@tanstack/react-query";

import {

    BrowserRouter

} from "react-router-dom";

// APP

import App from "./App";

// CONTEXT

import { AuthProvider } from "./context/AuthContext";

// GLOBAL STYLES

import "./styles/global.css";

import "./styles/auth.css";

const queryClient =
new QueryClient({

    defaultOptions: {

        queries: {

            staleTime:
            1000 * 60 * 5,

            cacheTime:
            1000 * 60 * 30,

            refetchOnWindowFocus:
            false,

            retry: 1
        }
    }
});

// ROOT

ReactDOM.createRoot(

    document.getElementById("root")

).render(

    <QueryClientProvider
        client={queryClient}
    >
    
        <BrowserRouter>
    
            <AuthProvider>
    
                <App />
    
            </AuthProvider>
    
        </BrowserRouter>
    
    </QueryClientProvider>
);