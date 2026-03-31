import { Outlet } from "react-router-dom";
import { Sidebar } from "@/layout/Sidebar";

const AppLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;