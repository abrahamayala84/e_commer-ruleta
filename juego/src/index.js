import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { BrowserRouter } from "react-router-dom";
import UserContext from "./context/userContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <UserContext>
            <GoogleOAuthProvider clientId="182800364350-0rk30ujkpq36k31f7cbv0n57rnemeiih.apps.googleusercontent.com">
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </GoogleOAuthProvider>
        </UserContext>
    </React.StrictMode>
);
