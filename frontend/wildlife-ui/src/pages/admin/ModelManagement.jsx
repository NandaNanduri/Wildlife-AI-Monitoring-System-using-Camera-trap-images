import { useState, useEffect } from "react";
import ScienceIcon from "@mui/icons-material/Science";
import MemoryIcon from "@mui/icons-material/Memory";
import BarChartIcon from "@mui/icons-material/BarChart";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const API_BASE = "http://localhost:8000";
const getToken = () => localStorage.getItem("access_token");

export default function ModelManagement() {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [activeTab, setActiveTab] = useState("registry");
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { fetchModels(); }, []);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/model-management/models/`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (!res.ok) { setModels([]); return; }
            const list = Array.isArray(data) ? data : [];
            setModels(list);
            if (list.length > 0)
                setSelectedModel(prev => prev ? list.find(m => m.id === prev.id) || list[0] : list[0]);
        } catch (e) { console.error(e); setModels([]); }
        finally { setLoading(false); }
    };

    const deployModel = async (modelId) => {
        setActionId(modelId);
        try {
            const res = await fetch(`${API_BASE}/api/model-management/models/${modelId}/deploy/`, {
                method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) return;
            await fetchModels();
        } catch (e) { console.error(e); }
        finally { setActionId(null); }
    };

    const deleteModel = async (modelId) => {
        setActionId(modelId);
        try {
            const res = await fetch(`${API_BASE}/api/model-management/models/${modelId}/delete/`, {
                method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete model.");
                return;
            }
            setConfirmDelete(null);
            await fetchModels();
        } catch (e) { console.error(e); }
        finally { setActionId(null); }
    };

    const tabs = [
        { id: "registry", label: "Model Registry", icon: <MemoryIcon fontSize="small" /> },
        { id: "training", label: "Training Details", icon: <ScienceIcon fontSize="small" /> },
        { id: "performance", label: "Performance Dashboard", icon: <BarChartIcon fontSize="small" /> },
    ];

    const statusBadge = (status) => {
        const styles = {
            deployed: { background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" },
            inactive: { background: "#f5f0e8", color: "#a08060", border: "1px solid #ddd0b0" },
        }[status] || { background: "#f5f0e8", color: "#a08060", border: "1px solid #ddd0b0" };
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={styles}>
                {status === "deployed" ? <RocketLaunchIcon style={{ fontSize: 11 }} /> : <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#a08060" }} />}
                {status}
            </span>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-sm animate-pulse" style={{ color: "#a08060" }}>Loading model data...</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>Model Management</h1>
                <p className="text-sm mt-1" style={{ color: "#8a6030" }}>Manage deployed models, view training details and performance metrics</p>
            </div>

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4"
                        style={{ background: "#fffaf4", border: "1px solid #ddd0b8" }}>
                        <h3 className="text-base font-bold" style={{ color: "#2a1a08" }}>Delete Model</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "#7a5a38" }}>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold" style={{ color: "#2a1a08" }}>{confirmDelete.name}</span>?
                            This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                                style={{ background: "#f5ede0", color: "#8a6030", border: "1px solid #ddd0b0" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#ede0cc"}
                                onMouseLeave={e => e.currentTarget.style.background = "#f5ede0"}>
                                Cancel
                            </button>
                            <button onClick={() => deleteModel(confirmDelete.id)} disabled={actionId === confirmDelete.id}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                                style={{ background: "#c0392b" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
                                onMouseLeave={e => e.currentTarget.style.background = "#c0392b"}>
                                {actionId === confirmDelete.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deployed model banner */}
            {models.some(m => m.status === "deployed") && (
                <div className="flex items-center gap-3 rounded-2xl px-5 py-4"
                    style={{ background: "#fdf3e7", border: "1px solid #e8c98a" }}>
                    <RocketLaunchIcon style={{ color: "#8a5c1a" }} fontSize="small" />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "#2a1a08" }}>
                            Currently Deployed: {models.find(m => m.status === "deployed")?.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#a08060" }}>
                            This is the model conservationists are currently using for predictions.
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={activeTab === tab.id
                            ? { background: "#8a5c1a", color: "#fff" }
                            : { color: "#8a6030" }}
                        onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "#fdf3e7" }}
                        onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent" }}>
                        {tab.icon}{tab.label}
                    </button>
                ))}
            </div>

            {/* ── MODEL REGISTRY ── */}
            {activeTab === "registry" && (
                <div className="rounded-2xl overflow-x-auto" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0e4cc" }}>
                                {["Model Name", "Type", "Version", "Date Trained", "Classes", "Train Images", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                                        style={{ color: "#a08060" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {models.map((model, i) => (
                                <tr key={model.id} className="transition-colors"
                                    style={{ borderBottom: i < models.length - 1 ? "1px solid #f0e4cc" : "none" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fffaf4"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <td className="px-5 py-4 font-semibold whitespace-nowrap" style={{ color: "#2a1a08" }}>{model.name}</td>
                                    <td className="px-5 py-4" style={{ color: "#6b4c1a" }}>{model.model_type}</td>
                                    <td className="px-5 py-4" style={{ color: "#6b4c1a" }}>{model.version}</td>
                                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: "#6b4c1a" }}>{model.date_trained}</td>
                                    <td className="px-5 py-4" style={{ color: "#6b4c1a" }}>{model.num_classes}</td>
                                    <td className="px-5 py-4" style={{ color: "#6b4c1a" }}>{model.total_training_images?.toLocaleString()}</td>
                                    <td className="px-5 py-4">{statusBadge(model.status)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {model.status !== "deployed" ? (
                                                <>
                                                    <button onClick={() => deployModel(model.id)} disabled={actionId === model.id}
                                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap"
                                                        style={{ background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#f5e4c0"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "#fdf3e7"}>
                                                        {actionId === model.id ? "..." : "Deploy"}
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(model)}
                                                        className="p-1.5 rounded-lg transition-all"
                                                        style={{ color: "#c0a080" }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = "#fef0eb"; e.currentTarget.style.color = "#c0392b" }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c0a080" }}>
                                                        <DeleteOutlineIcon style={{ fontSize: 16 }} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs italic" style={{ color: "#a08060" }}>Currently serving</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── TRAINING DETAILS ── */}
            {activeTab === "training" && (
                <div className="space-y-4">
                    <div className="flex gap-3 flex-wrap">
                        {models.map(m => (
                            <button key={m.id} onClick={() => setSelectedModel(m)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                style={selectedModel?.id === m.id
                                    ? { background: "#8a5c1a", color: "#fff", border: "1px solid #8a5c1a" }
                                    : { background: "#fff", color: "#8a6030", border: "1px solid #e8d8b8" }}
                                onMouseEnter={e => { if (selectedModel?.id !== m.id) e.currentTarget.style.background = "#fdf3e7" }}
                                onMouseLeave={e => { if (selectedModel?.id !== m.id) e.currentTarget.style.background = "#fff" }}>
                                {m.name}
                            </button>
                        ))}
                    </div>

                    {selectedModel && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {[
                                {
                                    title: "Model Overview", rows: [
                                        ["Model Name", selectedModel.name],
                                        ["Type", selectedModel.model_type],
                                        ["Version", selectedModel.version],
                                        ["Date Trained", selectedModel.date_trained],
                                        ["Dataset", selectedModel.dataset_used],
                                        ["Classes", selectedModel.num_classes],
                                        ["Weight File", selectedModel.weight_file],
                                        ["Status", selectedModel.status],
                                    ]
                                },
                                {
                                    title: "Dataset Split", rows: [
                                        ["Training Images", selectedModel.total_training_images?.toLocaleString()],
                                        ["Validation Images", selectedModel.total_validation_images?.toLocaleString()],
                                        ["Test Images", selectedModel.total_test_images?.toLocaleString()],
                                        ...(selectedModel.training_config ? [
                                            ["Train Split", `${(selectedModel.training_config.train_split * 100).toFixed(0)}%`],
                                            ["Val Split", `${(selectedModel.training_config.val_split * 100).toFixed(0)}%`],
                                            ["Test Split", `${(selectedModel.training_config.test_split * 100).toFixed(0)}%`],
                                        ] : []),
                                    ]
                                },
                                ...(selectedModel.training_config ? [
                                    {
                                        title: "Hyperparameters", rows: [
                                            ["Epochs", selectedModel.training_config.epochs],
                                            ["Batch Size", selectedModel.training_config.batch_size],
                                            ["Learning Rate", selectedModel.training_config.learning_rate],
                                            ["Optimizer", selectedModel.training_config.optimizer],
                                            ["Hardware", selectedModel.training_config.hardware],
                                            ["Training Duration", selectedModel.training_config.training_duration],
                                        ]
                                    },
                                    {
                                        title: "Loss & Augmentation", rows: [
                                            ["Loss Function", selectedModel.training_config.loss_function],
                                            ["Augmentation", selectedModel.training_config.augmentation_used],
                                        ]
                                    },
                                ] : []),
                            ].map(card => (
                                <div key={card.title} className="rounded-2xl p-5 space-y-3"
                                    style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                                    <h2 className="text-sm font-semibold pb-2" style={{ color: "#2a1a08", borderBottom: "1px solid #f0e4cc" }}>{card.title}</h2>
                                    {card.rows.map(([l, v]) => (
                                        <div key={l} className="flex justify-between text-sm">
                                            <span style={{ color: "#a08060" }}>{l}</span>
                                            <span className="font-medium text-right max-w-[60%]" style={{ color: "#2a1a08" }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                                <h2 className="text-sm font-semibold mb-3" style={{ color: "#2a1a08" }}>Notes</h2>
                                <p className="text-sm leading-relaxed" style={{ color: "#7a5a38" }}>{selectedModel.notes || "No notes available."}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── PERFORMANCE DASHBOARD ── */}
            {activeTab === "performance" && (
                <div className="space-y-4">
                    <div className="flex gap-3 flex-wrap">
                        {models.map(m => (
                            <button key={m.id} onClick={() => setSelectedModel(m)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                style={selectedModel?.id === m.id
                                    ? { background: "#8a5c1a", color: "#fff", border: "1px solid #8a5c1a" }
                                    : { background: "#fff", color: "#8a6030", border: "1px solid #e8d8b8" }}
                                onMouseEnter={e => { if (selectedModel?.id !== m.id) e.currentTarget.style.background = "#fdf3e7" }}
                                onMouseLeave={e => { if (selectedModel?.id !== m.id) e.currentTarget.style.background = "#fff" }}>
                                {m.name}
                            </button>
                        ))}
                    </div>

                    {selectedModel && !selectedModel.metrics && (
                        <div className="rounded-2xl p-10 text-center" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                            <BarChartIcon style={{ color: "#ddd0b0", fontSize: 44 }} className="mb-3" />
                            <p className="text-sm font-medium" style={{ color: "#8a6030" }}>No performance metrics available</p>
                            <p className="text-xs mt-1" style={{ color: "#b09070" }}>Metrics are recorded automatically when training completes via the Training Console.</p>
                        </div>
                    )}

                    {selectedModel?.metrics && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    ["Accuracy", selectedModel.metrics.accuracy],
                                    ["Macro F1", selectedModel.metrics.macro_f1],
                                    ["Macro Precision", selectedModel.metrics.macro_precision],
                                    ["Macro Recall", selectedModel.metrics.macro_recall],
                                ].map(([label, val]) => (
                                    <div key={label} className="rounded-2xl p-5 text-center"
                                        style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                                        <p className="text-3xl font-bold" style={{ color: "#8a5c1a" }}>{(val * 100).toFixed(1)}%</p>
                                        <p className="text-xs mt-1" style={{ color: "#a08060" }}>{label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    ["Weighted Precision", selectedModel.metrics.weighted_precision],
                                    ["Weighted Recall", selectedModel.metrics.weighted_recall],
                                    ["Weighted F1", selectedModel.metrics.weighted_f1],
                                ].map(([label, val]) => (
                                    <div key={label} className="rounded-2xl p-4 flex justify-between items-center"
                                        style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                                        <span className="text-sm" style={{ color: "#a08060" }}>{label}</span>
                                        <span className="text-lg font-bold" style={{ color: "#2a1a08" }}>{(val * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                                <div className="px-5 py-3" style={{ borderBottom: "1px solid #f0e4cc" }}>
                                    <h2 className="text-sm font-semibold" style={{ color: "#2a1a08" }}>Per-Class Metrics</h2>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid #f0e4cc" }}>
                                            {["Species", "Precision", "Recall", "F1 Score", "Support"].map(h => (
                                                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest"
                                                    style={{ color: "#a08060" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(selectedModel.metrics.per_class_metrics).map(([species, m], i, arr) => (
                                            <tr key={species} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f0e4cc" : "none" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fffaf4"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                <td className="px-5 py-3 capitalize font-medium" style={{ color: "#2a1a08" }}>{species}</td>
                                                <td className="px-5 py-3" style={{ color: "#6b4c1a" }}>{(m.precision * 100).toFixed(1)}%</td>
                                                <td className="px-5 py-3" style={{ color: "#6b4c1a" }}>{(m.recall * 100).toFixed(1)}%</td>
                                                <td className="px-5 py-3">
                                                    <span className="font-semibold" style={{ color: m.f1 >= 0.9 ? "#2d6a4f" : m.f1 >= 0.7 ? "#8a6030" : "#c0392b" }}>
                                                        {(m.f1 * 100).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3" style={{ color: "#a08060" }}>{m.support}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedModel.artifacts?.filter(a => ["confusion_matrix", "training_curves", "species_distribution", "architecture_comparison"].includes(a.artifact_type)).length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {selectedModel.artifacts
                                        .filter(a => ["confusion_matrix", "training_curves", "species_distribution", "architecture_comparison"].includes(a.artifact_type))
                                        .map(artifact => (
                                            <div key={artifact.id} className="rounded-2xl p-4 space-y-3"
                                                style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
                                                <h3 className="text-sm font-semibold" style={{ color: "#2a1a08" }}>{artifact.label}</h3>
                                                <img src={`${API_BASE}/model-artifacts/${artifact.image_path}`}
                                                    alt={artifact.label} className="w-full rounded-xl object-contain" />
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}