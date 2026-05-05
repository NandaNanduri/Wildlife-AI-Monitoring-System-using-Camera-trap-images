import { useState } from "react";
import axios from "axios";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const api = axios.create({ baseURL: "http://localhost:8000" });
api.interceptors.request.use(cfg => {
    cfg.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
    return cfg;
});

function PasswordInput({ name, value, onChange, placeholder }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                name={name}
                type={show ? "text" : "password"}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#a08060" }}
                onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                onMouseLeave={e => e.currentTarget.style.color = "#a08060"}
            >
                {show ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                    </svg>
                ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
}

export default function AdminProfile() {
    const [passwordForm, setPasswordForm] = useState({
        current_password: "", new_password: "", confirm_password: ""
    });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/auth/change-password/", passwordForm);
            setStatus({ type: "success", message: "Password changed successfully." });
            setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to change password.";
            setStatus({ type: "error", message: msg });
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>Profile</h1>
                <p className="text-sm mt-1" style={{ color: "#8a6030" }}>Manage your account security</p>
            </div>

            {/* Avatar card */}
            <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ background: "#8a5c1a", color: "#f5d88a" }}>
                    A
                </div>
                <div>
                    <p className="text-base font-bold" style={{ color: "#2a1a08" }}>Administrator</p>
                    <p className="text-sm mt-0.5" style={{ color: "#a08060" }}>Wildlife AI Monitoring System</p>
                    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-1 font-medium"
                        style={{ background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" }}>
                        Admin
                    </span>
                </div>
            </div>

            {/* Change password card */}
            <div className="rounded-2xl p-6 space-y-5"
                style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid #f0e4cc" }}>
                    <LockIcon fontSize="small" style={{ color: "#8a5c1a" }} />
                    <h2 className="text-base font-semibold" style={{ color: "#2a1a08" }}>Change Password</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                            style={{ color: "#8a6030" }}>
                            Current Password
                        </label>
                        <PasswordInput name="current_password" value={passwordForm.current_password}
                            onChange={handleChange} placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                            style={{ color: "#8a6030" }}>
                            New Password
                        </label>
                        <PasswordInput name="new_password" value={passwordForm.new_password}
                            onChange={handleChange} placeholder="Min. 8 characters" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                            style={{ color: "#8a6030" }}>
                            Confirm New Password
                        </label>
                        <PasswordInput name="confirm_password" value={passwordForm.confirm_password}
                            onChange={handleChange} placeholder="••••••••" />
                    </div>

                    {status && (
                        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
                            style={status.type === "success"
                                ? { background: "#edf7ee", border: "1px solid #a8d4a8", color: "#1a5c30" }
                                : { background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
                            {status.type === "success" && <CheckCircleIcon fontSize="small" />}
                            {status.message}
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: loading ? "#a07840" : "#8a5c1a" }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#7a4c0e" }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#8a5c1a" }}>
                        {loading ? "Changing..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}