import { useState, useEffect } from "react";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
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
            <input name={name} type={show ? "text" : "password"} required
                value={value} onChange={onChange} placeholder={placeholder}
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
            <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#a08060" }}
                onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                onMouseLeave={e => e.currentTarget.style.color = "#a08060"}>
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

export default function ConservationistProfile() {
    const [profile, setProfile] = useState({ email: "", first_name: "", last_name: "" });
    const [nameForm, setNameForm] = useState({ first_name: "", last_name: "" });
    const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [nameStatus, setNameStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [nameLoading, setNameLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        api.get("/api/auth/profile/").then(res => {
            setProfile(res.data);
            setNameForm({ first_name: res.data.first_name, last_name: res.data.last_name });
        }).catch(() => setNameStatus({ type: "error", message: "Failed to load profile." }));
    }, []);

    const handleNameChange = (e) => { setNameForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setNameStatus(null); };
    const handlePasswordChange = (e) => { setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setPasswordStatus(null); };

    const handleNameSubmit = async (e) => {
        e.preventDefault(); setNameLoading(true);
        try {
            const res = await api.put("/api/auth/profile/", nameForm);
            setProfile(prev => ({ ...prev, ...res.data }));
            setNameStatus({ type: "success", message: "Name updated successfully." });
        } catch { setNameStatus({ type: "error", message: "Failed to update name." }); }
        finally { setNameLoading(false); }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault(); setPasswordLoading(true);
        try {
            await api.post("/api/auth/change-password/", passwordForm);
            setPasswordStatus({ type: "success", message: "Password changed successfully." });
            setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to change password.";
            setPasswordStatus({ type: "error", message: msg });
        } finally { setPasswordLoading(false); }
    };

    // Use actual initials if available, fallback to C
    const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "C";

    const StatusMessage = ({ status }) => status ? (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
            style={status.type === "success"
                ? { background: "#edf7ee", border: "1px solid #a8d4a8", color: "#1a5c30" }
                : { background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
            {status.type === "success" && <CheckCircleIcon fontSize="small" />}
            {status.message}
        </div>
    ) : null;

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>Profile</h1>
                <p className="text-sm mt-1" style={{ color: "#8a6030" }}>{profile.email}</p>
            </div>

            {/* Avatar card — brown/gold matching admin */}
            <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                    style={{ background: "#8a5c1a", color: "#f5d88a" }}>
                    {initials}
                </div>
                <div>
                    <p className="text-base font-bold" style={{ color: "#2a1a08" }}>
                        {profile.first_name || profile.last_name
                            ? `${profile.first_name} ${profile.last_name}`.trim()
                            : "Conservationist"}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "#a08060" }}>{profile.email}</p>
                    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full mt-1 font-medium"
                        style={{ background: "#edf7ee", color: "#2d6a4f", border: "1px solid #a8d4a8" }}>
                        Conservationist
                    </span>
                </div>
            </div>

            {/* Personal details */}
            <div className="rounded-2xl p-6 space-y-5"
                style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid #f0e4cc" }}>
                    <PersonIcon fontSize="small" style={{ color: "#8a5c1a" }} />
                    <h2 className="text-base font-semibold" style={{ color: "#2a1a08" }}>Personal Details</h2>
                </div>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8a6030" }}>First Name</label>
                            <input name="first_name" type="text" value={nameForm.first_name}
                                onChange={handleNameChange} placeholder="John"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8a6030" }}>Last Name</label>
                            <input name="last_name" type="text" value={nameForm.last_name}
                                onChange={handleNameChange} placeholder="Doe"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8a6030" }}>Email</label>
                        <input type="email" value={profile.email} disabled
                            className="w-full rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                            style={{ background: "#f0ebe0", border: "1.5px solid #ddd0b0", color: "#a08060" }} />
                        <p className="text-xs mt-1" style={{ color: "#b09070" }}>Email cannot be changed.</p>
                    </div>
                    <StatusMessage status={nameStatus} />
                    <button type="submit" disabled={nameLoading}
                        className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: nameLoading ? "#a07840" : "#8a5c1a" }}
                        onMouseEnter={e => { if (!nameLoading) e.currentTarget.style.background = "#7a4c0e" }}
                        onMouseLeave={e => { if (!nameLoading) e.currentTarget.style.background = "#8a5c1a" }}>
                        {nameLoading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Change password */}
            <div className="rounded-2xl p-6 space-y-5"
                style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid #f0e4cc" }}>
                    <LockIcon fontSize="small" style={{ color: "#8a5c1a" }} />
                    <h2 className="text-base font-semibold" style={{ color: "#2a1a08" }}>Change Password</h2>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {[
                        { name: "current_password", label: "Current Password", placeholder: "••••••••" },
                        { name: "new_password", label: "New Password", placeholder: "Min. 8 characters" },
                        { name: "confirm_password", label: "Confirm New Password", placeholder: "••••••••" },
                    ].map(f => (
                        <div key={f.name}>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8a6030" }}>{f.label}</label>
                            <PasswordInput name={f.name} value={passwordForm[f.name]}
                                onChange={handlePasswordChange} placeholder={f.placeholder} />
                        </div>
                    ))}
                    <StatusMessage status={passwordStatus} />
                    <button type="submit" disabled={passwordLoading}
                        className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: passwordLoading ? "#a07840" : "#8a5c1a" }}
                        onMouseEnter={e => { if (!passwordLoading) e.currentTarget.style.background = "#7a4c0e" }}
                        onMouseLeave={e => { if (!passwordLoading) e.currentTarget.style.background = "#8a5c1a" }}>
                        {passwordLoading ? "Changing..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}