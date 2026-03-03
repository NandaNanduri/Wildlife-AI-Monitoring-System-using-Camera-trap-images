import { NavLink, Outlet, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import NatureIcon from "@mui/icons-material/Nature";

export default function ConservationistLayout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[#0d1a12] text-[#d4e8d0] overflow-hidden">
            <aside className="w-60 flex flex-col bg-[#0a1410] border-r border-[#1e3328] shrink-0">
                <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e3328]">
                    <div className="w-8 h-8 rounded-lg bg-[#2d6a4f] flex items-center justify-center shrink-0">
                        <NatureIcon fontSize="small" className="text-[#95d5b2]" />
                    </div>
                    <span className="text-sm font-semibold tracking-wide text-[#95d5b2]">Wildlife AI</span>
                </div>
                <nav className="flex-1 py-4 px-2 space-y-1">
                    <NavLink to="/conservationist/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? "bg-[#2d6a4f] text-[#95d5b2] font-medium" : "text-[#7aab8a] hover:bg-[#1a2e22] hover:text-[#b7d9c2]"}`
                        }>
                        <DashboardIcon fontSize="small" />
                        <span>Dashboard</span>
                    </NavLink>
                </nav>
                <div className="px-2 pb-4 border-t border-[#1e3328] pt-3">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#7aab8a] hover:bg-[#1a2e22] hover:text-red-400 transition-all">
                        <LogoutIcon fontSize="small" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-6 py-4 bg-[#0a1410] border-b border-[#1e3328] shrink-0">
                    <span className="text-xs text-[#4a7a5a] uppercase tracking-widest">Conservationist Panel</span>
                    <div className="w-8 h-8 rounded-full bg-[#2d6a4f] flex items-center justify-center text-xs font-bold text-[#95d5b2]">C</div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}