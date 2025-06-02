"use client";

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === "admin");
    }
    setIsLoading(false);
  }, []);

  const updateUser = (userData) => {
    if (userData) {
      setUser(userData);
      setIsAdmin(userData.role === "admin");
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, isAdmin, isLoading, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
