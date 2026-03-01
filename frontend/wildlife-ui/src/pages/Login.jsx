import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("http://localhost:8000/api/auth/token/", {
                email: form.email,
                password: form.password,
            });

            const { access, refresh, is_admin, is_conservationist } = res.data;

            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("is_admin", is_admin);
            localStorage.setItem("is_conservationist", is_conservationist);

            if (is_admin) {
                navigate("/admin/dashboard");
            } else if (is_conservationist) {
                navigate("/conservationist/dashboard");
            } else {
                setError("Your account has no assigned role. Contact an administrator.");
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid email or password.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a1a0f] flex items-center justify-center px-4 relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#1a3a20] opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#0d2e1a] opacity-30 blur-3xl translate-x-1/3 translate-y-1/3" />
                {/* Grid lines */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#52b788 1px, transparent 1px), linear-gradient(90deg, #52b788 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <div className="w-full max-w-sm relative z-10">

                {/* Logo mark */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#1a3a20] border border-[#2d6a4f] flex items-center justify-center mb-4 shadow-lg shadow-black/40">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C7 2 3 7 3 12c0 2.5 1 4.8 2.6 6.4L12 22l6.4-3.6C20 16.8 21 14.5 21 12c0-5-4-10-9-10z" fill="#2d6a4f" />
                            <path d="M12 6c-2 0-4 2-5 4 1-1 3-1.5 5-1.5S16 9 17 10c-1-2-3-4-5-4z" fill="#52b788" />
                            <circle cx="12" cy="13" r="2.5" fill="#95d5b2" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#d4e8d0] tracking-tight">Wildlife AI</h1>
                    <p className="text-xs text-[#4a7a5a] mt-1 tracking-widest uppercase">Monitoring System</p>
                </div>

                {/* Card */}
                <div className="bg-[#0f1f17]/80 backdrop-blur-sm border border-[#1e3328] rounded-2xl p-8 shadow-2xl shadow-black/50">
                    <h2 className="text-sm font-semibold text-[#b7d9c2] mb-1">Sign in</h2>
                    <p className="text-xs text-[#4a7a5a] mb-6">Enter your credentials to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-[#4a7a5a] uppercase tracking-widest mb-1.5">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-[#0a1410] border border-[#1e3328] rounded-lg px-4 py-2.5 text-sm text-[#d4e8d0] placeholder-[#2d4a38] focus:outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f]/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-[#4a7a5a] uppercase tracking-widest mb-1.5">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-[#0a1410] border border-[#1e3328] rounded-lg px-4 py-2.5 text-sm text-[#d4e8d0] placeholder-[#2d4a38] focus:outline-none focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f]/30 transition-all"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-950/50 border border-red-900/50 rounded-lg px-4 py-2.5">
                                <p className="text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2d6a4f] hover:bg-[#40916c] disabled:opacity-50 disabled:cursor-not-allowed text-[#95d5b2] font-medium text-sm py-2.5 rounded-lg transition-colors duration-150 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[#2d4a38] mt-6">
                    Wildlife AI Monitoring System &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}