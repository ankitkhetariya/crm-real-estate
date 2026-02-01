import { createContext, useState, useEffect } from "react";
import { TOKEN_KEY } from "../api/axios"; // ✅ Dynamic key import karein

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initialize User from LocalStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user", error);
      return null;
    }
  });

  // ✅ Token initialization uses the Environment-Aware KEY
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    // ✅ Save token using the dynamic TOKEN_KEY
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    // ✅ Clear the dynamic key on logout
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    // Clear other helpers too just in case
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};