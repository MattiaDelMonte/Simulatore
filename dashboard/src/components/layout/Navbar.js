import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaBell, FaCog, FaUser } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <FaLeaf className="logo-icon" />
            <span>Simulatore Dati Ambientali</span>
          </Link>
        </div>
        
        <div className="navbar-search">
          <input type="text" placeholder="Cerca..." />
          <button type="button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
        <div className="navbar-actions">
          <button className="navbar-action-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
          
          <button className="navbar-action-btn">
            <FaCog />
          </button>
          
          <div className="navbar-user">
            <button className="user-profile-btn">
              <FaUser className="user-icon" />
              <span className="user-name">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;