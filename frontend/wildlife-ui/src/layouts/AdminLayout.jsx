import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NatureIcon from "@mui/icons-material/Nature";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Users", path: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("is_conservationist");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#0d1a12] text-[#d4e8d0] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-16"
          } flex flex-col bg-[#0a1410] border-r border-[#1e3328] transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e3328]">
          <div className="w-8 h-8 rounded-lg bg-[#2d6a4f] flex items-center justify-center shrink-0">
            <NatureIcon fontSize="small" className="text-[#95d5b2]" />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-semibold tracking-wide text-[#95d5b2] whitespace-nowrap">
              Wildlife AI
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive
                  ? "bg-[#2d6a4f] text-[#95d5b2] font-medium"
                  : "text-[#7aab8a] hover:bg-[#1a2e22] hover:text-[#b7d9c2]"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-[#1e3328] pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#7aab8a] hover:bg-[#1a2e22] hover:text-red-400 transition-all duration-150"
          >
            <LogoutIcon fontSize="small" className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#0a1410] border-b border-[#1e3328] shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#7aab8a] hover:text-[#95d5b2] transition-colors"
          >
            {sidebarOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#4a7a5a] uppercase tracking-widest">Admin Panel</span>
            <div className="w-8 h-8 rounded-full bg-[#2d6a4f] flex items-center justify-center text-xs font-bold text-[#95d5b2]">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}