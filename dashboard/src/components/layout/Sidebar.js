import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaCloudSun, 
  FaSeedling, 
  FaCogs,
  FaBars,
  FaTimes,
  FaChartArea
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <div className="sidebar-mobile-toggle" onClick={toggleMobileSidebar}>
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </div>
      
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaHome className="nav-icon" />
                <span className="nav-text">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/environmental" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaCloudSun className="nav-icon" />
                <span className="nav-text">Dati Ambientali</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/agricultural" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaSeedling className="nav-icon" />
                <span className="nav-text">Produzione Agricola</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/simulator" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaCogs className="nav-icon" />
                <span className="nav-text">Simulatore</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/forecast" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaChartArea className="nav-icon" />
                <span className="nav-text">Previsioni</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <p className="version-info">{isCollapsed ? 'v1.0' : 'Versione 1.0'}</p>
        </div>
      </aside>
      
      {isMobileOpen && <div className="sidebar-backdrop" onClick={toggleMobileSidebar}></div>}
    </>
  );
};

export default Sidebar;