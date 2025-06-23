import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="copyright">
            &copy; {currentYear} Simulatore Dati Ambientali. Tutti i diritti riservati.
          </p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Termini</a>
            <a href="#">Contatti</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;