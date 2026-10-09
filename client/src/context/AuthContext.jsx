/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    try { return cached ? JSON.parse(cached) : null; } catch { return null; }
  });

  // True while we're confirming the cached token/user
  // are still valid on first load (page refresh).
  const [initializing, setInitializing] = useState(
    !!localStorage.getItem("token")
  );

  // Consolidated effect to sync auth state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  // On first load, if a token exists (e.g. after a page
  // refresh), re-fetch the real user from the server so
  // the profile/name/stats are always accurate — not just
  // whatever was cached from the last login.
  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const res = await getMe();
        if (!cancelled) {
          setUser(res.data);
        }
      } catch (error) {
        if (!cancelled && error.response?.status === 401) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    rehydrate();

    return () => {
      cancelled = true;
    };
    // Only run once on mount — login()/logout() manage
    // state directly afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const expire = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    };
    window.addEventListener("auth:expired", expire);
    return () => window.removeEventListener("auth:expired", expire);
  }, []);

  const login = (userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const refreshUser = async () => {
    const res = await getMe();
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,
        initializing,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
