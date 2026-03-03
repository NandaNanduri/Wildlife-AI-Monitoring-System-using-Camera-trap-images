import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#0a1a0f] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#1a3a20] opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#0d2e1a] opacity-30 blur-3xl translate-x-1/3 translate-y-1/3" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#52b788 1px, transparent 1px), linear-gradient(90deg, #52b788 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            </div>
            <div className="relative z-10 text-center max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#1a3a20] border border-[#2d6a4f] flex items-center justify-center shadow-lg shadow-black/40">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C7 2 3 7 3 12c0 2.5 1 4.8 2.6 6.4L12 22l6.4-3.6C20 16.8 21 14.5 21 12c0-5-4-10-9-10z" fill="#2d6a4f" />
                            <path d="M12 6c-2 0-4 2-5 4 1-1 3-1.5 5-1.5S16 9 17 10c-1-2-3-4-5-4z" fill="#52b788" />
                            <circle cx="12" cy="13" r="2.5" fill="#95d5b2" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-[#d4e8d0] tracking-tight mb-3">Wildlife AI</h1>
                <p className="text-sm text-[#4a7a5a] uppercase tracking-widest mb-4">Camera Trap Monitoring System</p>
                <p className="text-[#7aab8a] text-base mb-10 leading-relaxed">AI-powered wildlife detection and species identification using camera trap images.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => navigate("/login")} className="px-8 py-3 bg-[#2d6a4f] hover:bg-[#40916c] text-[#95d5b2] font-medium text-sm rounded-lg transition-colors">Sign In</button>
                    <button onClick={() => navigate("/register")} className="px-8 py-3 border border-[#2d6a4f] hover:bg-[#1a2e22] text-[#7aab8a] font-medium text-sm rounded-lg transition-colors">Create Account</button>
                </div>
            </div>
            <p className="absolute bottom-6 text-xs text-[#2d4a38]">Wildlife AI Monitoring System &copy; {new Date().getFullYear()}</p>
        </div>
    );
}