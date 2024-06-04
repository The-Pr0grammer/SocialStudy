import React, { createContext, useContext, useState, useEffect } from "react";

// Create AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Check local storage for login status
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus) {
      setIsLoggedIn(true);
      setUsername(localStorage.getItem("username"));
    }
  }, []);

  const login = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
