import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import NatureIcon from "@mui/icons-material/Nature";
import PersonIcon from "@mui/icons-material/Person";
import ScienceIcon from "@mui/icons-material/Science";
import BuildIcon from "@mui/icons-material/Build";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Users", path: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
  { label: "Models", path: "/admin/model-management", icon: <ScienceIcon fontSize="small" /> },
  { label: "Training", path: "/admin/training", icon: <BuildIcon fontSize="small" /> },
  { label: "Insights Config", path: "/admin/insight-settings", icon: <TuneIcon fontSize="small" /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("is_conservationist");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f0e8" }}>

      {/* ── Top Navigation ── */}
      <header style={{ background: "#2a1a08", borderBottom: "1px solid #3a2a12" }}
        className="shrink-0 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 h-14">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "#8a5c1a" }}>
              <NatureIcon fontSize="small" style={{ color: "#f5d88a" }} />
            </div>
            <span className="text-base font-semibold tracking-tight" style={{ color: "#f5d88a" }}>
              Wildlife<span style={{ color: "#d4a84a" }}>AI</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full ml-1 font-medium"
              style={{ background: "rgba(245,200,66,0.15)", color: "#c4a040", border: "1px solid rgba(245,200,66,0.2)" }}>
              Admin
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                    ? "text-[#f5d88a]"
                    : "text-[#c4a070] hover:text-[#f5d88a] hover:bg-white/5"
                  }`
                }
                style={({ isActive }) => isActive
                  ? { background: "rgba(245,200,66,0.12)", borderBottom: "2px solid #f5c842" }
                  : { borderBottom: "2px solid transparent" }
                }
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right — profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
              style={{ background: profileOpen ? "rgba(255,255,255,0.08)" : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent" }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#8a5c1a", color: "#f5d88a" }}>
                A
              </div>
              <span className="text-sm font-medium" style={{ color: "#f5d88a" }}>Admin</span>
              <KeyboardArrowDownIcon fontSize="small" style={{ color: "#c4a070", fontSize: 18 }} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl overflow-hidden z-50"
                style={{ background: "#2a1a08", border: "1px solid #3a2a12" }}>
                <NavLink
                  to="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm transition-all"
                  style={{ color: "#c4a070" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#f5d88a" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c4a070" }}
                >
                  <PersonIcon fontSize="small" />
                  Profile
                </NavLink>
                <div style={{ borderTop: "1px solid #3a2a12" }} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-sm w-full transition-all"
                  style={{ color: "#c4a070" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#e87060" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c4a070" }}
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}