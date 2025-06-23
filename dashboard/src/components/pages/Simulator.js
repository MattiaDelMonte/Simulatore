import React, { useState } from 'react';
import axios from 'axios';
import { FaPlay, FaTrash, FaSpinner } from 'react-icons/fa';
import './Simulator.css';

const Simulator = ({ refreshData }) => {
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Funzione per eseguire una nuova simulazione
  const runSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const response = await axios.post('/api/simulate', { days });
      
      setResult({
        success: true,
        message: `Simulazione completata con successo! Generati ${response.data.count} giorni di dati.`,
        data: response.data.data
      });
      
      // Aggiorna i dati nella dashboard principale
      if (refreshData) {
        refreshData();
      }
    } catch (err) {
      console.error('Errore durante la simulazione:', err);
      setError('Si è verificato un errore durante la simulazione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per resettare il simulatore
  const resetSimulator = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      await axios.post('/api/reset');
      
      setResult({
        success: true,
        message: 'Simulatore resettato con successo! Tutti i dati sono stati eliminati.'
      });
      
      // Aggiorna i dati nella dashboard principale
      if (refreshData) {
        refreshData();
      }
      
      setResetConfirm(false);
    } catch (err) {
      console.error('Errore durante il reset:', err);
      setError('Si è verificato un errore durante il reset. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulator-container">
      <h1 className="page-title">Simulatore</h1>
      
      <div className="simulator-card">
        <h2>Genera Nuovi Dati</h2>
        <p className="simulator-description">
          Utilizza questo strumento per generare nuovi dati ambientali e di produzione agricola simulati.
          Puoi specificare il numero di giorni da simulare (da 1 a 365).
        </p>
        
        <div className="simulator-controls">
          <div className="form-group">
            <label htmlFor="days">Numero di giorni:</label>
            <input 
              type="number" 
              id="days" 
              min="1" 
              max="365" 
              value={days} 
              onChange={(e) => setDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 1)))} 
              disabled={loading}
            />
          </div>
          
          <button 
            className="btn-simulate" 
            onClick={runSimulation} 
            disabled={loading}
          >
            {loading ? <FaSpinner className="icon-spin" /> : <FaPlay />} 
            {loading ? 'Simulazione in corso...' : 'Avvia Simulazione'}
          </button>
        </div>
      </div>
      
      <div className="simulator-card">
        <h2>Reset Simulatore</h2>
        <p className="simulator-description">
          Questa operazione eliminerà tutti i dati simulati esistenti. Questa azione non può essere annullata.
        </p>
        
        {!resetConfirm ? (
          <button 
            className="btn-reset" 
            onClick={() => setResetConfirm(true)} 
            disabled={loading}
          >
            <FaTrash /> Reset Dati
          </button>
        ) : (
          <div className="reset-confirm">
            <p>Sei sicuro di voler eliminare tutti i dati?</p>
            <div className="reset-buttons">
              <button 
                className="btn-confirm" 
                onClick={resetSimulator} 
                disabled={loading}
              >
                {loading ? <FaSpinner className="icon-spin" /> : 'Conferma Reset'}
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => setResetConfirm(false)} 
                disabled={loading}
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
      
      {result && (
        <div className={`result-message ${result.success ? 'success' : 'error'}`}>
          {result.message}
        </div>
      )}
      
      {error && (
        <div className="result-message error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Simulator;