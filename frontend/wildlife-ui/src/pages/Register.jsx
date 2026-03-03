import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "" });
    const [status, setStatus] = useState(null); // {type: 'success'|'error', message: ''}
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:8000/api/auth/register/", form);
            setStatus({ type: "success", message: "Account created successfully! You can now log in." });
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.email?.[0] || data?.password?.[0] || data?.message || "Registration failed. Please try again.";
            setStatus({ type: "error", message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a1a0f] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#1a3a20] opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#0d2e1a] opacity-30 blur-3xl translate-x-1/3 translate-y-1/3" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#52b788 1px, transparent 1px), linear-gradient(90deg, #52b788 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            </div>
            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#1a3a20] border border-[#2d6a4f] flex items-center justify-center mb-4 shadow-lg shadow-black/40">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C7 2 3 7 3 12c0 2.5 1 4.8 2.6 6.4L12 22l6.4-3.6C20 16.8 21 14.5 21 12c0-5-4-10-9-10z" fill="#2d6a4f" />
                            <path d="M12 6c-2 0-4 2-5 4 1-1 3-1.5 5-1.5S16 9 17 10c-1-2-3-4-5-4z" fill="#52b788" />
                            <circle cx="12" cy="13" r="2.5" fill="#95d5b2" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#d4e8d0] tracking-tight">Wildlife AI</h1>
                    <p className="text-xs text-[#4a7a5a] mt-1 tracking-widest uppercase">Create Account</p>
                </div>
                <div className="bg-[#0f1f17]/80 backdrop-blur-sm border border-[#1e3328] rounded-2xl p-8 shadow-2xl shadow-black/50">
                    <h2 className="text-sm font-semibold text-[#b7d9c2] mb-1">Register as Conservationist</h2>
                    <p className="text-xs text-[#4a7a5a] mb-6">Fill in your details to get started</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-[#4a7a5a] uppercase tracking-widest mb-1.5">First Name</label>
                                <input name="first_name" type="text" value={form.first_name} onChange={handleChange}
                                    placeholder="John"
                                    className="w-full bg-[#0a1410] border border-[#1e3328] rounded-lg px-3 py-2.5 text-sm text-[#d4e8d0] placeholder-[#2d4a38] focus:outline-none focus:border-[#2d6a4f] transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs text-[#4a7a5a] uppercase tracking-widest mb-1.5">Last Name</label>
                                <input name="last_name" type="text" value={form.last_name} onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full bg-[#0a1410] border border-[#1e3328] rounded-lg px-3 py-2.5 text-sm text-[#d4e8d0] placeholder-[#2d4a38] focus:outline-none focus:border-[#2d6a4f] transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-[#4a7a5a] uppercase tracking-widest mb-1.5">Email</label>
                            <input name="email" type="email" required value={form.email} onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-[#0a1410] border border-[#1e3328] rounded-lg px-4 py-2.5 text-sm text-[#d4e8d0] placeholder-[#2d4a38] focus:outline-none focus:border-[#2d6a4f] transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs text-[#4a7a5a] uppercase tracking-widest mb-1.5">Password</label>
                            <input name="password" type="password" required value={form.password} onChange={handleChange}
                                placeholder="Min. 8 characters"
                                className="w-full bg-[#0a1410] border border-[#1e3328] rounded-lg px-4 py-2.5 text-sm text-[#d4e8d0] placeholder-[#2d4a38] focus:outline-none focus:border-[#2d6a4f] transition-all" />
                        </div>
                        {status && (
                            <div className={`rounded-lg px-4 py-2.5 ${status.type === "success" ? "bg-green-950/50 border border-green-800/50" : "bg-red-950/50 border border-red-900/50"}`}>
                                <p className={`text-xs ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>{status.message}</p>
                            </div>
                        )}
                        <button type="submit" disabled={loading}
                            className="w-full bg-[#2d6a4f] hover:bg-[#40916c] disabled:opacity-50 disabled:cursor-not-allowed text-[#95d5b2] font-medium text-sm py-2.5 rounded-lg transition-colors mt-2">
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                    <p className="text-center text-xs text-[#4a7a5a] mt-5">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#52b788] hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}