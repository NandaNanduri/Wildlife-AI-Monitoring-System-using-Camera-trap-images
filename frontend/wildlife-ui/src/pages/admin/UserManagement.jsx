import { useState, useEffect } from "react";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

const api = axios.create({ baseURL: "http://localhost:8000" });
api.interceptors.request.use(cfg => {
  cfg.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
  return cfg;
});

const RoleBadge = ({ isAdmin }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    style={isAdmin
      ? { background: "#fdf3e7", color: "#8a5c1a", border: "1px solid #e8c98a" }
      : { background: "#edf7ee", color: "#2d6a4f", border: "1px solid #a8d4a8" }
    }>
    {isAdmin ? "Admin" : "Conservationist"}
  </span>
);

const StatusBadge = ({ active }) => (
  <span className="inline-flex items-center gap-1 text-xs font-medium"
    style={{ color: active ? "#2d6a4f" : "#a08060" }}>
    {active ? <CheckCircleIcon style={{ fontSize: 13 }} /> : <BlockIcon style={{ fontSize: 13 }} />}
    {active ? "Active" : "Inactive"}
  </span>
);

function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user;
  const [form, setForm] = useState(
    user || { email: "", password: "", first_name: "", last_name: "", is_admin: false, is_conservationist: true }
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  // Mutually exclusive role selection
  const handleRoleSelect = (role) => {
    setForm(prev => ({
      ...prev,
      is_admin: role === "admin",
      is_conservationist: role === "conservationist",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, is_active: true };
      if (isEdit) {
        const res = await api.put(`/api/auth/users/${user.id}/`, payload);
        onSave(res.data);
      } else {
        const res = await api.post("/api/auth/users/", payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.email?.[0] || data?.password?.[0] || data?.error || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#f5ede0",
    border: "1.5px solid #ddd0b0",
    color: "#2a1a08",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#fffaf4", border: "1px solid #ddd0b8" }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #e8d8b8", background: "#3a2008" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#f5d88a" }}>
            {isEdit ? "Edit User" : "Add New User"}
          </h3>
          <button onClick={onClose} className="transition-colors"
            style={{ color: "#c4a070" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f5d88a"}
            onMouseLeave={e => e.currentTarget.style.color = "#c4a070"}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "#8a6030" }}>First Name</label>
              <input name="first_name" type="text" value={form.first_name}
                onChange={handleChange} placeholder="John"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "#8a6030" }}>Last Name</label>
              <input name="last_name" type="text" value={form.last_name}
                onChange={handleChange} placeholder="Doe"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: "#8a6030" }}>Email Address</label>
            <input name="email" type="email" required value={form.email}
              onChange={handleChange} placeholder="user@example.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
              onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
          </div>

          {/* Password (create only) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "#8a6030" }}>Password</label>
              <input name="password" type="password" required value={form.password}
                onChange={handleChange} placeholder="Min. 8 characters"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.border = "1.5px solid #8a5c1a"}
                onBlur={e => e.target.style.border = "1.5px solid #ddd0b0"} />
            </div>
          )}

          {/* Role — mutually exclusive buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#8a6030" }}>Role</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "conservationist", label: "Conservationist" },
                { role: "admin", label: "Administrator" },
              ].map(({ role, label }) => {
                const active = role === "admin" ? form.is_admin : form.is_conservationist;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={active
                      ? { background: "#8a5c1a", color: "#fff", border: "1.5px solid #8a5c1a" }
                      : { background: "#f5ede0", color: "#8a6030", border: "1.5px solid #ddd0b0" }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-xs"
              style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "#f5ede0", color: "#8a6030", border: "1px solid #ddd0b0" }}
              onMouseEnter={e => e.currentTarget.style.background = "#ede0cc"}
              onMouseLeave={e => e.currentTarget.style.background = "#f5ede0"}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: loading ? "#a07840" : "#8a5c1a" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#7a4c0e" }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#8a5c1a" }}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/api/auth/users/${q ? `?search=${q}` : ""}`);
      setUsers(res.data);
    } catch { setError("Failed to load users."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  const openAdd = () => { setEditUser(null); setModalOpen(true); };
  const openEdit = (user) => { setEditUser(user); setModalOpen(true); };

  const handleSave = (savedUser) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === savedUser.id);
      return exists ? prev.map(u => u.id === savedUser.id ? savedUser : u) : [savedUser, ...prev];
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/auth/users/${deleteConfirm.id}/`);
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
    } finally { setDeleteLoading(false); }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#2a1a08" }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: "#8a6030" }}>{users.length} registered users</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: "#8a5c1a" }}
          onMouseEnter={e => e.currentTarget.style.background = "#7a4c0e"}
          onMouseLeave={e => e.currentTarget.style.background = "#8a5c1a"}>
          <PersonAddIcon fontSize="small" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#a08060" }} />
        <input type="text" value={search} onChange={handleSearch}
          placeholder="Search by email..."
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
          style={{ background: "#fff", border: "1px solid #e8d8b8", color: "#2a1a08" }}
          onFocus={e => e.target.style.border = "1px solid #8a5c1a"}
          onBlur={e => e.target.style.border = "1px solid #e8d8b8"} />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fef0eb", border: "1px solid #e8a090", color: "#8a2a1a" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8d8b8" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #f0e4cc" }}>
              {["Name", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#a08060" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm" style={{ color: "#b09070" }}>
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm" style={{ color: "#b09070" }}>
                  No users found.
                </td>
              </tr>
            )}
            {!loading && users.map((user, i) => (
              <tr key={user.id} className="transition-colors"
                style={{ borderBottom: i < users.length - 1 ? "1px solid #f0e4cc" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fffaf4"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td className="px-5 py-4 font-medium" style={{ color: "#2a1a08" }}>
                  {user.first_name || user.last_name
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : <span style={{ color: "#b09070" }}>—</span>}
                </td>
                <td className="px-5 py-4" style={{ color: "#6b4c1a" }}>{user.email}</td>
                <td className="px-5 py-4"><RoleBadge isAdmin={user.is_admin} /></td>
                <td className="px-5 py-4"><StatusBadge active={user.is_active} /></td>
                <td className="px-5 py-4 text-xs" style={{ color: "#a08060" }}>
                  {new Date(user.date_joined).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(user)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: "#a08060" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fdf3e7"; e.currentTarget.style.color = "#8a5c1a" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a08060" }}
                      title="Edit">
                      <EditIcon fontSize="small" />
                    </button>
                    <button onClick={() => setDeleteConfirm(user)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: "#a08060" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fef0eb"; e.currentTarget.style.color = "#c0392b" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a08060" }}
                      title="Delete">
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <UserModal user={editUser} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4"
            style={{ background: "#fffaf4", border: "1px solid #ddd0b8" }}>
            <h3 className="text-base font-bold" style={{ color: "#2a1a08" }}>Delete User?</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#7a5a38" }}>
              <span className="font-medium" style={{ color: "#2a1a08" }}>{deleteConfirm.email}</span> will be permanently removed from the system.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#f5ede0", color: "#8a6030", border: "1px solid #ddd0b0" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ede0cc"}
                onMouseLeave={e => e.currentTarget.style.background = "#f5ede0"}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: deleteLoading ? "#999" : "#c0392b" }}
                onMouseEnter={e => { if (!deleteLoading) e.currentTarget.style.background = "#a93226" }}
                onMouseLeave={e => { if (!deleteLoading) e.currentTarget.style.background = "#c0392b" }}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}