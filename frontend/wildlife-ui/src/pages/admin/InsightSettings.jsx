import { useState, useEffect } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const API_BASE = "http://localhost:8000";
const getToken = () => localStorage.getItem("access_token");

const ALL_SPECIES = [
    { value: "cheetah", label: "Cheetah" },
    { value: "giraffe", label: "Giraffe" },
    { value: "hyenaspotted", label: "Spotted Hyena" },
    { value: "impala", label: "Impala" },
    { value: "leopard", label: "Leopard" },
    { value: "lion", label: "Lion" },
    { value: "wildebeest", label: "Wildebeest" },
    { value: "zebra", label: "Zebra" },
];

const DEFAULTS = {
    predator_threshold: 3,
    empty_frame_threshold: 0.4,
    nocturnal_threshold: 0.7,
    low_confidence_threshold: 50,
    min_detections_nocturnal: 3,
    biodiversity_threshold: 0.6,
    predator_species: "lion,leopard,cheetah,hyenaspotted",
    prey_species: "zebra,wildebeest,impala,giraffe",
    rare_species: "leopard,cheetah",
    diurnal_species: "cheetah,impala,giraffe,zebra,wildebeest",
    nocturnal_species: "leopard,hyenaspotted",
};

const parseSpecies = str => str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
const serializeSpecies = arr => arr.join(",");

function SpeciesCheckboxGroup({ label, hint, value, onChange }) {
    const selected = parseSpecies(value);
    const toggle = sp => {
        const next = selected.includes(sp) ? selected.filter(s => s !== sp) : [...selected, sp];
        onChange(serializeSpecies(next));
    };
    return (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
            <div>
                <h3 className="text-sm font-semibold" style={{ color: "#2a1a08" }}>{label}</h3>
                {hint && <p className="text-xs mt-0.5" style={{ color: "#a08060" }}>{hint}</p>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_SPECIES.map(sp => (
                    <button key={sp.value} onClick={() => toggle(sp.value)}
                        className="px-3 py-2 rounded-xl text-xs font-medium transition-all text-left"
                        style={selected.includes(sp.value)
                            ? { background: "#8a5c1a", color: "#fff", border: "1.5px solid #8a5c1a" }
                            : { background: "#f5ede0", color: "#8a6030", border: "1.5px solid #ddd0b0" }}
                        onMouseEnter={e => { if (!selected.includes(sp.value)) e.currentTarget.style.background = "#ede0cc" }}
                        onMouseLeave={e => { if (!selected.includes(sp.value)) e.currentTarget.style.background = "#f5ede0" }}>
                        {sp.label}
                    </button>
                ))}
            </div>
            {selected.length === 0 && (
                <p className="text-xs font-medium" style={{ color: "#c07020" }}>
                    No species selected — this alert category will not trigger.
                </p>
            )}
        </div>
    );
}

function ThresholdInput({ label, hint, name, value, onChange, min, max, step, suffix }) {
    return (
        <div className="space-y-2">
            <div>
                <label className="block text-sm font-semibold" style={{ color: "#2a1a08" }}>{label}</label>
                {hint && <p className="text-xs mt-0.5" style={{ color: "#a08060" }}>{hint}</p>}
            </div>
            <div className="flex items-center gap-4">
                <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(name, parseFloat(e.target.value))}
                    className="flex-1" style={{ accentColor: "#8a5c1a" }} />
                <span className="text-sm font-bold w-24 text-right font-mono" style={{ color: "#8a5c1a" }}>
                    {value}{suffix}
                </span>
            </div>
        </div>
    );
}

