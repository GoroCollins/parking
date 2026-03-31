import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../authentication/components/Login";
import UserProfile from "../authentication/components/UserProfile";
import ChangePassword from "../authentication/components/ChangePassword";
import ForgotPasswordForm from "../authentication/components/ForgotPassword";
import ResetPasswordForm from "../authentication/components/ResetPassword";
import { ProtectedRoute } from "./ProtectedRoutes";
import Home from "@/Dashboard/Home";
import ParkingAreasPage from "@/features/parking/pages/ParkingAreasPage";
import ParkingAreaDetailsPage from "@/features/parking/pages/ParkingAreaDetailsPage";
import ParkingSlotsPage from "@/features/parking/pages/ParkingSlotsPage";
import ParkingSlotDetailsPage from "@/features/parking/pages/ParkingSlotDetailsPage";
import PaymentsListPage from "@/features/payment/pages/PaymentsListPage";
import ParkingSessionsList from "@/features/parking/components/ParkingSessions";
import UsersList from "@/features/users/components/UsersList";

import { Navigate } from "react-router-dom";

import AppLayout from "@/layout/AppLayout";

const RoutesConfig: React.FC = () => {
  return (
<Routes>
  {/* Public routes */}
  <Route path="/login" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <Login />
          </div>
    } 
      />
  <Route path="/forgotpassword" element={<ForgotPasswordForm />} />
  <Route path="/resetpassword/:uid/:token" element={<ResetPasswordForm />} />

  {/* Protected + Layout */}
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      
      <Route path="/dashboard" element={<Home />} />
      
      <Route path="/parkingareas" element={<ParkingAreasPage />} />
      <Route path="/parkingarea/:id" element={<ParkingAreaDetailsPage />} />
      
      <Route path="/parkingslots" element={<ParkingSlotsPage />} />
      <Route path="/parkingslot/:id" element={<ParkingSlotDetailsPage />} />

      <Route path="/parkingsessions" element={<ParkingSessionsList />} />

      <Route path="/payments" element={<PaymentsListPage />} />

      <Route path="/users" element={<UsersList />} />

    </Route>

    {/* Protected but NO sidebar */}
    <Route path="/userprofile" element={<UserProfile />} />
    <Route path="/changepassword" element={<ChangePassword />} />
  </Route>

  <Route index element={<Navigate to="/dashboard" replace />} />
</Routes>
  );
};

export default RoutesConfig;
