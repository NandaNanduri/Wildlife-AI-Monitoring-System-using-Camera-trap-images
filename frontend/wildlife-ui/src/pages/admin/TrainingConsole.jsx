import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ScienceIcon from "@mui/icons-material/Science";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import MemoryIcon from "@mui/icons-material/Memory";
import TuneIcon from "@mui/icons-material/Tune";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import StopIcon from "@mui/icons-material/Stop";
import LabelIcon from "@mui/icons-material/Label";

const API = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("access_token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

const STATUS_STYLES = {
    pending: { bg: "#fdf3e7", text: "#8a5c1a", border: "#e8c98a" },
    running: { bg: "#edf7ee", text: "#2d6a4f", border: "#a8d4a8" },
    completed: { bg: "#edf7ee", text: "#1a5c30", border: "#6dbb8a" },
    failed: { bg: "#fef0eb", text: "#8a2a1a", border: "#e8a090" },
};

const STATUS_ICONS = {
    pending: <HourglassEmptyIcon fontSize="small" />,
    running: <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: "#2d6a4f" }} />,
    completed: <CheckCircleIcon fontSize="small" />,
    failed: <ErrorIcon fontSize="small" />,
};

export default function TrainingConsole() {
    const [activeTab, setActiveTab] = useState("new");
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [pollingJob, setPollingJob] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const logRef = useRef(null);

    const [form, setForm] = useState({
        model_architecture: "resnet",
        custom_name: "",
        epochs: 25, batch_size: 32, learning_rate: 0.0001,
        val_split: 0.2, warmup_epochs: 3, focal_loss_gamma: 2.0, notes: "",
    });
    const [datasetFile, setDatasetFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API}/training/jobs/`, { headers: authHeaders() });
            setJobs(res.data);
        } catch { /* silent */ }
    };

    useEffect(() => { fetchJobs(); }, []);

    useEffect(() => {
        if (!pollingJob) return;
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/training/jobs/${pollingJob}/`, { headers: authHeaders() });
                const job = res.data;
                setJobs(prev => prev.map(j => j.id === job.id ? job : j));
                if (selectedJob?.id === job.id) setSelectedJob(job);
                if (job.status === "completed" || job.status === "failed") {
                    setPollingJob(null); fetchJobs();
                }
            } catch { /* silent */ }
        }, 3000);
        return () => clearInterval(interval);
    }, [pollingJob, selectedJob]);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [selectedJob?.log]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: ["epochs", "batch_size", "warmup_epochs"].includes(name) ? parseInt(value)
                : ["learning_rate", "val_split", "focal_loss_gamma"].includes(name) ? parseFloat(value)
                    : value,
        }));
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith(".zip")) setDatasetFile(file);
    };

    const handleSubmit = async () => {
        if (!datasetFile) { setSubmitError("Please upload a dataset ZIP file."); return; }
        setSubmitError(""); setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append("dataset_zip", datasetFile);
            const res = await axios.post(`${API}/training/start/`, formData, {
                headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
            });
            const newJob = res.data;
            setJobs(prev => [newJob, ...prev]);
            setSelectedJob(newJob);
            setPollingJob(newJob.id);
            setActiveTab("logs");
        } catch (e) {
            setSubmitError(e.response?.data?.detail || "Failed to start training job.");
        } finally { setSubmitting(false); }
    };

    const handleCancel = async () => {
        if (!selectedJob || selectedJob.status !== "running") return;
        setCancelling(true);
        try {
            await axios.patch(`${API}/training/jobs/${selectedJob.id}/cancel/`, {}, { headers: authHeaders() });
            setSelectedJob(prev => ({ ...prev, status: "failed" }));
            setPollingJob(null); fetchJobs();
        } catch { /* silent */ }
        finally { setCancelling(false); }
    };

    const tabs = [
        { id: "new", label: "New Training Run", icon: <PlayArrowIcon fontSize="small" /> },
        { id: "history", label: "Job History", icon: <HistoryIcon fontSize="small" /> },
        { id: "logs", label: "Live Logs", icon: <MemoryIcon fontSize="small" /> },
    ];

    const cardStyle = { background: "#fff", border: "1px solid #e8d8b8" };
    const inputStyle = { background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#2a1a08" };
    const labelStyle = { color: "#8a6030" };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#8a5c1a" }}>
                    <ScienceIcon style={{ color: "#f5d88a" }} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>Training Console</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#8a6030" }}>Configure and launch model training runs</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl w-full" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
                        style={activeTab === tab.id
                            ? { background: "#8a5c1a", color: "#fff" }
                            : { color: "#8a6030" }}
                        onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "#fdf3e7" }}
                        onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent" }}>
                        {tab.icon}{tab.label}
                    </button>
                ))}
            </div>

            {/* ── NEW TRAINING RUN ── */}
            {activeTab === "new" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {/* Architecture */}
                        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
                            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#2a1a08" }}>
                                <TuneIcon fontSize="small" style={{ color: "#8a5c1a" }} />
                                Model & Architecture
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={labelStyle}>
                                    Model Name <span className="normal-case font-normal ml-1" style={{ color: "#b09070" }}>(optional)</span>
                                </label>
                                <input type="text" name="custom_name" value={form.custom_name} onChange={handleFormChange}
                                    placeholder="e.g. Wildlife v2 — leave blank for auto name"
                                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                    onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={labelStyle}>Architecture</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: "resnet", label: "ResNet50", sub: "~25.6M params · 224×224" },
                                        { value: "efficientnet", label: "EfficientNetB3", sub: "~11.8M params · 300×300" },
                                    ].map(arch => (
                                        <button key={arch.value}
                                            onClick={() => setForm(prev => ({ ...prev, model_architecture: arch.value, batch_size: arch.value === "efficientnet" ? 24 : 32 }))}
                                            className="p-3 rounded-xl text-left transition-all"
                                            style={form.model_architecture === arch.value
                                                ? { background: "#8a5c1a", border: "1.5px solid #8a5c1a", color: "#fff" }
                                                : { background: "#f5ede0", border: "1.5px solid #ddd0b0", color: "#8a6030" }}>
                                            <div className="text-sm font-semibold">{arch.label}</div>
                                            <div className="text-xs mt-0.5 opacity-70">{arch.sub}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hyperparameters */}
                        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
                            <div className="text-sm font-semibold" style={{ color: "#2a1a08" }}>Hyperparameters</div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { name: "epochs", label: "Epochs", min: 1, max: 100, step: 1 },
                                    { name: "batch_size", label: "Batch Size", min: 4, max: 128, step: 4 },
                                    { name: "learning_rate", label: "Learning Rate", min: 1e-6, max: 0.1, step: 1e-5 },
                                    { name: "val_split", label: "Val Split", min: 0.1, max: 0.4, step: 0.05 },
                                    { name: "warmup_epochs", label: "Warmup Epochs", min: 0, max: 10, step: 1 },
                                    { name: "focal_loss_gamma", label: "Focal Loss γ", min: 0.5, max: 5, step: 0.5 },
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={labelStyle}>{field.label}</label>
                                        <input type="number" name={field.name} value={form[field.name]}
                                            onChange={handleFormChange} min={field.min} max={field.max} step={field.step}
                                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                                            style={inputStyle}
                                            onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                            onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={labelStyle}>Notes (optional)</label>
                                <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={2}
                                    placeholder="e.g. Testing with augmented dataset..."
                                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all resize-none"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                                    onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Dataset upload */}
                        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
                            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#2a1a08" }}>
                                <FolderZipIcon fontSize="small" style={{ color: "#8a5c1a" }} />
                                Dataset Upload
                            </div>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("zip-input").click()}
                                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                                style={dragOver
                                    ? { borderColor: "#8a5c1a", background: "#fdf3e7" }
                                    : datasetFile
                                        ? { borderColor: "#2d6a4f", background: "#edf7ee" }
                                        : { borderColor: "#ddd0b0", background: "#f5ede0" }}>
                                <input id="zip-input" type="file" accept=".zip" className="hidden"
                                    onChange={e => setDatasetFile(e.target.files[0])} />
                                {datasetFile ? (
                                    <div className="space-y-1">
                                        <CheckCircleIcon style={{ color: "#2d6a4f" }} />
                                        <div className="text-sm font-semibold" style={{ color: "#2d6a4f" }}>{datasetFile.name}</div>
                                        <div className="text-xs" style={{ color: "#a08060" }}>
                                            {(datasetFile.size / 1024 / 1024).toFixed(1)} MB — click to change
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <CloudUploadIcon style={{ color: "#c4a070", fontSize: 36 }} />
                                        <div className="text-sm" style={{ color: "#8a6030" }}>Drop dataset ZIP here or click to browse</div>
                                        <div className="text-xs" style={{ color: "#b09070" }}>Structure: species_name/image.jpg</div>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: "#fdf3e7", border: "1px solid #e8c98a" }}>
                                <div className="font-semibold mb-1" style={{ color: "#8a5c1a" }}>Expected ZIP structure:</div>
                                <div className="font-mono space-y-0.5" style={{ color: "#8a6030" }}>
                                    <div>📁 dataset.zip/</div>
                                    <div className="pl-4">📁 cheetah/ · 🖼 img001.jpg</div>
                                    <div className="pl-4">📁 zebra/ · 🖼 img001.jpg</div>
                                    <div className="pl-4">📁 lion/ ...</div>
                                </div>
                            </div>
                        </div>

                        {/* Loss functions info */}
                        <div className="rounded-2xl p-5 space-y-2" style={cardStyle}>
                            <div className="text-sm font-semibold mb-2" style={{ color: "#2a1a08" }}>Loss Functions (Fixed)</div>
                            {[
                                ["Species Classification", `Focal Loss (γ=${form.focal_loss_gamma})`],
                                ["Time of Day", "CrossEntropyLoss"],
                                ["Empty Detection", "BCEWithLogitsLoss"],
                                ["Optimizer", "AdamW (weight_decay=1e-4)"],
                                ["LR Scheduler", "CosineAnnealingLR"],
                            ].map(([l, v]) => (
                                <div key={l} className="flex justify-between text-xs">
                                    <span style={{ color: "#a08060" }}>{l}</span>
                                    <span className="font-mono font-medium" style={{ color: "#6b4c1a" }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        {submitError && (
                            <div className="rounded-xl px-4 py-3 text-sm"
                                style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
                                {submitError}
                            </div>
                        )}

                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold text-white transition-all"
                            style={{ background: submitting ? "#a07840" : "#8a5c1a" }}
                            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#7a4c0e" }}
                            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#8a5c1a" }}>
                            {submitting
                                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Starting Training...</>
                                : <><PlayArrowIcon fontSize="small" />Start Training Run</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ── JOB HISTORY ── */}
            {activeTab === "history" && (
                <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                    {jobs.length === 0 ? (
                        <div className="p-12 text-center text-sm" style={{ color: "#b09070" }}>
                            No training jobs yet. Start one from the New Training Run tab.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0e4cc" }}>
                                    {["Job #", "Name", "Architecture", "Epochs", "Batch", "Status", "Started", ""].map(h => (
                                        <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-widest"
                                            style={{ color: "#a08060" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job, i) => {
                                    const s = STATUS_STYLES[job.status] || STATUS_STYLES.pending;
                                    return (
                                        <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? "1px solid #f0e4cc" : "none" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fffaf4"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                            <td className="px-4 py-3 font-mono font-medium" style={{ color: "#2a1a08" }}>#{job.id}</td>
                                            <td className="px-4 py-3 font-medium" style={{ color: "#2a1a08" }}>
                                                {job.custom_name || <span className="italic" style={{ color: "#b09070" }}>auto</span>}
                                            </td>
                                            <td className="px-4 py-3" style={{ color: "#6b4c1a" }}>
                                                {job.model_architecture === "resnet" ? "ResNet50" : "EfficientNetB3"}
                                            </td>
                                            <td className="px-4 py-3" style={{ color: "#6b4c1a" }}>{job.epochs}</td>
                                            <td className="px-4 py-3" style={{ color: "#6b4c1a" }}>{job.batch_size}</td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                                                    {STATUS_ICONS[job.status]}{job.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: "#a08060" }}>
                                                {new Date(job.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => { setSelectedJob(job); setActiveTab("logs"); }}
                                                    className="text-xs font-medium transition-colors"
                                                    style={{ color: "#8a5c1a" }}
                                                    onMouseEnter={e => e.currentTarget.style.color = "#5a3810"}
                                                    onMouseLeave={e => e.currentTarget.style.color = "#8a5c1a"}>
                                                    View Logs →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── LIVE LOGS ── */}
            {activeTab === "logs" && (
                <div className="space-y-4">
                    {jobs.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {jobs.map(job => {
                                const s = STATUS_STYLES[job.status] || STATUS_STYLES.pending;
                                return (
                                    <button key={job.id} onClick={() => setSelectedJob(job)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                        style={selectedJob?.id === job.id
                                            ? { background: "#8a5c1a", color: "#fff", border: "1px solid #8a5c1a" }
                                            : { background: "#fff", color: "#8a6030", border: "1px solid #e8d8b8" }}
                                        onMouseEnter={e => { if (selectedJob?.id !== job.id) e.currentTarget.style.background = "#fdf3e7" }}
                                        onMouseLeave={e => { if (selectedJob?.id !== job.id) e.currentTarget.style.background = "#fff" }}>
                                        <span style={{ color: selectedJob?.id === job.id ? "#fff" : s.text }}>
                                            {STATUS_ICONS[job.status]}
                                        </span>
                                        {job.custom_name || `Job #${job.id}`} — {job.model_architecture === "resnet" ? "ResNet50" : "EfficientNetB3"}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedJob ? (
                        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                            <div className="flex items-center justify-between px-5 py-3"
                                style={{ borderBottom: "1px solid #f0e4cc" }}>
                                <div className="flex items-center gap-4 text-xs" style={{ color: "#a08060" }}>
                                    <span>Job #{selectedJob.id}</span>
                                    {selectedJob.custom_name && <span className="font-semibold" style={{ color: "#2a1a08" }}>{selectedJob.custom_name}</span>}
                                    <span>{selectedJob.model_architecture === "resnet" ? "ResNet50" : "EfficientNetB3"}</span>
                                    <span>{selectedJob.epochs} epochs · batch {selectedJob.batch_size}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedJob.status === "running" && (
                                        <>
                                            <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#2d6a4f" }}>
                                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2d6a4f" }} />
                                                Live
                                            </span>
                                            <button onClick={handleCancel} disabled={cancelling}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                                style={{ background: "#fef0eb", color: "#8a2a1a", border: "1px solid #e8a090" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fad8cc"}
                                                onMouseLeave={e => e.currentTarget.style.background = "#fef0eb"}>
                                                {cancelling
                                                    ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                    : <StopIcon style={{ fontSize: 14 }} />}
                                                {cancelling ? "Stopping..." : "Stop Training"}
                                            </button>
                                        </>
                                    )}
                                    {(() => {
                                        const s = STATUS_STYLES[selectedJob.status] || STATUS_STYLES.pending;
                                        return (
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                                                style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                                                {STATUS_ICONS[selectedJob.status]}{selectedJob.status}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Log output — keep dark for readability */}
                            <div ref={logRef}
                                className="font-mono text-xs leading-relaxed whitespace-pre-wrap p-5 h-96 overflow-y-auto"
                                style={{ background: "#1a1008", color: "#c4a878" }}>
                                {selectedJob.log || "Waiting for training to start..."}
                            </div>

                            {selectedJob.status === "completed" && (
                                <div className="px-5 py-3 flex items-center gap-2 text-xs font-medium"
                                    style={{ borderTop: "1px solid #f0e4cc", background: "#edf7ee", color: "#1a5c30" }}>
                                    <CheckCircleIcon fontSize="small" />
                                    Training complete — model registered in Model Registry as inactive. Go to Models to deploy it.
                                </div>
                            )}
                            {selectedJob.status === "failed" && (
                                <div className="px-5 py-3 flex items-center gap-2 text-xs font-medium"
                                    style={{ borderTop: "1px solid #f0e4cc", background: "#fef0eb", color: "#8a2a1a" }}>
                                    <ErrorIcon fontSize="small" />
                                    Training stopped — check logs above for details.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl p-12 text-center text-sm" style={{ ...cardStyle, color: "#b09070" }}>
                            No job selected. Start a training run or select one from Job History.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}