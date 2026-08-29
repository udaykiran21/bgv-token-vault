import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HRDashboard from './pages/HRDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        isActive
          ? 'bg-indigo-700 text-white shadow-sm'
          : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

function AppContent() {
  return (
    <div className="min-h-screen bg-indigo-100 flex flex-col font-sans">
      <nav className="bg-indigo-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-white font-bold text-xl tracking-tight">DeVerify</span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <NavLink to="/hr">HR Dashboard</NavLink>
                  <NavLink to="/candidate">Candidate Dashboard</NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/hr" element={<HRDashboard />} />
            <Route path="/candidate" element={<CandidateDashboard />} />
            <Route path="/" element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                  Decentralized Employment Verification
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-indigo-500">
                  A secure, blockchain-based system to issue, manage, and verify employment records.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                  <Link to="/hr" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    I am an HR
                  </Link>
                  <Link to="/candidate" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                    I am a Candidate
                  </Link>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </main>

      <footer className="bg-indigo-50 border-t border-indigo-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-indigo-500">
            &copy; {new Date().getFullYear()} DeVerify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
