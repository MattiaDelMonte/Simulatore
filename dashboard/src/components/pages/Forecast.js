import React, { useState } from 'react';
import { 
  FaChartLine, 
  FaThermometerHalf, 
  FaTint, 
  FaCloudRain,
  FaSeedling,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaCloudSun
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';

import './Forecast.css';

// Registra i componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Forecast = () => {
  const [forecastDays, setForecastDays] = useState(7);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('environmental'); // 'environmental' o 'agricultural'

  // Genera previsioni
  const generateForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/forecast', { days: forecastDays });
      setForecastData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Errore nella generazione delle previsioni:', err);
      setError('Si è verificato un errore nella generazione delle previsioni. Riprova più tardi.');
      setLoading(false);
    }
  };

  // Prepara i dati per i grafici ambientali
  const prepareEnvironmentalChartData = () => {
    if (!forecastData) return null;

    const dates = forecastData.map(day => day.date);
    const temperatures = forecastData.map(day => day.environmental.temperature);
    const humidity = forecastData.map(day => day.environmental.humidity);
    const precipitation = forecastData.map(day => day.environmental.precipitation);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: temperatures,
          borderColor: '#ff7043',
          backgroundColor: 'rgba(255, 112, 67, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y-temperature',
        },
        {
          label: 'Umidità (%)',
          data: humidity,
          borderColor: '#29b6f6',
          backgroundColor: 'rgba(41, 182, 246, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y-humidity',
        },
        {
          label: 'Precipitazioni (mm)',
          data: precipitation,
          borderColor: '#5c6bc0',
          backgroundColor: 'rgba(92, 107, 192, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y-precipitation',
        },
      ],
    };
  };

  // Prepara i dati per i grafici agricoli
  const prepareAgriculturalChartData = () => {
    if (!forecastData) return null;

    const dates = forecastData.map(day => day.date);
    const averageHealth = forecastData.map(day => {
      const fields = day.production.fields;
      if (!fields || fields.length === 0) return 0;
      return fields.reduce((sum, field) => sum + field.healthStatus, 0) / fields.length;
    });

    const expectedYield = forecastData.map(day => {
      const fields = day.production.fields;
      if (!fields || fields.length === 0) return 0;
      return fields.reduce((sum, field) => sum + field.expectedYield, 0);
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Salute Media (%)',
          data: averageHealth,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y-health',
        },
        {
          label: 'Resa Prevista (ton)',
          data: expectedYield,
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y-yield',
        },
      ],
    };
  };

  // Opzioni per i grafici ambientali
  const environmentalChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      'y-temperature': {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperatura (°C)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      'y-humidity': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Umidità (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
      'y-precipitation': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Precipitazioni (mm)',
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Opzioni per i grafici agricoli
  const agriculturalChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      'y-health': {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Salute Media (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
      'y-yield': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Resa Prevista (ton)',
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="forecast-container">
      <h1 className="page-title">
        <FaChartLine className="page-title-icon" />
        Previsioni Future
      </h1>

      <div className="forecast-controls">
        <div className="forecast-days-control">
          <label htmlFor="forecastDays">Giorni di previsione:</label>
          <input
            type="range"
            id="forecastDays"
            min="1"
            max="30"
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
          />
          <span>{forecastDays} giorni</span>
        </div>

        <button 
          className="btn btn-primary generate-btn"
          onClick={generateForecast}
          disabled={loading}
        >
          {loading ? <FaSpinner className="fa-spin" /> : 'Genera Previsioni'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {forecastData && (
        <div className="forecast-content">
          <div className="forecast-tabs">
            <button
              className={`tab-btn ${activeTab === 'environmental' ? 'active' : ''}`}
              onClick={() => setActiveTab('environmental')}
            >
              <FaCloudSun /> Dati Ambientali
            </button>
            <button
              className={`tab-btn ${activeTab === 'agricultural' ? 'active' : ''}`}
              onClick={() => setActiveTab('agricultural')}
            >
              <FaSeedling /> Dati Agricoli
            </button>
          </div>

          <div className="chart-container">
            {activeTab === 'environmental' ? (
              <Line data={prepareEnvironmentalChartData()} options={environmentalChartOptions} />
            ) : (
              <Line data={prepareAgriculturalChartData()} options={agriculturalChartOptions} />
            )}
          </div>

          <div className="forecast-table-container">
            <h3 className="section-title">
              <FaCalendarAlt /> Dettaglio Previsioni
            </h3>
            
            {activeTab === 'environmental' ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th><FaThermometerHalf /> Temperatura (°C)</th>
                    <th><FaTint /> Umidità (%)</th>
                    <th><FaCloudRain /> Precipitazioni (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((day, index) => (
                    <tr key={index}>
                      <td>{day.date}</td>
                      <td>{day.environmental.temperature.toFixed(1)}</td>
                      <td>{day.environmental.humidity.toFixed(0)}</td>
                      <td>{day.environmental.precipitation.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Campi Attivi</th>
                    <th>Salute Media (%)</th>
                    <th>Resa Prevista (ton)</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((day, index) => {
                    const fields = day.production.fields || [];
                    const activeFields = fields.filter(f => f.status !== 'Non piantato').length;
                    const avgHealth = fields.length > 0 
                      ? fields.reduce((sum, f) => sum + f.healthStatus, 0) / fields.length 
                      : 0;
                    const totalYield = fields.reduce((sum, f) => sum + f.expectedYield, 0);
                    
                    return (
                      <tr key={index}>
                        <td>{day.date}</td>
                        <td>{activeFields}</td>
                        <td>{avgHealth.toFixed(1)}</td>
                        <td>{totalYield.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {!forecastData && !loading && !error && (
        <div className="no-forecast-message">
          <FaChartLine className="icon" />
          <p>Genera previsioni per visualizzare i dati futuri</p>
        </div>
      )}
    </div>
  );
};

export default Forecast;