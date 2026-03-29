import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthService } from "../authentication/hooks/useAuthService";

export const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthService();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};