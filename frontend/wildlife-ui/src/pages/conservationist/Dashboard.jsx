import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightIcon from "@mui/icons-material/Nightlight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import TuneIcon from "@mui/icons-material/Tune";
import InsightsIcon from "@mui/icons-material/Insights";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PetsIcon from "@mui/icons-material/Pets";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import StarIcon from "@mui/icons-material/Star";
import BarChartIcon from "@mui/icons-material/BarChart";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TableChartIcon from "@mui/icons-material/TableChart";
import LinkIcon from "@mui/icons-material/Link";
import TimelineIcon from "@mui/icons-material/Timeline";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

const api = axios.create({ baseURL: "http://localhost:8000" });
api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
    return config;
});

const SPECIES_OPTIONS = [
    "empty", "cheetah", "giraffe", "hyenaspotted", "impala",
    "leopard", "lion", "wildebeest", "zebra",
];
const SPECIES_LABELS = {
    empty: "Empty Frame", cheetah: "Cheetah", giraffe: "Giraffe",
    hyenaspotted: "Spotted Hyena", impala: "Impala", leopard: "Leopard",
    lion: "Lion", wildebeest: "Wildebeest", zebra: "Zebra",
};
const formatSpecies = (s) => SPECIES_LABELS[s] || s;

const SPECIES_ACCENT = {
    lion: { bg: "#fff1f0", border: "#fca5a5", badgeBg: "#c0392b", text: "#8a1a1a", type: "PREDATOR" },
    leopard: { bg: "#fdf4ff", border: "#d8b4fe", badgeBg: "#7c3aed", text: "#5b21b6", type: "PREDATOR · RARE" },
    cheetah: { bg: "#fdf4ff", border: "#d8b4fe", badgeBg: "#7c3aed", text: "#5b21b6", type: "PREDATOR · RARE" },
    hyenaspotted: { bg: "#fff7ed", border: "#fed7aa", badgeBg: "#c2410c", text: "#7c2d12", type: "PREDATOR" },
    zebra: { bg: "#f0fdf4", border: "#86efac", badgeBg: "#16a34a", text: "#14532d", type: "PREY" },
    wildebeest: { bg: "#f0fdf4", border: "#86efac", badgeBg: "#16a34a", text: "#14532d", type: "PREY" },
    impala: { bg: "#f0fdf4", border: "#86efac", badgeBg: "#16a34a", text: "#14532d", type: "PREY" },
    giraffe: { bg: "#fefce8", border: "#fde047", badgeBg: "#ca8a04", text: "#713f12", type: "HERBIVORE" },
    empty: { bg: "#f9fafb", border: "#e5e7eb", badgeBg: "#6b7280", text: "#374151", type: "EMPTY" },
};

const getAccent = (species) => SPECIES_ACCENT[species] || { bg: "#fdf3e7", border: "#e8c98a", badgeBg: "#8a5c1a", text: "#2a1a08", type: "WILDLIFE" };

const GRAZERS = ["zebra", "wildebeest", "impala", "giraffe"];
const PREDATORS_LIST = ["lion", "leopard", "cheetah", "hyenaspotted"];

