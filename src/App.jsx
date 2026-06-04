import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import AboutUs from './components/AboutUs';
import Events from './components/Events';
import Gallery from './components/Gallery';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import Signup from './Page/Signup';
import Login from './Page/Login';
import PendingApproval from './Page/PendingApproval';
import VerifyEmail from './Page/VerifyEmail';
import ForgotPassword from './Page/ForgotPassword';
import ResetPassword from './Page/ResetPassword';
import CompleteProfile from './Page/CompleteProfile';
import Home from './Page/Home';
import Dashboard from './Page/Dashboard';
import { ExecutiveLandingPage } from './Page/ExecutiveLandingPage';

// Set up a global Axios interceptor to catch token expiration from backend API calls
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 bg-[#f8f5f2] dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-[#8b4513]/30 selection:text-[#d2b48c]">
      {!isDashboard && <Header />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes> 
          <Route path="/" element={<Home />} /> 
          <Route path="/about" element={<AboutUs isFullPage={true} />} /> 
          <Route path="/executives" element={<ExecutiveLandingPage />} />
          <Route path="/events" element={<Events isFullPage={true} />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/complete-profile" 
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </Layout>
    </Router>
  );
}