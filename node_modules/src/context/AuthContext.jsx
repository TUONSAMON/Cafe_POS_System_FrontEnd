import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client"; // ✅ make sure path is correct

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("pos-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // ✅ correct endpoint + await
      const res = await api.post("/api/login", {
        username,
        password,
      });

      setUser(res.data);
      localStorage.setItem("pos-user", JSON.stringify(res.data));
      return { ok: true };
    } catch (err) {
      console.log("LOGIN ERROR:", err?.response?.status, err?.response?.data);

      if (err.response?.status === 401) {
        return { ok: false, message: "Invalid username or password" };
      }
      return { ok: false, message: "An error occurred. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pos-user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
