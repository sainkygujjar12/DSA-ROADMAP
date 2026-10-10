import React from "react";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";
import "./refinement.css";
import "./components/ui/aceternity.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
