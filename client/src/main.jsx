import React from "react";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";
import "./refinement.css";
import "./components/ui/aceternity.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
