import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Tracker from './pages/Tracker.jsx';
import HRDashboardMock from './pages/HRDashboardMock.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/tracker/:token" element={<Tracker />} />
      <Route path="/hr" element={<HRDashboardMock />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
