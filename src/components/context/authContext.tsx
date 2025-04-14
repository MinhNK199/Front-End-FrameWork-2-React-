"use client";

import type React from "react";
import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IAuthUser, IUserData } from "../../interface/auth";

interface AuthContextType {
  user: IAuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (userJson && token) {
        try {
          const userData = JSON.parse(userJson) as IAuthUser;
          console.log("Checking auth with token:", token); // Log để debug
          const response = await axios.get(`http://localhost:4000/users/${userData.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("User check response:", response.data);
          if (response.data) {
            setUser(userData);
          } else {
            console.warn("User not found, clearing localStorage");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.warn("Unauthorized, clearing localStorage");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
      } else {
        console.log("No user or token found in localStorage");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<{ token: string; user: IUserData }>("http://localhost:4000/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      console.log("Login response:", { token, user }); // Log để debug

      const userData: IAuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);

      if (userData.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const withAuth = (Component: React.ComponentType, adminOnly = false) => {
  return () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      console.log("withAuth check:", { isAuthenticated, isAdmin, loading }); // Log để debug
      if (!loading) {
        if (!isAuthenticated) {
          navigate("/login");
        } else if (adminOnly && !isAdmin) {
          navigate("/");
        }
      }
    }, [isAuthenticated, isAdmin, loading, navigate]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }

    if (!isAuthenticated || (adminOnly && !isAdmin)) {
      return null;
    }

    return <Component />;
  };
};