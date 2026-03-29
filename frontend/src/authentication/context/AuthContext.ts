import { createContext } from "react";

export interface User {
  id: number;
  username: string;
  full_name?: string;
  role?: string;
  avatar?: string; //
}

export interface AuthContextType {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<{ user: User } | void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);