import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/Login';
import ITAssets from './pages/ITAssets';
import Users from './pages/Users';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Crew from './pages/Crew';
import Trips from './pages/Trips';
import Planes from './pages/Planes';
import Scheduling from './pages/Scheduling';
import Dispatch from './pages/Dispatch';
import Accommodations from './pages/Accommodations';
import Clients from './pages/Clients';
import MarketingPage from './pages/MarketingPage';
import jetOpsLogo from './assets/jetopshq-logo.png';
import './App.css';

const DEMO_UNLOCK_KEY = 'jetopshq.demo.unlocked';
const DEMO_PASSWORD = (process.env.REACT_APP_DEMO_PASSWORD || 'jetopshqdemo').trim();

function DemoGate({ forcePrompt = false }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (forcePrompt) return false;
    return window.sessionStorage.getItem(DEMO_UNLOCK_KEY) === 'true';
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === DEMO_PASSWORD) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(DEMO_UNLOCK_KEY, 'true');
      }
      setUnlocked(true);
      setMessage('');
      if (forcePrompt) {
        navigate('/dashboard');
      }
      return;
    }

    setMessage('Incorrect password. Try again.');
  };

  if (!forcePrompt && unlocked) {
    return <Outlet />;
  }

  return (
    <main className="demo-gate-page">
      <section className="demo-gate-card">
        <img src={jetOpsLogo} alt="JetOpsHQ logo" className="jhq-demo-logo" />
        <p className="jhq-eyebrow">Protected JetOpsHQ demo</p>
        <h1>Enter password to access the JetOpsHQ demo.</h1>
        <p>
          This environment is intentionally gated so only approved viewers can access the operational walkthrough.
        </p>
        <form className="demo-gate-form" onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter demo password"
            aria-label="Demo password"
          />
          <button type="submit" className="jhq-primary-button">Unlock demo</button>
        </form>
        {message ? <p className="demo-gate-message">{message}</p> : null}
        <div className="demo-gate-divider">
          <span>Need access?</span>
        </div>
        <div className="demo-request-note">
          <p>If you would like to request a walkthrough, email <a href="mailto:dcarr@carridentitygroup.com">dcarr@carridentitygroup.com</a>.</p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="/demo" element={<DemoGate forcePrompt />} />
          <Route element={<DemoGate />}>
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crew" element={<Crew />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/planes" element={<Planes />} />
              <Route path="/scheduling" element={<Scheduling />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/accommodations" element={<Accommodations />} />
              <Route path="/clients" element={<Clients />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
