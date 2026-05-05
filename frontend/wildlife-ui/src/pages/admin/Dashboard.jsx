import { useState, useEffect } from "react";
import axios from "axios";
import PeopleIcon from "@mui/icons-material/People";
import ImageIcon from "@mui/icons-material/Image";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const api = axios.create({ baseURL: "http://localhost:8000" });
api.interceptors.request.use(cfg => {
  cfg.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
  return cfg;
});

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function StatCard({ icon, label, value, loading, accent }) {
  return (
    <div className="rounded-2xl p-6 flex items-center gap-5"
      style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent.bg }}>
        <span style={{ color: accent.icon }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#a08060" }}>{label}</p>
        {loading
          ? <div className="h-8 w-20 rounded-lg animate-pulse" style={{ background: "#f5ead4" }} />
          : <p className="text-3xl font-bold" style={{ color: "#2a1a08" }}>{value?.toLocaleString() ?? 0}</p>
        }
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/admin/stats/")
      .then(res => setStats(res.data))
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#8a6030" }}>System overview and recent activity</p>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={<PeopleIcon />} label="Total Users" value={stats?.total_users} loading={loading}
          accent={{ bg: "#fdf3e7", icon: "#8a5c1a" }} />
        <StatCard icon={<ImageIcon />} label="Images Uploaded" value={stats?.total_images} loading={loading}
          accent={{ bg: "#edf7ee", icon: "#2d6a4f" }} />
        <StatCard icon={<PsychologyIcon />} label="Predictions Made" value={stats?.total_predictions} loading={loading}
          accent={{ bg: "#fef0eb", icon: "#8a3a1a" }} />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent uploads */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid #f0e4cc" }}>
            <CloudUploadIcon fontSize="small" style={{ color: "#8a5c1a" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#2a1a08" }}>Recent Uploads</h2>
          </div>
          <div className="px-6">
            {loading && (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#f5ead4" }} />
                ))}
              </div>
            )}
            {!loading && stats?.recent_uploads?.length === 0 && (
              <p className="text-sm py-6" style={{ color: "#b09070" }}>No uploads yet.</p>
            )}
            {!loading && stats?.recent_uploads?.map((item, i) => {
              const { date, time } = formatDateTime(item.uploaded_at);
              return (
                <div key={i} className="flex items-center justify-between py-3.5"
                  style={{ borderBottom: i < stats.recent_uploads.length - 1 ? "1px solid #f0e4cc" : "none" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2a1a08" }}>Image #{item.image_id} uploaded</p>
                    <p className="text-xs mt-0.5" style={{ color: "#a08060" }}>{item.user}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xs font-medium" style={{ color: "#6b4c1a" }}>{date}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#b09070" }}>{time} · {timeAgo(item.uploaded_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent predictions */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid #f0e4cc" }}>
            <CheckCircleIcon fontSize="small" style={{ color: "#2d6a4f" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#2a1a08" }}>Recent Predictions</h2>
          </div>
          <div className="px-6">
            {loading && (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#f5ead4" }} />
                ))}
              </div>
            )}
            {!loading && stats?.recent_predictions?.length === 0 && (
              <p className="text-sm py-6" style={{ color: "#b09070" }}>No predictions yet.</p>
            )}
            {!loading && stats?.recent_predictions?.map((item, i) => {
              const { date, time } = formatDateTime(item.predicted_at);
              return (
                <div key={i} className="flex items-center justify-between py-3.5"
                  style={{ borderBottom: i < stats.recent_predictions.length - 1 ? "1px solid #f0e4cc" : "none" }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium"
                        style={{ color: item.is_empty ? "#a08060" : "#2a1a08" }}>
                        {item.is_empty ? "Empty Frame" : item.species}
                      </span>
                      {!item.is_empty && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: "#edf7ee", color: "#2d6a4f" }}>
                          {item.confidence}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "#a08060" }}>{item.user}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xs font-medium" style={{ color: "#6b4c1a" }}>{date}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#b09070" }}>{time} · {timeAgo(item.predicted_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}