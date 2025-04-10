import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChargingStations from "./pages/ChargingStations";
import Dashboard from "./pages/Dashboard";
import BookSlot from "./pages/BookSlot";
import Payment from "./pages/Payment";
import PaymentHistory from "./pages/PaymentHistory";
import Feedback from "./pages/Feedback";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Ensures the page always starts at the top
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <Router>
      <ScrollToTop /> {/* Ensures page scrolls to top when navigating */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/charging-stations" element={
          <ProtectedRoute>
            <ChargingStations />
          </ProtectedRoute>
        } />
        <Route path="/book-slot" element={
          <ProtectedRoute>
            <BookSlot />
          </ProtectedRoute>
        } />
        <Route path="/book-slot/:stationId" element={
          <ProtectedRoute>
            <BookSlot />
          </ProtectedRoute>
        } />
        <Route path="/payment/:bookingId" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <PaymentHistory />
          </ProtectedRoute>
        } />
        <Route path="/feedback/:bookingId" element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
