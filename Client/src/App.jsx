import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Auth from './Pages/Auth';
import LandingPage from './Pages/LandingPage';
import Dashboard from './Pages/Dashboard';
import Project from './Pages/Project';
import TrashProject from './Pages/TrashProject';
import Task from './Pages/Task'
import Notification from './Pages/Notification';
import { ToastContainer } from 'react-toastify';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false)
  }, []);


  // Protect routes
  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/auth" />;
  };

  // While checking token, don't render anything
  if (loading) return null;


  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      {isLoggedIn && <Header setIsLoggedIn={setIsLoggedIn} />}
      <div className={`flex flex-1 ${isLoggedIn ? 'pt-16' : ''} h-screen overflow-hidden`}>
        {isLoggedIn && <Sidebar />}

        <main className="flex-1 overflow-y-auto relative bg-slate-50/60 hide-scrollbar">
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth setIsLoggedIn={setIsLoggedIn} />} />

            {/* Private routes */}
            <Route path="/" element={<PrivateRoute><LandingPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/project" element={<PrivateRoute><Project /></PrivateRoute>} />
            <Route path="/trash" element={<PrivateRoute><TrashProject /></PrivateRoute>} />
            <Route path="/task/:projectId" element={<PrivateRoute><Task /></PrivateRoute>} />
            <Route path="/notification" element={<PrivateRoute><Notification /></PrivateRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isLoggedIn ? location.pathname : "/auth"} />} />
          </Routes>

          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </div>
    </div>
  );
}

export default App;
