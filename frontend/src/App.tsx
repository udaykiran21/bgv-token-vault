import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HRDashboard from './pages/HRDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <nav style={{ marginBottom: '20px', padding: '10px', background: '#eee' }}>
          <Link to="/hr" style={{ marginRight: '20px' }}>HR Dashboard</Link>
          <Link to="/candidate">Candidate Dashboard</Link>
        </nav>

        <Routes>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/candidate" element={<CandidateDashboard />} />
          <Route path="/" element={
            <div>
              <h1>Decentralized Employment Verification</h1>
              <p>Select a dashboard above.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
