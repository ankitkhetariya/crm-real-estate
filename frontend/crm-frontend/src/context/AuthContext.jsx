import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initialize User from LocalStorage (Keep this synchronous)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // ✅ CRITICAL FIX: Start loading as TRUE
  // This forces the "RoleRoute" to show a Spinner instead of redirecting immediately.
  const [loading, setLoading] = useState(true);

  // 2. Use Effect to stop loading after the check is complete
  useEffect(() => {
    // This ensures that the initial render is finished before we let the router decide where to go
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};