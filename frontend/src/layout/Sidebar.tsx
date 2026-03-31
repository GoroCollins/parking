import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "@/authentication/context/AuthContext";
// import { ModeToggle } from "@/components/mode-toggle";

export const Sidebar = () => {
  const auth = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      
      {/* Logo */}
      <div className="p-4 text-xl font-bold">
        Parking Management
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <a href="/dashboard" className="block p-2 rounded hover:bg-gray-800">
          Dashboard
        </a>
        <a href="/parkingareas" className="block p-2 rounded hover:bg-gray-800">
          Parking Areas
        </a>
        <a href="/parkingslots" className="block p-2 rounded hover:bg-gray-800">
          Parking Slots
        </a>
        <a href="/parkingsessions" className="block p-2 rounded hover:bg-gray-800">
          Parking Sessions
        </a>
        <a href="/payments" className="block p-2 rounded hover:bg-gray-800">
          Payments
        </a>
        <a href="/users" className="block p-2 rounded hover:bg-gray-800">
          Users
        </a>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-800" ref={dropdownRef}>
        
        {/* 🔄 Loading state */}
        {auth?.loading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-700 rounded w-3/4" />
              <div className="h-2 bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ) : auth?.user ? (
          <>
            {/* User button */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 text-left hover:bg-gray-800 p-2 rounded"
            >
              {/* Avatar */}
              {auth.user.avatar ? (
                <img
                  src={auth.user.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {auth.user.username.charAt(0).toUpperCase()}
                </div>
              )}

              {/* User info */}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {auth.user.full_name || auth.user.username}
                </p>
                <p className="text-xs text-gray-400">
                  @{auth.user.username}
                </p>
              </div>
            </button>

            {/* Dropdown */}
            {open && (
            <div className="mt-2 bg-gray-800 rounded shadow-lg overflow-hidden">
                
                {/* Profile */}
                <a
                href="/userprofile"
                className="block px-4 py-2 text-sm hover:bg-gray-700"
                >
                Profile Settings
                </a>

                {/* Theme toggle */}
                {/* <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-700">
                <span>Theme</span>
                <ModeToggle />
                </div> */}

                {/* Divider */}
                <div className="border-t border-gray-700 my-1" />

                {/* Logout */}
                <button
                onClick={() => {
                    setOpen(false);
                    auth.logout();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400"
                >
                Logout
                </button>
            </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">Not logged in</p>
        )}
      </div>
    </div>
  );
};