export default function InsightSettings() {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API_BASE}/api/predictions/insight-settings/`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        })
            .then(r => r.json())
            .then(data => setSettings({ ...DEFAULTS, ...data }))
            .catch(() => setSettings(DEFAULTS))
            .finally(() => setLoading(false));
    }, []);

    const handleThreshold = (name, val) => setSettings(prev => ({ ...prev, [name]: val }));
    const handleSpecies = (name, val) => setSettings(prev => ({ ...prev, [name]: val }));

    const handleSave = async () => {
        setSaving(true); setError("");
        try {
            const res = await fetch(`${API_BASE}/api/predictions/insight-settings/`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { setError("Failed to save settings. Please try again."); }
        finally { setSaving(false); }
    };

    const handleReset = () => {
        if (window.confirm("Reset all settings to default values?")) setSettings(DEFAULTS);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-sm animate-pulse" style={{ color: "#a08060" }}>Loading settings...</div>
        </div>
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#8a5c1a" }}>
                        <TuneIcon style={{ color: "#f5d88a" }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>Insight Configuration</h1>
                        <p className="text-sm mt-0.5" style={{ color: "#8a6030" }}>Configure thresholds and species classifications for wildlife activity alerts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleReset}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{ background: "#fff", color: "#8a6030", border: "1px solid #e8d8b8" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fdf3e7"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                        <RestoreIcon fontSize="small" />
                        Reset Defaults
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: saving ? "#a07840" : "#8a5c1a" }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#7a4c0e" }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.background = "#8a5c1a" }}>
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SaveIcon fontSize="small" />}
                        {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
                    {error}
                </div>
            )}

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{ background: "#fdf3e7", border: "1px solid #e8c98a" }}>
                <InfoOutlinedIcon fontSize="small" style={{ color: "#8a5c1a", marginTop: 1 }} />
                <p className="text-sm leading-relaxed" style={{ color: "#7a5020" }}>
                    These settings control how the Wildlife Activity Insights panel generates alerts for conservationists.
                    Changes take effect immediately. Species classifications determine which species trigger predator activity,
                    co-occurrence, rarity, and anomaly alerts.
                </p>
            </div>

            {/* Thresholds */}
            <div className="rounded-2xl p-6 space-y-6" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                <h2 className="text-base font-bold pb-3" style={{ color: "#2a1a08", borderBottom: "1px solid #f0e4cc" }}>
                    Alert Thresholds
                </h2>
                <ThresholdInput label="Predator Activity Threshold"
                    hint="Minimum predator detections at a site before a high predator activity alert triggers."
                    name="predator_threshold" value={settings.predator_threshold} onChange={handleThreshold}
                    min={1} max={20} step={1} suffix=" detections" />
                <ThresholdInput label="Empty Frame Rate Threshold"
                    hint="Minimum proportion of empty frames before a possible camera issue alert triggers."
                    name="empty_frame_threshold" value={settings.empty_frame_threshold} onChange={handleThreshold}
                    min={0.1} max={0.9} step={0.05} suffix={` (${Math.round(settings.empty_frame_threshold * 100)}%)`} />
                <ThresholdInput label="Nocturnal Activity Threshold"
                    hint="Minimum proportion of night detections before a primarily nocturnal alert triggers."
                    name="nocturnal_threshold" value={settings.nocturnal_threshold} onChange={handleThreshold}
                    min={0.5} max={0.95} step={0.05} suffix={` (${Math.round(settings.nocturnal_threshold * 100)}%)`} />
                <ThresholdInput label="Minimum Detections for Nocturnal Alert"
                    hint="A site must have at least this many detections before the nocturnal alert fires."
                    name="min_detections_nocturnal" value={settings.min_detections_nocturnal} onChange={handleThreshold}
                    min={1} max={20} step={1} suffix=" detections" />
                <ThresholdInput label="Low Confidence Threshold"
                    hint="Predictions below this confidence percentage are counted towards the low confidence alert."
                    name="low_confidence_threshold" value={settings.low_confidence_threshold} onChange={handleThreshold}
                    min={10} max={80} step={5} suffix="%" />
                <ThresholdInput label="Low Biodiversity Threshold"
                    hint="If one species exceeds this proportion of all detections, a low biodiversity alert triggers."
                    name="biodiversity_threshold" value={settings.biodiversity_threshold} onChange={handleThreshold}
                    min={0.3} max={0.9} step={0.05} suffix={` (${Math.round(settings.biodiversity_threshold * 100)}%)`} />
            </div>

            {/* Species classifications */}
            <div className="space-y-4">
                <h2 className="text-base font-bold" style={{ color: "#2a1a08" }}>Species Classifications</h2>
                <SpeciesCheckboxGroup label="Predator Species"
                    hint="Species counted towards predator activity alerts and predator-prey co-occurrence detection."
                    value={settings.predator_species} onChange={val => handleSpecies("predator_species", val)} />
                <SpeciesCheckboxGroup label="Prey Species"
                    hint="Species counted as prey in predator-prey co-occurrence detection."
                    value={settings.prey_species} onChange={val => handleSpecies("prey_species", val)} />
                <SpeciesCheckboxGroup label="Rare Species"
                    hint="Species that trigger a rare species detection alert and field verification recommendation."
                    value={settings.rare_species} onChange={val => handleSpecies("rare_species", val)} />
                <SpeciesCheckboxGroup label="Diurnal Species"
                    hint="Primarily daytime species — night detections trigger an unusual detection alert."
                    value={settings.diurnal_species} onChange={val => handleSpecies("diurnal_species", val)} />
                <SpeciesCheckboxGroup label="Nocturnal Species"
                    hint="Primarily night species — daytime detections trigger an unusual detection alert."
                    value={settings.nocturnal_species} onChange={val => handleSpecies("nocturnal_species", val)} />
            </div>

            {/* Bottom save */}
            <div className="flex justify-end pb-4">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold text-white transition-all"
                    style={{ background: saving ? "#a07840" : "#8a5c1a" }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#7a4c0e" }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.background = "#8a5c1a" }}>
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <SaveIcon fontSize="small" />}
                    {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
}