import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import ITAssets from "./pages/ITAssets";
import Users from "./pages/Users";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Crew from "./pages/Crew";
import Trips from "./pages/Trips";
import Planes from "./pages/Planes";
import Scheduling from "./pages/Scheduling";
import Dispatch from "./pages/Dispatch";
import Accommodations from "./pages/Accommodations";
import Clients from "./pages/Clients";

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/it-assets" element={
            <ProtectedRoute allowRoles={["Admin", "Dispatcher"]}>
              <ITAssets />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowRoles={["Admin"]}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Dashboard />} />
          <Route path="/crew" element={<Crew />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
