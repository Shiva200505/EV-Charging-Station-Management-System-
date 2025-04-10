import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <FaBolt className="logo-icon" />
        <h1 className="logo">VoltCharge</h1>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/charging-stations">Charging Stations</Link></li>
            <li><Link to="/book-slot">Book Slot</Link></li>
            <li><Link to="/payments">Payments</Link></li>
            <li><Link to="/feedback">Feedback</Link></li>
            <li><button className="logout-nav-button" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