function getSequenceLabel(species) {
    if (GRAZERS.includes(species)) return "grazing succession analysis recorded";
    if (PREDATORS_LIST.includes(species)) return "predator movement pattern recorded";
    return "activity sequence recorded";
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function ImageLightbox({ imageUrl, filename, species, confidence, site, capturedAt, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const acc = getAccent(species);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={onClose}>
            <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose}
                    className="absolute -top-10 right-0 flex items-center gap-1.5 text-xs font-medium transition-all"
                    style={{ color: "rgba(245,216,138,0.7)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f5d88a"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(245,216,138,0.7)"}>
                    <CloseIcon fontSize="small" /> Press ESC or click outside to close
                </button>
                <div className="rounded-2xl overflow-hidden" style={{ background: "#0a0603" }}>
                    <img src={imageUrl} alt={filename}
                        style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
                </div>
                <div className="mt-3 flex items-center gap-4 flex-wrap">
                    <span className="text-xs font-mono" style={{ color: "rgba(245,216,138,0.6)" }}>{filename}</span>
                    {species && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: acc.badgeBg, color: "#fff" }}>
                            {formatSpecies(species)}
                        </span>
                    )}
                    {confidence && (
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                            {confidence}% confidence
                        </span>
                    )}
                    {site && site !== "unknown" && (
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>📍 {site}</span>
                    )}
                    {capturedAt && (
                        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
                            📷 {String(capturedAt).slice(0, 16)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Confidence Ring ───────────────────────────────────────────────────────────
function ConfidenceRing({ value, size = 72 }) {
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (value / 100) * circ;
    const color = value >= 75 ? "#16a34a" : value >= 50 ? "#ca8a04" : "#c0392b";
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r={radius} fill="none" stroke="#f0e4cc" strokeWidth="6" />
            <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            <text x="32" y="36" textAnchor="middle"
                style={{ transform: "rotate(90deg)", transformOrigin: "32px 32px" }}
                fontSize="11" fontWeight="700" fill={color}>
                {value}%
            </text>
        </svg>
    );
}

// ── Notes Popover ─────────────────────────────────────────────────────────────
function NotesPopover({ result, onClose, onSave }) {
    const [notes, setNotes] = useState(result.notes || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/api/predictions/${result.prediction_id}/edit/`, { notes });
            onSave(result.prediction_id, notes);
            setSaved(true);
            setTimeout(() => { setSaved(false); onClose(); }, 800);
        } catch { }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: "#fffaf4", border: "1px solid #ddd0b8" }}>
                <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "1px solid #e8d8b8", background: "#3a2008" }}>
                    <div className="flex items-center gap-2">
                        <NoteAltIcon fontSize="small" style={{ color: "#f5d88a" }} />
                        <h3 className="text-sm font-semibold" style={{ color: "#f5d88a" }}>Field Notes</h3>
                    </div>
                    <button onClick={onClose} style={{ color: "#c4a070" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#f5d88a"}
                        onMouseLeave={e => e.currentTarget.style.color = "#c4a070"}>
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <p className="text-xs truncate" style={{ color: "#a08060" }}>{result.filename}</p>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                        placeholder="e.g. Impala also visible in background. Poor image quality."
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
                        style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                        onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                        onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"}
                        autoFocus />
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ background: "#f5ede0", color: "#8a6030", border: "1px solid #ddd0b0" }}>Cancel</button>
                        <button onClick={handleSave} disabled={saving || saved}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: "#8a5c1a" }}>
                            {saved ? <><CheckCircleIcon fontSize="small" /> Saved!</>
                                : saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <><SaveIcon fontSize="small" /> Save Note</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ result, onClose, onSave }) {
    const [species, setSpecies] = useState(result.species || "empty");
    const [timeOfDay, setTimeOfDay] = useState(result.time_of_day || "unknown");
    const [site, setSite] = useState(result.site || "unknown");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        setSaving(true); setError("");
        try {
            const res = await api.patch(`/api/predictions/${result.prediction_id}/edit/`, {
                species, time_of_day: timeOfDay, site,
            });
            onSave(result.prediction_id, res.data);
            onClose();
        } catch { setError("Failed to save changes. Please try again."); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: "#fffaf4", border: "1px solid #ddd0b8" }}>
                <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "1px solid #e8d8b8", background: "#3a2008" }}>
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: "#f5d88a" }}>Edit Prediction</h3>
                        <p className="text-xs mt-0.5 truncate max-w-[400px]" style={{ color: "#c4a070" }}>{result.filename}</p>
                    </div>
                    <button onClick={onClose} style={{ color: "#c4a070" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#f5d88a"}
                        onMouseLeave={e => e.currentTarget.style.color = "#c4a070"}>
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
                <div className="flex flex-col md:flex-row">
                    {result.image_url && (
                        <div className="md:w-1/2 shrink-0 flex items-center justify-center p-4"
                            style={{ background: "#1a1008", minHeight: 300 }}>
                            <img src={result.image_url} alt="Inspect image"
                                style={{ maxHeight: 380, width: "100%", objectFit: "contain", borderRadius: 12 }} />
                        </div>
                    )}
                    <div className="flex-1 p-5 space-y-4 overflow-y-auto" style={{ maxHeight: 480 }}>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8a6030" }}>Species</label>
                            <select value={species} onChange={(e) => setSpecies(e.target.value)}
                                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                                style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"}>
                                {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{formatSpecies(s)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8a6030" }}>Time of Day</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["day", "night", "unknown"].map((t) => (
                                    <button key={t} onClick={() => setTimeOfDay(t)}
                                        className="py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                                        style={timeOfDay === t
                                            ? { background: "#8a5c1a", color: "#fff", border: "1.5px solid #8a5c1a" }
                                            : { background: "#f5ede0", color: "#8a6030", border: "1.5px solid #ddd0b0" }}>
                                        {t === "day" && <WbSunnyIcon style={{ fontSize: 12, color: timeOfDay === t ? "#f5d88a" : "#c4a070" }} />}
                                        {t === "night" && <NightlightIcon style={{ fontSize: 12, color: timeOfDay === t ? "#c8d8f8" : "#8a9ab0" }} />}
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#8a6030" }}>Site / Location</label>
                            <input type="text" value={site} onChange={(e) => setSite(e.target.value)}
                                placeholder="e.g. B06, U10, unknown"
                                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                                style={{ background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" }}
                                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
                        </div>
                        {error && (
                            <div className="rounded-xl px-4 py-3 text-xs"
                                style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>{error}</div>
                        )}
                        <div className="flex gap-3 pt-1">
                            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                                style={{ background: "#f5ede0", color: "#8a6030", border: "1px solid #ddd0b0" }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                                style={{ background: "#8a5c1a" }}>
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SaveIcon fontSize="small" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Insights Panel ────────────────────────────────────────────────────────────
function InsightsPanel({ insights, summary, occupancy, cooccurrence, sequence, loading, onClear, onInspect }) {
    const [activeSection, setActiveSection] = useState("alerts");

    if (loading) return (
        <div className="rounded-2xl p-6 animate-pulse" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg" style={{ background: "#f5ede0" }} />
                <div className="h-5 w-40 rounded" style={{ background: "#f5ede0" }} />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl" style={{ background: "#f5ede0" }} />)}
            </div>
        </div>
    );

    const sections = [
        { id: "alerts", label: "Alerts", icon: <InsightsIcon style={{ fontSize: 15 }} />, count: insights.length },
        { id: "occupancy", label: "Occupancy", icon: <TableChartIcon style={{ fontSize: 15 }} />, count: occupancy.length },
        { id: "cooccurrence", label: "Co-occur", icon: <LinkIcon style={{ fontSize: 15 }} />, count: cooccurrence.length },
        { id: "sequence", label: "Sequence", icon: <TimelineIcon style={{ fontSize: 15 }} />, count: sequence.length },
    ];

    const ALERT_CONFIG = {
        alert: { leftBar: "#c0392b", bg: "#fff1f0", border: "#fca5a5", titleColor: "#8a1a1a", msgColor: "#7a3030", badgeBg: "#c0392b", badgeText: "#fff", icon: <ReportProblemIcon />, label: "CRITICAL" },
        warning: { leftBar: "#d97706", bg: "#fffbeb", border: "#fcd34d", titleColor: "#7a5a08", msgColor: "#6b4a10", badgeBg: "#d97706", badgeText: "#fff", icon: <WarningIcon />, label: "WARNING" },
        info: { leftBar: "#8a5c1a", bg: "#fdf3e7", border: "#e8c98a", titleColor: "#5a3810", msgColor: "#7a5020", badgeBg: "#8a5c1a", badgeText: "#fff", icon: <InfoIcon />, label: "INFO" },
    };

    const INSIGHT_ICON_MAP = {
        camera: <CameraAltIcon />, predator: <PetsIcon />, rare: <StarIcon />,
        night: <NightsStayIcon />, confidence: <HelpOutlineIcon />,
        biodiversity: <BarChartIcon />, anomaly: <ReportProblemIcon />,
    };

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
            <div className="px-6 py-4 flex items-center justify-between"
                style={{ background: "#3a2008", borderBottom: "1px solid #5a3818" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(245,200,66,0.15)", border: "1px solid rgba(245,200,66,0.3)" }}>
                        <InsightsIcon fontSize="small" style={{ color: "#f5d88a" }} />
                    </div>
                    <div>
                        <span className="text-base font-bold" style={{ color: "#f5d88a" }}>Wildlife Insights</span>
                        <span className="text-xs ml-2" style={{ color: "#c4a070" }}>based on all your uploads</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {summary && (
                        <div className="flex items-center gap-3 text-xs" style={{ color: "#c4a070" }}>
                            <span className="flex items-center gap-1">
                                <span className="font-bold text-sm" style={{ color: "#f5d88a" }}>{summary.total_predictions}</span> predictions
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-bold text-sm" style={{ color: "#f5d88a" }}>{summary.total_sites}</span> sites
                            </span>
                        </div>
                    )}
                    {summary?.total_predictions > 0 && (
                        <button onClick={onClear}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: "rgba(192,57,43,0.2)", color: "#e8a090", border: "1px solid rgba(192,57,43,0.4)" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(192,57,43,0.35)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(192,57,43,0.2)"}>
                            <DeleteOutlineIcon style={{ fontSize: 14 }} /> Clear History
                        </button>
                    )}
                </div>
            </div>

            {summary?.species_breakdown && Object.keys(summary.species_breakdown).length > 0 && (
                <div className="px-6 py-3 flex items-center gap-2 flex-wrap"
                    style={{ borderBottom: "1px solid #f0e4cc", background: "#fdf8f0" }}>
                    <span className="text-xs font-semibold uppercase tracking-widest shrink-0" style={{ color: "#a08060" }}>Breakdown:</span>
                    {Object.entries(summary.species_breakdown).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([sp, count]) => {
                        const acc = getAccent(sp);
                        return (
                            <span key={sp} className="text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{ background: acc.bg, color: acc.text, border: `1px solid ${acc.border}` }}>
                                {formatSpecies(sp)} ×{count}
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="flex gap-0 px-6 pt-3 pb-0" style={{ background: "#fdf8f0", borderBottom: "1px solid #f0e4cc" }}>
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all mr-1"
                        style={activeSection === s.id
                            ? { color: "#8a5c1a", borderBottom: "3px solid #8a5c1a" }
                            : { color: "#a08060", borderBottom: "3px solid transparent" }}
                        onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.color = "#8a5c1a" }}
                        onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.color = "#a08060" }}>
                        {s.icon} {s.label}
                        {s.count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold ml-0.5"
                                style={activeSection === s.id
                                    ? { background: "#8a5c1a", color: "#fff" }
                                    : { background: "#f5ede0", color: "#8a6030" }}>
                                {s.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {activeSection === "alerts" && (
                <div className="p-5 space-y-3">
                    {insights.length === 0 ? (
                        <div className="text-center py-10" style={{ color: "#b09070" }}>
                            <InsightsIcon style={{ fontSize: 40, color: "#ddd0b0", display: "block", margin: "0 auto 8px" }} />
                            <p className="text-sm font-medium">No alerts yet</p>
                            <p className="text-xs mt-1">Upload more images to generate wildlife activity patterns.</p>
                        </div>
                    ) : insights.map((insight, i) => {
                        const c = ALERT_CONFIG[insight.type] || ALERT_CONFIG.info;
                        const icon = INSIGHT_ICON_MAP[insight.icon] || <InsightsIcon />;
                        return (
                            <div key={i} className="flex overflow-hidden rounded-xl"
                                style={{ border: `1px solid ${c.border}`, background: c.bg }}>
                                <div className="w-1.5 shrink-0" style={{ background: c.leftBar }} />
                                <div className="flex items-start px-4 py-4 shrink-0">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.badgeBg }}>
                                        <span style={{ color: c.badgeText, fontSize: 18 }}>{icon}</span>
                                    </div>
                                </div>
                                <div className="flex-1 py-4 pr-4 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: c.badgeBg, color: c.badgeText }}>{c.label}</span>
                                        {insight.site && insight.site !== "all" && (
                                            <span className="text-xs font-mono font-medium" style={{ color: "#a08060" }}>📍 {insight.site}</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold mb-1" style={{ color: c.titleColor }}>{insight.title}</p>
                                    <p className="text-xs leading-relaxed" style={{ color: c.msgColor }}>{insight.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeSection === "occupancy" && (
                <div className="p-5">
                    {occupancy.length === 0 ? (
                        <div className="text-center py-10 text-sm" style={{ color: "#b09070" }}>No occupancy data yet.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #f0e4cc" }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: "#fdf8f0", borderBottom: "1px solid #f0e4cc" }}>
                                        {["Species", "Detections", "Sites", "Day", "Night", "Last Seen"].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                                                style={{ color: "#8a6030" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {occupancy.map((row, i) => {
                                        const acc = getAccent(row.species);
                                        return (
                                            <tr key={i} style={{ borderBottom: i < occupancy.length - 1 ? "1px solid #f0e4cc" : "none" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fffaf4"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                <td className="px-4 py-3 font-bold capitalize" style={{ color: acc.text }}>{formatSpecies(row.species)}</td>
                                                <td className="px-4 py-3 font-semibold" style={{ color: "#2a1a08" }}>{row.count}</td>
                                                <td className="px-4 py-3 text-xs" style={{ color: "#6b4c1a" }}>{row.sites.join(", ") || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#c07020" }}>
                                                        <WbSunnyIcon style={{ fontSize: 13 }} />{row.day}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#3b5ea6" }}>
                                                        <NightlightIcon style={{ fontSize: 13 }} />{row.night}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-mono" style={{ color: "#a08060" }}>{row.last_seen}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeSection === "cooccurrence" && (
                <div className="p-5 space-y-4">
                    {cooccurrence.length === 0 ? (
                        <div className="text-center py-10 text-sm" style={{ color: "#b09070" }}>
                            No predator–prey co-occurrences detected yet.
                        </div>
                    ) : cooccurrence.map((item, i) => (
                        <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid #fca5a5" }}>
                            {/* Header */}
                            <div className="px-5 py-4 flex items-center justify-between"
                                style={{ background: "#fff1f0", borderBottom: "1px solid #fca5a5" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: "#c0392b" }}>
                                        <LinkIcon fontSize="small" style={{ color: "#fff" }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: "#8a1a1a" }}>
                                            Predator–Prey Co-occurrence
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            {item.site && (
                                                <span className="text-xs font-medium" style={{ color: "#a08060" }}>
                                                    📍 {item.site}
                                                </span>
                                            )}
                                            <span className="text-xs font-mono" style={{ color: "#a08060" }}>
                                                🗓 {item.session}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                    style={{ background: "#c0392b", color: "#fff" }}>
                                    CO-OCCURRENCE
                                </span>
                            </div>

                            {/* Two column predator / prey */}
                            <div className="grid grid-cols-2 gap-0" style={{ background: "#fff" }}>
                                {/* Predators */}
                                <div className="p-5" style={{ borderRight: "1px solid #fca5a5" }}>
                                    <p className="text-xs font-bold uppercase tracking-widest mb-3"
                                        style={{ color: "#c0392b" }}>🦁 Predators</p>
                                    <div className="space-y-2">
                                        {item.predators.map((p, j) => {
                                            const acc = getAccent(p);
                                            return (
                                                <div key={j} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ background: acc.badgeBg }} />
                                                    <span className="text-sm font-semibold"
                                                        style={{ color: acc.text }}>
                                                        {formatSpecies(p)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Prey */}
                                <div className="p-5">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-3"
                                        style={{ color: "#16a34a" }}>🦓 Prey</p>
                                    <div className="space-y-2">
                                        {item.prey.map((p, j) => {
                                            const acc = getAccent(p);
                                            return (
                                                <div key={j} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ background: acc.badgeBg }} />
                                                    <span className="text-sm font-semibold"
                                                        style={{ color: acc.text }}>
                                                        {formatSpecies(p)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3" style={{ borderTop: "1px solid #fca5a5", background: "#fff1f0" }}>
                                <p className="text-xs" style={{ color: "#7a3030" }}>
                                    Both predator and prey detected at the same site — possible predator–prey interaction. Recommend field check.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSection === "sequence" && (
                <div className="p-5 space-y-4">
                    {sequence.length === 0 ? (
                        <div className="text-center py-10 text-sm" style={{ color: "#b09070" }}>
                            No sequences yet — requires images with EXIF timestamps.
                        </div>
                    ) : sequence.map((item, i) => {
                        const acc = getAccent(item.species);
                        return (
                            <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e8d8b8" }}>
                                {/* Header */}
                                <div className="px-5 py-4 flex items-center justify-between"
                                    style={{ background: "#fdf8f0", borderBottom: "1px solid #f0e4cc" }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ background: acc.badgeBg }}>
                                            <TimelineIcon fontSize="small" style={{ color: "#fff" }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: acc.text }}>
                                                {formatSpecies(item.species)} Activity Sequence
                                            </p>
                                            <p className="text-xs" style={{ color: "#a08060" }}>
                                                📍 {item.site} &nbsp;·&nbsp; {item.count} detections
                                                {item.duration_mins > 0 && ` · ~${item.duration_mins} min window`}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                                        style={{ background: acc.bg, color: acc.text, border: `1px solid ${acc.border}` }}>
                                        {item.count} frames
                                    </span>
                                </div>

                                {/* Image strip */}
                                <div className="p-4 overflow-x-auto">
                                    <div className="flex items-center gap-3" style={{ minWidth: "max-content" }}>
                                        {item.frames.map((frame, j) => (
                                            <div key={j} className="flex items-center gap-3">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="rounded-xl overflow-hidden cursor-pointer transition-all"
                                                        style={{ width: 120, height: 90, background: "#1a1008", flexShrink: 0 }}
                                                        onClick={() => onInspect({
                                                            imageUrl: frame.image_url,
                                                            filename: `${formatSpecies(item.species)} — Frame ${j + 1} at ${item.site}`,
                                                            species: item.species,
                                                            site: item.site,
                                                            capturedAt: frame.time,
                                                        })}
                                                        onMouseEnter={e => e.currentTarget.style.outline = `2px solid ${acc.badgeBg}`}
                                                        onMouseLeave={e => e.currentTarget.style.outline = "none"}>
                                                        <img src={frame.image_url} alt={`frame ${j + 1}`}
                                                            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold" style={{ color: acc.text }}>#{j + 1}</p>
                                                        <p className="text-xs font-mono" style={{ color: "#a08060" }}>
                                                            {frame.time ? String(frame.time).slice(11, 16) : "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {j < item.frames.length - 1 && (
                                                    <span className="text-xl font-bold flex-shrink-0" style={{ color: acc.badgeBg }}>→</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3" style={{ borderTop: "1px solid #f0e4cc", background: "#fdf8f0" }}>
                                    <p className="text-xs" style={{ color: "#8a6030" }}>
                                        {item.message} — {getSequenceLabel(item.species)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ result, onEdit, onNote, onInspect }) {
    const isError = !!result.error;
    const isEmpty = result.is_empty;
    const acc = getAccent(result.species);

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm transition-all"
            style={{ background: "#fff", border: result.is_corrected ? `2px solid #8a5c1a` : `1px solid ${acc.border}` }}>
            <div className="h-1.5 w-full" style={{ background: acc.badgeBg }} />
            <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid #f0e4cc", background: "#fdf8f0" }}>
                <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="text-xs truncate font-mono" style={{ color: "#a08060" }}>{result.filename}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    {result.is_corrected && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" }}>corrected</span>
                    )}
                    {result.model_used && (
                        <span className="text-xs font-mono hidden sm:block" style={{ color: "#b09070" }}>{result.model_used}</span>
                    )}
                    {isError ? <ErrorIcon style={{ color: "#c0392b", fontSize: 18 }} /> : <CheckCircleIcon style={{ color: "#16a34a", fontSize: 18 }} />}
                </div>
            </div>

            {isError ? (
                <div className="px-5 py-4"><p className="text-sm" style={{ color: "#c0392b" }}>{result.error}</p></div>
            ) : (
                <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-52 shrink-0 flex items-center justify-center"
                        style={{ background: "#1a1008", minHeight: 176 }}>
                        <img src={result.image_url} alt="uploaded"
                            style={{ width: "100%", maxHeight: 220, objectFit: "contain" }} />
                        <div className="absolute top-2 right-2">
                            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                                {result.time_of_day === "day"
                                    ? <WbSunnyIcon style={{ fontSize: 12, color: "#fbbf24" }} />
                                    : <NightlightIcon style={{ fontSize: 12, color: "#93c5fd" }} />}
                                {result.time_of_day === "day" ? "Day" : result.time_of_day === "night" ? "Night" : "?"}
                            </span>
                        </div>
                        {/* Inspect button */}
                        <div className="absolute bottom-2 right-2">
                            <button onClick={(e) => {
                                e.stopPropagation(); onInspect({
                                    imageUrl: result.image_url,
                                    filename: result.filename,
                                    species: result.species,
                                    confidence: result.confidence,
                                    site: result.site,
                                    capturedAt: result.captured_at,
                                });
                            }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(138,92,26,0.85)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
                                title="Inspect full image">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                                Inspect
                            </button>
                        </div>
                    </div>

                    <div className="px-5 py-4 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#a08060" }}>Detected Species</p>
                                <p className="text-2xl font-black leading-tight" style={{ color: isEmpty ? "#b09070" : acc.text }}>
                                    {formatSpecies(result.species)}
                                </p>
                                {result.site && result.site !== "unknown" && (
                                    <p className="text-xs mt-1 font-medium" style={{ color: "#a08060" }}>📍 {result.site}</p>
                                )}
                                {result.captured_at && (
                                    <p className="text-xs mt-0.5 font-mono" style={{ color: "#b09070" }}>📷 {result.captured_at.slice(0, 16)}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <ConfidenceRing value={result.confidence} />
                                <span className="text-xs font-medium" style={{ color: "#a08060" }}>confidence</span>
                            </div>
                            {result.prediction_id && (
                                <div className="flex flex-col gap-1.5">
                                    <button onClick={() => onEdit(result)} className="p-2 rounded-xl transition-all"
                                        style={{ color: "#a08060", border: "1px solid #e8d8b8", background: "#fdf8f0" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#fdf3e7"; e.currentTarget.style.color = "#8a5c1a"; e.currentTarget.style.border = "1px solid #e8c98a" }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#fdf8f0"; e.currentTarget.style.color = "#a08060"; e.currentTarget.style.border = "1px solid #e8d8b8" }}
                                        title="Edit prediction">
                                        <EditIcon style={{ fontSize: 16 }} />
                                    </button>
                                    <button onClick={() => onNote(result)} className="p-2 rounded-xl transition-all"
                                        style={result.notes
                                            ? { background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" }
                                            : { background: "#fdf8f0", color: "#a08060", border: "1px solid #e8d8b8" }}
                                        onMouseEnter={e => { if (!result.notes) { e.currentTarget.style.background = "#fdf3e7"; e.currentTarget.style.color = "#8a5c1a" } }}
                                        onMouseLeave={e => { if (!result.notes) { e.currentTarget.style.background = "#fdf8f0"; e.currentTarget.style.color = "#a08060" } }}
                                        title="Add field note">
                                        <NoteAltIcon style={{ fontSize: 16 }} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {result.top3 && !isEmpty && (
                            <div className="rounded-xl p-3" style={{ background: "#fdf8f0", border: "1px solid #f0e4cc" }}>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a08060" }}>Top 3 Candidates</p>
                                {result.top3.map((t, idx) => {
                                    const a = getAccent(t.species);
                                    return (
                                        <div key={idx} className="flex items-center justify-between mb-1.5 last:mb-0">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{ background: idx === 0 ? "#8a5c1a" : "#f5ede0", color: idx === 0 ? "#fff" : "#8a6030" }}>
                                                    {idx + 1}
                                                </span>
                                                <span className="text-xs font-medium" style={{ color: "#2a1a08" }}>{formatSpecies(t.species)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0e4cc" }}>
                                                    <div className="h-1.5 rounded-full" style={{ width: `${t.confidence}%`, background: a.badgeBg }} />
                                                </div>
                                                <span className="text-xs font-bold w-10 text-right" style={{ color: "#6b4c1a" }}>{t.confidence}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {result.notes && (
                            <div className="rounded-xl px-3 py-2.5" style={{ background: "#fdf3e7", border: "1px solid #e8c98a" }}>
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8a5c1a" }}>Field Note</p>
                                <p className="text-xs leading-relaxed italic" style={{ color: "#6b4c1a" }}>{result.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Deployed Model Card ───────────────────────────────────────────────────────
function DeployedModelCard({ deployedModel, loadingModel }) {
    if (loadingModel) return (
        <div className="rounded-2xl p-4 animate-pulse" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
            <div className="h-4 w-32 rounded mb-2" style={{ background: "#f5ede0" }} />
            <div className="h-6 w-48 rounded" style={{ background: "#f5ede0" }} />
        </div>
    );
    if (!deployedModel) return (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-4"
            style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
            <WarningAmberIcon style={{ color: "#d97706" }} fontSize="small" />
            <div>
                <p className="text-sm font-bold" style={{ color: "#7a5a08" }}>No Model Deployed</p>
                <p className="text-xs mt-0.5" style={{ color: "#a07820" }}>Contact your administrator to deploy a model.</p>
            </div>
        </div>
    );
    return (
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#fdf3e7", border: "2px solid #e8c98a" }}>
                <RocketLaunchIcon style={{ color: "#8a5c1a" }} />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#a08060" }}>Active AI Model</p>
                <p className="text-base font-bold" style={{ color: "#2a1a08" }}>{deployedModel.name}</p>
                <p className="text-xs" style={{ color: "#a08060" }}>Selected and deployed by administrator</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-bold"
                style={{ background: "#fdf3e7", color: "#8a5c1a", border: "1.5px solid #e8c98a" }}>DEPLOYED</span>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ConservationistDashboard() {
    const fileRef = useRef();
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState("images");
    const [results, setResults] = useState([]);
    const [maintenanceError, setMaintenanceError] = useState("");
    const [deployedModel, setDeployedModel] = useState(null);
    const [loadingModel, setLoadingModel] = useState(true);
    const [editingResult, setEditingResult] = useState(null);
    const [notingResult, setNotingResult] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    const [insights, setInsights] = useState([]);
    const [insightsSummary, setInsightsSummary] = useState(null);
    const [occupancy, setOccupancy] = useState([]);
    const [cooccurrence, setCooccurrence] = useState([]);
    const [sequence, setSequence] = useState([]);
    const [loadingInsights, setLoadingInsights] = useState(true);

    const [filterSpecies, setFilterSpecies] = useState("all");
    const [filterTimeOfDay, setFilterTimeOfDay] = useState("all");
    const [filterSite, setFilterSite] = useState("");
    const [filterMaxConf, setFilterMaxConf] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        api.get("/api/model-management/models/deployed/")
            .then(res => setDeployedModel(res.data))
            .catch(() => setDeployedModel(null))
            .finally(() => setLoadingModel(false));
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
            const res = await api.get("/api/predictions/insights/");
            setInsights(res.data.insights || []);
            setInsightsSummary(res.data.summary || null);
            setOccupancy(res.data.occupancy || []);
            setCooccurrence(res.data.cooccurrence || []);
            setSequence(res.data.sequence || []);
        } catch { setInsights([]); }
        finally { setLoadingInsights(false); }
    };

    const handleClearData = async () => {
        if (!window.confirm("This will clear all your prediction history. Are you sure?")) return;
        try {
            await api.delete("/api/predictions/clear/");
            setInsights([]); setInsightsSummary(null);
            setOccupancy([]); setCooccurrence([]); setSequence([]);
            setResults([]);
        } catch { }
    };

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;
        if (!deployedModel) {
            setMaintenanceError("No model is currently deployed. Please contact your administrator.");
            return;
        }
        setMaintenanceError("");
        setUploading(true);
        setResults([]);
        setFilterSpecies("all"); setFilterTimeOfDay("all");
        setFilterSite(""); setFilterMaxConf(""); setShowFilters(false);

        try {
            let res;
            if (uploadMode === "zip") {
                const formData = new FormData();
                formData.append("zip_file", files[0]);
                res = await api.post("/api/predictions/upload-zip/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                const formData = new FormData();
                Array.from(files).forEach((f) => formData.append("files", f));
                res = await api.post("/api/predictions/upload/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            setResults(res.data.results);
            fetchInsights();
        } catch (err) {
            const msg = err?.response?.data?.error;
            setMaintenanceError(msg || "Something went wrong. Please try again.");
        } finally { setUploading(false); }
    };

    const handleEditSave = (predictionId, updatedData) => {
        setResults(prev => prev.map(r =>
            r.prediction_id === predictionId
                ? { ...r, species: updatedData.species, time_of_day: updatedData.time_of_day, site: updatedData.site, is_empty: updatedData.species === "empty", is_corrected: true }
                : r
        ));
        fetchInsights();
    };

    const handleNoteSave = (predictionId, notes) => {
        setResults(prev => prev.map(r => r.prediction_id === predictionId ? { ...r, notes } : r));
    };

    const downloadCSV = () => {
        const headers = ["image_name", "species", "confidence_%", "time_of_day", "site", "captured_at", "model_used", "corrected", "notes"];
        const rows = filteredResults.filter(r => !r.error).map(r => [
            r.filename,
            r.is_empty ? "empty" : (r.species || "unknown"),
            r.confidence ?? "",
            r.time_of_day === "day" ? "Daytime" : r.time_of_day === "night" ? "Nighttime" : "Unknown",
            r.site || "unknown", r.captured_at || "", r.model_used || "",
            r.is_corrected ? "yes" : "no", r.notes || "",
        ]);
        const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `wildlife_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const onFileChange = (e) => handleFiles(e.target.files);
    const onDrop = useCallback((e) => {
        e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files);
    }, [deployedModel, uploadMode]);
    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    const filteredResults = results.filter(r => {
        if (r.error) return true;
        if (filterSpecies !== "all" && r.species !== filterSpecies) return false;
        if (filterTimeOfDay !== "all" && r.time_of_day !== filterTimeOfDay) return false;
        if (filterSite.trim() && !(r.site || "").toLowerCase().includes(filterSite.trim().toLowerCase())) return false;
        if (filterMaxConf !== "" && r.confidence > parseFloat(filterMaxConf)) return false;
        return true;
    });

    const correctedCount = results.filter(r => r.is_corrected).length;
    const notesCount = results.filter(r => r.notes).length;
    const uniqueSpecies = [...new Set(results.filter(r => !r.error).map(r => r.species))];

    return (
        <div className="space-y-6">
            {lightboxImage && (
                <ImageLightbox
                    imageUrl={lightboxImage.imageUrl}
                    filename={lightboxImage.filename}
                    species={lightboxImage.species}
                    confidence={lightboxImage.confidence}
                    site={lightboxImage.site}
                    capturedAt={lightboxImage.capturedAt}
                    onClose={() => setLightboxImage(null)}
                />
            )}
            {editingResult && <EditModal result={editingResult} onClose={() => setEditingResult(null)} onSave={handleEditSave} />}
            {notingResult && <NotesPopover result={notingResult} onClose={() => setNotingResult(null)} onSave={handleNoteSave} />}

            <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "#2a1a08" }}>Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: "#8a6030" }}>Upload camera trap images for AI species identification</p>
            </div>

            <DeployedModelCard deployedModel={deployedModel} loadingModel={loadingModel} />
            <InsightsPanel
                insights={insights} summary={insightsSummary}
                occupancy={occupancy} cooccurrence={cooccurrence} sequence={sequence}
                loading={loadingInsights} onClear={handleClearData} onInspect={setLightboxImage}
            />

            {maintenanceError && (
                <div className="flex items-start gap-3 rounded-2xl px-4 py-4"
                    style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
                    <WarningAmberIcon style={{ color: "#d97706", marginTop: 2 }} fontSize="small" />
                    <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: "#7a5a08" }}>Model Unavailable</p>
                        <p className="text-xs mt-0.5" style={{ color: "#a07820" }}>{maintenanceError}</p>
                    </div>
                    <button onClick={() => setMaintenanceError("")} style={{ color: "#c4a070" }}>✕</button>
                </div>
            )}

            {/* ── Upload Mode Toggle ── */}
            <div className="flex items-center gap-2 flex-wrap">
                {[
                    { id: "images", label: "🖼 Images / Batch" },
                    { id: "zip", label: "🗜 ZIP Archive" },
                ].map(mode => (
                    <button key={mode.id}
                        onClick={() => { setUploadMode(mode.id); setResults([]); }}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={uploadMode === mode.id
                            ? { background: "#8a5c1a", color: "#fff", border: "1.5px solid #8a5c1a" }
                            : { background: "#fff", color: "#8a6030", border: "1.5px solid #ddd0b0" }}
                        onMouseEnter={e => { if (uploadMode !== mode.id) e.currentTarget.style.background = "#fdf3e7" }}
                        onMouseLeave={e => { if (uploadMode !== mode.id) e.currentTarget.style.background = "#fff" }}>
                        {mode.label}
                    </button>
                ))}
                {uploadMode === "zip" && (
                    <span className="text-xs ml-1" style={{ color: "#a08060" }}>
                        Upload a ZIP file — all images inside will be analysed automatically
                    </span>
                )}
            </div>

            {/* ── Upload Zone ── */}
            <div onClick={() => !uploading && fileRef.current.click()}
                onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                className="border-2 border-dashed rounded-2xl p-14 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                style={dragging ? { borderColor: "#8a5c1a", background: "#fdf3e7" } : { borderColor: "#ddd0b0", background: "#fff" }}
                onMouseEnter={e => { if (!dragging) e.currentTarget.style.borderColor = "#8a5c1a" }}
                onMouseLeave={e => { if (!dragging) e.currentTarget.style.borderColor = "#ddd0b0" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all"
                    style={{ background: dragging ? "#8a5c1a" : "#fdf3e7", border: `2px solid ${dragging ? "#8a5c1a" : "#e8c98a"}` }}>
                    <CloudUploadIcon style={{ color: dragging ? "#fff" : "#8a5c1a", fontSize: 32 }} />
                </div>
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full animate-spin"
                            style={{ border: "3px solid #8a5c1a", borderTopColor: "transparent" }} />
                        <p className="text-base font-semibold" style={{ color: "#8a6030" }}>
                            Analysing with {deployedModel?.name}...
                        </p>
                        {uploadMode === "zip" && (
                            <p className="text-xs" style={{ color: "#a08060" }}>Extracting and processing ZIP contents — this may take a moment</p>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-lg font-bold mb-1" style={{ color: "#2a1a08" }}>
                            {uploadMode === "zip" ? "Click to upload or drag & drop a ZIP file" : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-sm" style={{ color: "#a08060" }}>
                            {uploadMode === "zip" ? "ZIP archive containing camera trap images" : "JPG, PNG — single or batch upload supported"}
                        </p>
                        {deployedModel && (
                            <p className="text-xs mt-2 font-mono font-medium" style={{ color: "#8a5c1a" }}>Using: {deployedModel.name}</p>
                        )}
                    </>
                )}
                <input ref={fileRef} type="file"
                    accept={uploadMode === "zip" ? ".zip" : "image/*"}
                    multiple={uploadMode === "images"}
                    className="hidden" onChange={onFileChange} />
            </div>

            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black" style={{ color: "#2a1a08" }}>
                                Current Batch
                                <span className="ml-2 text-sm font-normal" style={{ color: "#a08060" }}>({filteredResults.length} of {results.length} images)</span>
                            </h2>
                            <div className="flex items-center gap-3 mt-0.5">
                                {correctedCount > 0 && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" }}>
                                        {correctedCount} corrected
                                    </span>
                                )}
                                {notesCount > 0 && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: "#edf7ee", color: "#16a34a", border: "1px solid #86efac" }}>
                                        {notesCount} notes
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowFilters(v => !v)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                                style={showFilters
                                    ? { background: "#8a5c1a", color: "#fff", border: "1px solid #8a5c1a" }
                                    : { background: "#fff", color: "#8a6030", border: "1px solid #e8d8b8" }}
                                onMouseEnter={e => { if (!showFilters) e.currentTarget.style.background = "#fdf3e7" }}
                                onMouseLeave={e => { if (!showFilters) e.currentTarget.style.background = "#fff" }}>
                                <TuneIcon style={{ fontSize: 16 }} /> Filter
                            </button>
                            <button onClick={downloadCSV}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                                style={{ background: "#8a5c1a" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#7a4c0e"}
                                onMouseLeave={e => e.currentTarget.style.background = "#8a5c1a"}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download CSV
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                            style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8a6030" }}>Species</label>
                                <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}
                                    className="w-full rounded-xl px-2 py-2.5 text-sm outline-none"
                                    style={{ background: "#f5ede0", border: "1px solid #ddd0b0", color: "#2a1a08" }}>
                                    <option value="all">All species</option>
                                    {uniqueSpecies.map(s => <option key={s} value={s}>{formatSpecies(s)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8a6030" }}>Time of Day</label>
                                <select value={filterTimeOfDay} onChange={e => setFilterTimeOfDay(e.target.value)}
                                    className="w-full rounded-xl px-2 py-2.5 text-sm outline-none"
                                    style={{ background: "#f5ede0", border: "1px solid #ddd0b0", color: "#2a1a08" }}>
                                    <option value="all">All times</option>
                                    <option value="day">Daytime</option>
                                    <option value="night">Nighttime</option>
                                    <option value="unknown">Unknown</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8a6030" }}>Site</label>
                                <input type="text" value={filterSite} onChange={e => setFilterSite(e.target.value)}
                                    placeholder="e.g. B06" className="w-full rounded-xl px-2 py-2.5 text-sm outline-none"
                                    style={{ background: "#f5ede0", border: "1px solid #ddd0b0", color: "#2a1a08" }} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#8a6030" }}>Max Confidence %</label>
                                <input type="number" value={filterMaxConf} onChange={e => setFilterMaxConf(e.target.value)}
                                    placeholder="e.g. 40" min="0" max="100" className="w-full rounded-xl px-2 py-2.5 text-sm outline-none"
                                    style={{ background: "#f5ede0", border: "1px solid #ddd0b0", color: "#2a1a08" }} />
                            </div>
                            {(filterSpecies !== "all" || filterTimeOfDay !== "all" || filterSite || filterMaxConf) && (
                                <button onClick={() => { setFilterSpecies("all"); setFilterTimeOfDay("all"); setFilterSite(""); setFilterMaxConf(""); }}
                                    className="col-span-2 md:col-span-4 text-xs font-medium text-center py-1"
                                    style={{ color: "#a08060" }}>
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}

                    {filteredResults.length === 0 ? (
                        <div className="rounded-2xl p-10 text-center text-sm"
                            style={{ background: "#fff", border: "1px solid #e8d8b8", color: "#b09070" }}>
                            No results match your current filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {filteredResults.map((r, i) => (
                                <ResultCard key={i} result={r}
                                    onEdit={setEditingResult}
                                    onNote={setNotingResult}
                                    onInspect={setLightboxImage} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}