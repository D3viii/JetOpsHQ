import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Crew from "./pages/Crew";
import Trips from "./pages/Trips";
import Planes from "./pages/Planes";
import Scheduling from "./pages/Scheduling";
import Dispatch from "./pages/Dispatch";
import Accommodations from "./pages/Accommodations";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crew" element={<Crew />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
