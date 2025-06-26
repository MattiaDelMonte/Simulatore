import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Componenti
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/pages/Dashboard';
import EnvironmentalData from './components/pages/EnvironmentalData';
import AgriculturalData from './components/pages/AgriculturalData';
import Simulator from './components/pages/Simulator';
import Footer from './components/layout/Footer';

// Stili
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    environmental: [],
    production: [],
    latest: null
  });

  // Carica i dati all'avvio dell'applicazione
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Se sei su GitHub Pages, usa dati statici
        if (window.location.hostname.includes("github.io")) {
          setData({
            latest: { /* dati finti */ },
            environmental: [ /* dati finti */ ],
            production: [ /* dati finti */ ]
          });
          setLoading(false);
          return;
        }
        // ...altrimenti usa le API reali
        const latestResponse = await axios.get('/api/data/latest');
        const environmentalResponse = await axios.get('/api/data/environmental');
        const productionResponse = await axios.get('/api/data/production');
        setData({
          latest: latestResponse.data,
          environmental: environmentalResponse.data,
          production: productionResponse.data
        });
        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError('Si è verificato un errore nel caricamento dei dati. Riprova più tardi.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funzione per aggiornare i dati dopo una nuova simulazione
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Carica i dati più recenti
      const latestResponse = await axios.get('/api/data/latest');
      
      // Carica i dati ambientali
      const environmentalResponse = await axios.get('/api/data/environmental');
      
      // Carica i dati di produzione
      const productionResponse = await axios.get('/api/data/production');
      
      setData({
        latest: latestResponse.data,
        environmental: environmentalResponse.data,
        production: productionResponse.data
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Errore nell\'aggiornamento dei dati:', err);
      setError('Si è verificato un errore nell\'aggiornamento dei dati. Riprova più tardi.');
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Caricamento dati in corso...</p>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard data={data} />} />
                <Route path="/environmental" element={<EnvironmentalData data={data.environmental} />} />
                <Route path="/agricultural" element={<AgriculturalData data={data.production} />} />
                <Route path="/simulator" element={<Simulator refreshData={refreshData} />} />
              </Routes>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;