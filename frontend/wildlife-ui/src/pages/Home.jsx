import { useNavigate } from "react-router-dom";

const cameraFeeds = [
    { id: "CAM-01", src: "/images/cam1.JPG", species: "Zebra", confidence: 94.2, site: "A01", time: "14:32", tod: "Daytime" },
    { id: "CAM-02", src: "/images/cam2.JPG", species: "Spotted Hyena", confidence: 91.7, site: "B04", time: "21:14", tod: "Nighttime" },
    { id: "CAM-03", src: "/images/cam3.JPG", species: "Lion", confidence: 95.1, site: "K11", time: "06:02", tod: "Daytime" },
    { id: "CAM-04", src: "/images/cam4.JPG", species: "Giraffe", confidence: 96.8, site: "D07", time: "09:45", tod: "Daytime" },
];

const stats = [
    { value: "2.6M+", label: "Images Processed" },
    { value: "9", label: "Species Tracked" },
    { value: "91%", label: "Model Accuracy" },
    { value: "24/7", label: "Active Monitoring" },
];

const features = [
    {
        bg: "#fdf3e7", border: "#e8c98a", iconBg: "#f5dfa0",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a5c1a" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
        ),
        title: "Instant Species ID",
        desc: "Upload camera trap images and receive AI species predictions with confidence scores in seconds.",
    },
    {
        bg: "#edf7ee", border: "#a8d4a8", iconBg: "#c8e8c8",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d6a2d" strokeWidth="2">
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
        ),
        title: "Wildlife Insights",
        desc: "Automated ecological alerts — predator activity, co-occurrence patterns, and species arrival sequences.",
    },
    {
        bg: "#fef0eb", border: "#e8b49a", iconBg: "#f5cdb8",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a3a1a" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        title: "CSV Export & Reports",
        desc: "Download structured prediction reports with species, confidence, site location, and field notes.",
    },
];

