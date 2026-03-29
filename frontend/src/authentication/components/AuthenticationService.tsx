import React, { useMemo, useState, useEffect, type ReactNode,} from "react";
import { type AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { axiosInstance } from "@/services/apiClient";
import { AuthContext, type User } from "@/authentication/context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '@/utils/errorHandler';

interface LoginResponse {
  access: string;
  refresh: string;
}

// interface LogoutResponse {
//   detail: string;
// }

interface ErrorResponse {
  detail?: string;
  old_password?: string[];
}

interface LogoutErrorResponse {
  detail?: string;
}

const ACCESS_TOKEN_COOKIE = "access";
const REFRESH_TOKEN_COOKIE = "refresh";
const CSRF_COOKIE_NAME = "csrftoken";


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const login = async (username: string, password: string): Promise<void> => {
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
      `/token/`,
      { username, password }
    );

    if (response.status === 200) {
      const { access, refresh } = response.data;

      if (access && refresh) {
        axiosInstance.defaults.headers["Authorization"] = `Bearer ${access}`;
        Cookies.set(ACCESS_TOKEN_COOKIE, access);
        Cookies.set(REFRESH_TOKEN_COOKIE, refresh);

        setIsAuthenticated(true);

        // Fetch user after login
        const userResponse = await refreshUser();

        toast.success(
          userResponse?.user
            ? `Welcome, ${userResponse.user.username}!`
            : "Login successful!"
        );
      }

      return;
    }

    throw new Error("Login failed.");
  };

  const logout = async (): Promise<void> => {
  try {
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

    // Attempt server logout only if refresh token exists
    if (refreshToken) {
      await axiosInstance.post("/dj-rest-auth/logout/", { refresh: refreshToken });
    }

    // Always clear local auth state
    delete axiosInstance.defaults.headers["Authorization"];
    Cookies.remove(ACCESS_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    Cookies.remove(CSRF_COOKIE_NAME);
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully.");
    navigate('/');
  } catch (err: unknown) {
    // Always clear local state even if server logout fails
    delete axiosInstance.defaults.headers["Authorization"];
    Cookies.remove(ACCESS_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    Cookies.remove(CSRF_COOKIE_NAME);
    setUser(null);
    setIsAuthenticated(false);

    // Try to show a meaningful message
    // const axiosErr = err as AxiosError<{ detail?: string }>;
    const axiosErr = err as AxiosError<LogoutErrorResponse>;
    const message = extractErrorMessage(axiosErr);
    toast.error(message);
    navigate('/');
  }
};

  const refreshUser = async (): Promise<{ user: User } | void> => {
    try {
      const response = await axiosInstance.get<User>("/users/users/me/");
      setUser(response.data);
      return { user: response.data };
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      const message = axiosErr.response?.data?.detail ?? "Failed to fetch user";
      toast.error(message);
    }
  };

  useEffect(() => {
    const token = Cookies.get(ACCESS_TOKEN_COOKIE);
    if (token) {
      axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // fire and forget; errors handled inside refreshUser
      void refreshUser();
    }
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ login, logout, isAuthenticated, user, loading, refreshUser }),
    [isAuthenticated, user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};