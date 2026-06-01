import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import AboutUs from './components/AboutUs';
import Events from './components/Events';
import Gallery from './components/Gallery';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import Home from './Page/Home';
import Signup from './Page/Signup';
import PendingApproval from './Page/PendingApproval'; // Import the PendingApproval component
import VerifyEmail from './Page/VerifyEmail';
import Login from './Page/Login';
import ForgotPassword from './Page/ForgotPassword';
import ResetPassword from './Page/ResetPassword';
 import { ExecutiveLandingPage } from './pages/ExecutiveLandingPage';
import CompleteProfile from './Page/CompleteProfile';
import Dashboard from './Page/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Assuming you have an App.css for global styles

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
    <div className="min-h-screen bg-[#041004] text-white font-sans selection:bg-green-700 selection:text-white flex flex-col">
      {!isDashboard && <Header />}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<AboutUs isFullPage={true} />} />
          <Route path="/events" element={<Events isFullPage={true} />} />
          <Route path="/gallery" element={<Gallery />} />
         <Route path="/executives" element={<ExecutiveLandingPage />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;