import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function EyeIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
        </svg>
    );
}

function FieldError({ msg }) {
    if (!msg) return null;
    return (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#c0392b" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {msg}
        </p>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
        setServerError("");
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.email.trim())
            newErrors.email = "Email address is required.";
        else if (!emailRegex.test(form.email))
            newErrors.email = "Please enter a valid email address.";

        if (!form.password)
            newErrors.password = "Password is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setServerError("");
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
            if (is_admin) navigate("/admin/dashboard");
            else if (is_conservationist) navigate("/conservationist/dashboard");
            else setServerError("Your account has no assigned role. Contact an administrator.");
        } catch (err) {
            if (err.response?.status === 401)
                setServerError("Incorrect email or password. Please try again.");
            else
                setServerError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputBorder = (field) =>
        errors[field] ? "1.5px solid #c0392b" : "1.5px solid #ddd0b0";

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/lion.jpg')", backgroundPosition: "center 40%" }} />
            <div className="absolute inset-0" style={{
                background: "linear-gradient(135deg, rgba(20,10,2,0.82) 0%, rgba(30,15,5,0.75) 50%, rgba(20,10,2,0.85) 100%)"
            }} />

            {/* Top nav */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 h-16 z-10">
                <button onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: "rgba(245,216,138,0.7)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f5c842"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(245,216,138,0.7)"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(245,200,66,0.15)", border: "1px solid rgba(245,200,66,0.3)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C7 2 3 7 3 12c0 2.5 1 4.8 2.6 6.4L12 22l6.4-3.6C20 16.8 21 14.5 21 12c0-5-4-10-9-10z" fill="#f5d88a" />
                            <circle cx="12" cy="13" r="2.5" fill="#fff" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">Wildlife<span style={{ color: "#f5d88a" }}>AI</span></span>
                </div>
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-auto px-6">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
                        style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.25)", color: "#f5e0a0" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f5c842" }} />
                        Kgalagadi Transfrontier Park · Botswana
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                        Welcome Back
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Sign in to the Wildlife AI Monitoring System
                    </p>
                </div>

                <div className="rounded-2xl p-8" style={{
                    background: "rgba(250,245,236,0.96)",
                    border: "1px solid rgba(220,200,160,0.6)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
                }}>
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                                style={{ color: "#8a6030" }}>Email Address</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={{ background: "#f5ede0", border: inputBorder("email"), color: "#2a1a08" }}
                                onFocus={e => e.target.style.border = errors.email ? "1.5px solid #c0392b" : "1.5px solid #8a5c1a"}
                                onBlur={e => e.target.style.border = inputBorder("email")} />
                            <FieldError msg={errors.email} />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                                style={{ color: "#8a6030" }}>Password</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? "text" : "password"}
                                    value={form.password} onChange={handleChange} placeholder="••••••••"
                                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                                    style={{ background: "#f5ede0", border: inputBorder("password"), color: "#2a1a08" }}
                                    onFocus={e => e.target.style.border = errors.password ? "1.5px solid #c0392b" : "1.5px solid #8a5c1a"}
                                    onBlur={e => e.target.style.border = inputBorder("password")} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "#a08060" }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                                    onMouseLeave={e => e.currentTarget.style.color = "#a08060"}>
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <FieldError msg={errors.password} />
                            <div className="flex justify-end mt-1.5">
                                <button type="button" onClick={() => setShowForgotPassword(!showForgotPassword)}
                                    className="text-xs transition-colors"
                                    style={{ color: "#8a6030" }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                                    onMouseLeave={e => e.currentTarget.style.color = "#8a6030"}>
                                    Forgot password?
                                </button>
                            </div>
                            {showForgotPassword && (
                                <div className="rounded-xl px-4 py-3 mt-2 text-xs leading-relaxed"
                                    style={{ background: "#fdf3e7", border: "1px solid #e8c98a", color: "#7a5020" }}>
                                    Contact your system administrator to reset your password.
                                </div>
                            )}
                        </div>

                        {/* Server error */}
                        {serverError && (
                            <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-xs"
                                style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                {serverError}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-colors mt-1"
                            style={{ background: loading ? "#a07840" : "#8a5c1a" }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#7a4c0e" }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#8a5c1a" }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: "#ddd0b0" }} />
                        <span className="text-xs" style={{ color: "#b09070" }}>or</span>
                        <div className="flex-1 h-px" style={{ background: "#ddd0b0" }} />
                    </div>

                    <p className="text-center text-sm" style={{ color: "#7a5a38" }}>
                        Don't have an account?{" "}
                        <Link to="/register" className="font-semibold transition-colors" style={{ color: "#8a5c1a" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                            onMouseLeave={e => e.currentTarget.style.color = "#8a5c1a"}>
                            Register as Conservationist
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs mt-5" style={{ color: "rgba(245,216,138,0.4)" }}>
                    Wildlife AI Monitoring System · University of Botswana · v1.0
                </p>
            </div>

            <div className="absolute bottom-6 left-8 z-10">
                <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(245,216,138,0.45)" }}>
                    Panthera leo · Lion · Kgalagadi
                </p>
            </div>
        </div>
    );
}