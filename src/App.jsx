import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InterviewSession from './pages/InterviewSession.jsx';
import CandidateLogin from './pages/CandidateLogin.jsx';
import InterviewTerms from './pages/InterviewTerms.jsx';
import InterviewComplete from './pages/InterviewComplete.jsx';
import RecruiterDashboard from './pages/RecruiterDashboardComplete.jsx';
import RecruiterLogin from './pages/RecruiterLogin.jsx';
import RecruiterRegister from './pages/RecruiterRegister.jsx';
import InterviewReport from './pages/InterviewReport.jsx';
import './index.css';

/**
 * INTERVUEX - Main Application Component
 * Enterprise Virtual Interview Platform with Real-time Proctoring
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Candidate Routes */}
          <Route path="/" element={<Navigate to="/recruiter/login" replace />} />
          <Route path="/login" element={<CandidateLogin />} />
          <Route path="/interview-terms/:token" element={<InterviewTerms />} />
          <Route path="/interview/:token" element={<InterviewSession />} />
          <Route path="/interview-complete" element={<InterviewComplete />} />
          
          {/* Recruiter Routes */}
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/register" element={<RecruiterRegister />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/report/:sessionId" element={<InterviewReport />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/recruiter/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
