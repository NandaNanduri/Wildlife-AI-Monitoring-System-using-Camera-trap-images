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

function getPasswordStrength(password) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", color: "#c0392b", width: "33%", bg: "#fef0eb" };
    if (score <= 3) return { label: "Medium", color: "#d97706", width: "66%", bg: "#fffbeb" };
    return { label: "Strong", color: "#16a34a", width: "100%", bg: "#edf7ee" };
}

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", confirm_password: "", first_name: "", last_name: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const strength = getPasswordStrength(form.password);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
        setStatus(null);
    };

    const validate = () => {
        const newErrors = {};
        const nameRegex = /^[A-Za-z\s'-]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // First name
        if (!form.first_name.trim())
            newErrors.first_name = "First name is required.";
        else if (!nameRegex.test(form.first_name))
            newErrors.first_name = "Name must contain letters only — no numbers or special characters.";
        else if (form.first_name.trim().length < 2)
            newErrors.first_name = "First name must be at least 2 characters.";

        // Last name
        if (!form.last_name.trim())
            newErrors.last_name = "Last name is required.";
        else if (!nameRegex.test(form.last_name))
            newErrors.last_name = "Name must contain letters only — no numbers or special characters.";
        else if (form.last_name.trim().length < 2)
            newErrors.last_name = "Last name must be at least 2 characters.";

        // Email
        if (!form.email.trim())
            newErrors.email = "Email address is required.";
        else if (!emailRegex.test(form.email))
            newErrors.email = "Please enter a valid email address.";

        // Password
        if (!form.password)
            newErrors.password = "Password is required.";
        else if (form.password.length < 8)
            newErrors.password = "Password must be at least 8 characters.";

        // Confirm password
        if (!form.confirm_password)
            newErrors.confirm_password = "Please confirm your password.";
        else if (form.password !== form.confirm_password)
            newErrors.confirm_password = "Passwords do not match.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await axios.post("http://localhost:8000/api/auth/register/", {
                email: form.email,
                password: form.password,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
            });
            setStatus({ type: "success", message: "Account created successfully! Redirecting to login..." });
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            const data = err.response?.data;
            // Map server field errors back to field-level display
            if (data?.email?.[0]) setErrors(prev => ({ ...prev, email: data.email[0] }));
            if (data?.password?.[0]) setErrors(prev => ({ ...prev, password: data.password[0] }));
            if (!data?.email && !data?.password) {
                setStatus({ type: "error", message: data?.message || data?.detail || "Registration failed. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    const inputBorder = (field) =>
        errors[field] ? "1.5px solid #c0392b" : "1.5px solid #ddd0b0";

    const inputStyle = (field) => ({
        background: "#f5ede0",
        border: inputBorder(field),
        color: "#2a1a08",
    });

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-8">

            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/wildebeest.jpg')", backgroundPosition: "center 50%" }} />
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
            <div className="relative z-10 w-full max-w-md mx-auto px-6 mt-8">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
                        style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.25)", color: "#f5e0a0" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f5c842" }} />
                        Join the Conservation Network
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                        Create Account
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Register as a conservationist to get started
                    </p>
                </div>

                <div className="rounded-2xl p-8" style={{
                    background: "rgba(250,245,236,0.96)",
                    border: "1px solid rgba(220,200,160,0.6)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
                }}>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                                    style={{ color: "#8a6030" }}>First Name</label>
                                <input name="first_name" type="text" value={form.first_name} onChange={handleChange}
                                    placeholder="John"
                                    className="w-full rounded-xl px-3 py-3 text-sm outline-none transition-all"
                                    style={inputStyle("first_name")}
                                    onFocus={e => e.target.style.border = errors.first_name ? "1.5px solid #c0392b" : "1.5px solid #8a5c1a"}
                                    onBlur={e => e.target.style.border = inputBorder("first_name")} />
                                <FieldError msg={errors.first_name} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                                    style={{ color: "#8a6030" }}>Last Name</label>
                                <input name="last_name" type="text" value={form.last_name} onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full rounded-xl px-3 py-3 text-sm outline-none transition-all"
                                    style={inputStyle("last_name")}
                                    onFocus={e => e.target.style.border = errors.last_name ? "1.5px solid #c0392b" : "1.5px solid #8a5c1a"}
                                    onBlur={e => e.target.style.border = inputBorder("last_name")} />
                                <FieldError msg={errors.last_name} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                                style={{ color: "#8a6030" }}>Email Address</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={inputStyle("email")}
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
                                    value={form.password} onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                                    style={inputStyle("password")}
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

                            {/* Password strength bar */}
                            {form.password && strength && (
                                <div className="mt-2 space-y-1">
                                    <div className="w-full h-1.5 rounded-full" style={{ background: "#f0e4cc" }}>
                                        <div className="h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: strength.width, background: strength.color }} />
                                    </div>
                                    <p className="text-xs font-medium" style={{ color: strength.color }}>
                                        {strength.label} password
                                        {strength.label === "Weak" && " — try adding numbers or symbols"}
                                        {strength.label === "Medium" && " — add uppercase or symbols to strengthen"}
                                    </p>
                                </div>
                            )}
                            <FieldError msg={errors.password} />
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                                style={{ color: "#8a6030" }}>Confirm Password</label>
                            <div className="relative">
                                <input name="confirm_password" type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirm_password} onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-all"
                                    style={inputStyle("confirm_password")}
                                    onFocus={e => e.target.style.border = errors.confirm_password ? "1.5px solid #c0392b" : "1.5px solid #8a5c1a"}
                                    onBlur={e => e.target.style.border = inputBorder("confirm_password")} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "#a08060" }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                                    onMouseLeave={e => e.currentTarget.style.color = "#a08060"}>
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {/* Live match indicator */}
                            {form.confirm_password && !errors.confirm_password && (
                                <p className="text-xs mt-1.5 flex items-center gap-1"
                                    style={{ color: form.password === form.confirm_password ? "#16a34a" : "#c0392b" }}>
                                    {form.password === form.confirm_password ? (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                            Passwords match
                                        </>
                                    ) : (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                            </svg>
                                            Passwords do not match
                                        </>
                                    )}
                                </p>
                            )}
                            <FieldError msg={errors.confirm_password} />
                        </div>

                        {/* Global status */}
                        {status && (
                            <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-xs" style={{
                                background: status.type === "success" ? "#edf7ee" : "#fef0eb",
                                border: `1px solid ${status.type === "success" ? "#a8d4a8" : "#e8a090"}`,
                                color: status.type === "success" ? "#2d6a2d" : "#8a2a1a",
                            }}>
                                {status.type === "success"
                                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                                }
                                {status.message}
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
                                    Creating Account...
                                </span>
                            ) : "Create Account"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: "#ddd0b0" }} />
                        <span className="text-xs" style={{ color: "#b09070" }}>or</span>
                        <div className="flex-1 h-px" style={{ background: "#ddd0b0" }} />
                    </div>

                    <p className="text-center text-sm" style={{ color: "#7a5a38" }}>
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold transition-colors" style={{ color: "#8a5c1a" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                            onMouseLeave={e => e.currentTarget.style.color = "#8a5c1a"}>
                            Sign In
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs mt-5" style={{ color: "rgba(245,216,138,0.4)" }}>
                    Wildlife AI Monitoring System · University of Botswana · v1.0
                </p>
            </div>

            <div className="absolute bottom-6 left-8 z-10">
                <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(245,216,138,0.45)" }}>
                    Connochaetes taurinus · Wildebeest · Kgalagadi
                </p>
            </div>
        </div>
    );
}