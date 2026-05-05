import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ConservationistLayout from "./layouts/ConservationistLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ConservationistDashboard from "./pages/conservationist/Dashboard";
import Profile from "./pages/conservationist/Profile";  // ← add this
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminProfile from "./pages/admin/Profile";
import ModelManagement from "./pages/admin/ModelManagement";
import TrainingConsole from "./pages/admin/TrainingConsole";
import InsightSettings from "./pages/admin/InsightSettings";

function AdminRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const isAdmin = localStorage.getItem("is_admin") === "true";
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;
  return children;
}

function ConservationistRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const isCons = localStorage.getItem("is_conservationist") === "true";
  if (!token || !isCons) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="/admin/model-management" element={<ModelManagement />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="/admin/training" element={<TrainingConsole />} />
          <Route path="/admin/insight-settings" element={<InsightSettings />} />
        </Route>

        <Route path="/conservationist" element={<ConservationistRoute><ConservationistLayout /></ConservationistRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ConservationistDashboard />} />
          <Route path="profile" element={<Profile />} />  {/* ← add this */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;