function CameraCard({ feed }) {
    return (
        <div className="rounded-2xl overflow-hidden border border-[#ddd0b8]" style={{ background: "#fffaf4" }}>
            <div className="relative">
                <img
                    src={feed.src}
                    alt={feed.species}
                    className="w-full h-36 object-cover"
                    onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                    }}
                />
                <div className="w-full h-36 items-center justify-center text-sm text-[#c4a882] bg-[#f5ead4]"
                    style={{ display: "none" }}>
                    No image
                </div>
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${feed.tod === "Nighttime"
                        ? "bg-[#1a2a3a]/70 text-[#a8c8e8]"
                        : "bg-[#f5e8c0]/80 text-[#7a5a10]"
                    }`}>
                    {feed.tod === "Nighttime" ? "🌙" : "☀"} {feed.tod}
                </div>
            </div>
            <div className="p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-[#a08060] font-medium">{feed.id} · {feed.site}</span>
                    <span className="flex items-center gap-1 text-xs text-red-500 font-mono font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                        REC
                    </span>
                </div>
                <p className="text-base font-semibold text-[#2a1a08] mb-0.5">{feed.species}</p>
                <p className="text-sm font-medium" style={{ color: "#6b4c1a" }}>{feed.confidence}% confidence</p>
                <div className="h-[3px] rounded-full mt-2" style={{ background: "#e8d8b8" }}>
                    <div className="h-[3px] rounded-full" style={{ width: `${feed.confidence}%`, background: "#8a6030" }} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: "#b89870" }}>{feed.time} · {feed.site}</p>
            </div>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-sans" style={{ background: "#faf5ec" }}>

            {/* ── Navbar ── */}
            <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-12 h-16">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C7 2 3 7 3 12c0 2.5 1 4.8 2.6 6.4L12 22l6.4-3.6C20 16.8 21 14.5 21 12c0-5-4-10-9-10z" fill="#f5d88a" />
                            <circle cx="12" cy="13" r="2.5" fill="#fff" />
                        </svg>
                    </div>
                    <span className="text-xl font-semibold text-white tracking-tight">
                        Wildlife<span style={{ color: "#f5d88a" }}>AI</span>
                    </span>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.12)", color: "#f5e8c0", border: "1px solid rgba(255,255,255,0.2)" }}>
                    Kgalagadi Transfrontier Park · Botswana
                </span>
            </nav>

            {/* ── Hero ── */}
            <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/cheetah.jpg')", backgroundPosition: "center 30%" }}
                />
                <div className="absolute inset-0" style={{
                    background: "linear-gradient(to bottom, rgba(30,15,5,0.22) 0%, rgba(30,15,5,0.32) 50%, rgba(20,10,2,0.78) 100%)"
                }} />

                {/* Hero content */}
                <div className="relative z-10 text-center px-6 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
                        style={{ background: "rgba(245,216,138,0.15)", border: "1px solid rgba(245,216,138,0.35)", color: "#f5e8c0" }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f5c842" }} />
                        System Active — Kgalagadi Transfrontier Park
                    </div>

                    <h1 className="font-bold text-white leading-tight mb-5"
                        style={{ fontSize: "64px", letterSpacing: "-1.5px", textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}>
                        AI-Powered<br />
                        <span style={{ color: "#f5c842", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}>Wildlife Monitoring</span>
                    </h1>

                    <p className="leading-relaxed mb-2 max-w-xl mx-auto"
                        style={{ fontSize: "20px", color: "#fff", textShadow: "0 1px 16px rgba(0,0,0,0.9)", fontWeight: "400" }}>
                        Automated species identification from camera trap images across Southern African ecosystems.
                    </p>
                    <p className="mb-9"
                        style={{ fontSize: "22px", fontWeight: "700", color: "#f5c842", textShadow: "0 2px 16px rgba(0,0,0,0.7)", letterSpacing: "0.05em" }}>
                        Upload. Detect. Conserve.
                    </p>

                    <div className="flex items-center gap-3 justify-center flex-wrap">
                        <button
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
                            style={{ background: "#8a5c1a" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#7a4c0e"}
                            onMouseLeave={e => e.currentTarget.style.background = "#8a5c1a"}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                            </svg>
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
                            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
                            </svg>
                            Register as Conservationist
                        </button>
                    </div>
                </div>

                {/* Species watermark */}
                <div className="absolute bottom-6 left-8 z-10">
                    <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(245,216,138,0.6)" }}>
                        Acinonyx jubatus · Cheetah · Kgalagadi
                    </p>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div style={{ background: "#3a2008" }} className="py-8">
                <div className="max-w-6xl mx-auto px-12 grid grid-cols-4 gap-0 divide-x divide-[#5a3818]">
                    {stats.map(s => (
                        <div key={s.label} className="text-center px-6">
                            <p className="text-4xl font-bold mb-1" style={{ color: "#f5c842" }}>{s.value}</p>
                            <p className="text-sm" style={{ color: "#c4a070" }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-6xl mx-auto px-12 py-14">

                {/* Recent Detections */}
                <div className="flex items-center gap-3 mb-5">
                    <p className="text-sm font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "#8a6030" }}>
                        Recent Camera Trap Detections
                    </p>
                    <div className="flex-1 h-px" style={{ background: "#ddd0b8" }} />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-14">
                    {cameraFeeds.map(feed => (
                        <CameraCard key={feed.id} feed={feed} />
                    ))}
                </div>

                {/* Key Features */}
                <div className="flex items-center gap-3 mb-5">
                    <p className="text-sm font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "#8a6030" }}>
                        System Capabilities
                    </p>
                    <div className="flex-1 h-px" style={{ background: "#ddd0b8" }} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {features.map(f => (
                        <div key={f.title} className="rounded-2xl p-6" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.iconBg }}>
                                {f.icon}
                            </div>
                            <p className="text-base font-semibold mb-2" style={{ color: "#2a1a08" }}>{f.title}</p>
                            <p className="text-sm leading-relaxed" style={{ color: "#7a5a38" }}>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* African context banner */}
                <div className="mt-10 rounded-2xl px-8 py-6 flex items-center gap-6"
                    style={{ background: "#3a2008", border: "1px solid #5a3818" }}>
                    <div className="shrink-0">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#f5c842" opacity="0.9" />
                            <circle cx="12" cy="9" r="2.5" fill="#3a2008" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold mb-1" style={{ color: "#f5c842", fontSize: "16px" }}>
                            Built for Southern African Conservation
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "#c4a070" }}>
                            Trained on the Snapshot Serengeti dataset and designed for use across Botswana's national parks and transfrontier conservation areas — including Kgalagadi, Chobe, and the Okavango Delta.
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-xs uppercase tracking-widest" style={{ color: "#8a6030" }}>University of Botswana</p>
                        <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "#8a6030" }}>Okavango Research Institute</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center py-6 mt-4" style={{ background: "#3a2008", borderTop: "1px solid #5a3818" }}>
                <p className="text-xs" style={{ color: "#8a6030" }}>
                    Wildlife AI Monitoring System · University of Botswana · Final Year Project · v1.0
                </p>
            </div>
        </div>
    );
}