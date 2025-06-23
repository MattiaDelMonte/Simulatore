import React, { useState, useEffect } from 'react';
import { 
  FaCloudSun, 
  FaThermometerHalf, 
  FaTint, 
  FaCloudRain,
  FaFilter,
  FaCalendarAlt,
  FaDownload
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

import './EnvironmentalData.css';

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

const EnvironmentalData = ({ data }) => {
 
 const [dateRange, setDateRange] = useState({
    start: 0,
    end: data && data.length > 0 ? data.length - 1 : 0
  });
  const [filteredData, setFilteredData] = useState(data || []);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' o 'table'
  const [chartType, setChartType] = useState('all'); // 'all', 'temperature', 'humidity', 'precipitation'

  // Aggiorna i dati filtrati quando cambiano i filtri
  useEffect(() => {
    if (data && data.length > 0) {
      const filtered = data.slice(dateRange.start, dateRange.end + 1);
      setFilteredData(filtered);
    }
  }, [data, dateRange]);
  
  // Funzione per gestire il cambio del range di date
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };
  
  // Verifica se i dati sono disponibili DOPO aver dichiarato tutti gli Hooks e funzioni
  if (!data || data.length === 0) {
    return (
      <div className="environmental-container">
        <div className="alert alert-warning">
          Nessun dato ambientale disponibile. Genera dati utilizzando il simulatore.
        </div>
      </div>
    );
  }

  // Prepara i dati per i grafici
  const dates = filteredData.map(day => day.date);
  const temperatures = filteredData.map(day => day.temperature);
  const humidity = filteredData.map(day => day.humidity);
  const precipitation = filteredData.map(day => day.precipitation);

  // Calcola statistiche
  const stats = {
    temperature: {
      min: Math.min(...temperatures).toFixed(1),
      max: Math.max(...temperatures).toFixed(1),
      avg: (temperatures.reduce((sum, val) => sum + val, 0) / temperatures.length).toFixed(1)
    },
    humidity: {
      min: Math.min(...humidity).toFixed(0),
      max: Math.max(...humidity).toFixed(0),
      avg: (humidity.reduce((sum, val) => sum + val, 0) / humidity.length).toFixed(0)
    },
    precipitation: {
      total: precipitation.reduce((sum, val) => sum + val, 0).toFixed(1),
      max: Math.max(...precipitation).toFixed(1),
      daysWithRain: precipitation.filter(val => val > 0).length
    }
  };

  // Configurazione dei grafici
  let chartData;
  let chartOptions;

  if (chartType === 'all') {
    // Grafico con tutte le variabili
    chartData = {
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

    chartOptions = {
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
  } else if (chartType === 'temperature') {
    // Grafico temperatura
    chartData = {
      labels: dates,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: temperatures,
          borderColor: '#ff7043',
          backgroundColor: 'rgba(255, 112, 67, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  } else if (chartType === 'humidity') {
    // Grafico umidità
    chartData = {
      labels: dates,
      datasets: [
        {
          label: 'Umidità (%)',
          data: humidity,
          borderColor: '#29b6f6',
          backgroundColor: 'rgba(41, 182, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    chartOptions = {
      scales: {
        y: {
          min: 0,
          max: 100,
        },
      },
    };
  } else if (chartType === 'precipitation') {
    // Grafico precipitazioni
    chartData = {
      labels: dates,
      datasets: [
        {
          label: 'Precipitazioni (mm)',
          data: precipitation,
          borderColor: '#5c6bc0',
          backgroundColor: 'rgba(92, 107, 192, 0.3)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    chartOptions = {
      scales: {
        y: {
          min: 0,
        },
      },
    };
  }

  // Funzione per esportare i dati in CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Temperatura (°C)', 'Umidità (%)', 'Precipitazioni (mm)'];
    const csvData = [
      headers.join(','),
      ...filteredData.map(day => [
        day.date,
        day.temperature,
        day.humidity,
        day.precipitation
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dati_ambientali.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="environmental-container">
      <h1 className="page-title">
        <FaCloudSun className="page-title-icon" />
        Dati Ambientali
      </h1>

      {/* Statistiche */}
      <div className="env-stats">
        <div className="stats-card">
          <div className="stats-icon">
            <FaThermometerHalf />
          </div>
          <h3>Temperatura</h3>
          <div className="stats-details">
            <div className="stat-item">
              <span className="stat-label">Min:</span>
              <span className="stat-value">{stats.temperature.min}°C</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Max:</span>
              <span className="stat-value">{stats.temperature.max}°C</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Media:</span>
              <span className="stat-value">{stats.temperature.avg}°C</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FaTint />
          </div>
          <h3>Umidità</h3>
          <div className="stats-details">
            <div className="stat-item">
              <span className="stat-label">Min:</span>
              <span className="stat-value">{stats.humidity.min}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Max:</span>
              <span className="stat-value">{stats.humidity.max}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Media:</span>
              <span className="stat-value">{stats.humidity.avg}%</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FaCloudRain />
          </div>
          <h3>Precipitazioni</h3>
          <div className="stats-details">
            <div className="stat-item">
              <span className="stat-label">Totale:</span>
              <span className="stat-value">{stats.precipitation.total} mm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Max:</span>
              <span className="stat-value">{stats.precipitation.max} mm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Giorni di pioggia:</span>
              <span className="stat-value">{stats.precipitation.daysWithRain}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri e controlli */}
      <div className="controls-container">
        <div className="filter-group">
          <FaFilter />
          <span>Filtra per periodo:</span>
          <div className="range-selector">
            <input
              type="range"
              name="start"
              min="0"
              max={data.length - 1}
              value={dateRange.start}
              onChange={handleRangeChange}
            />
            <span>{data[dateRange.start].date}</span>
          </div>
          <div className="range-selector">
            <input
              type="range"
              name="end"
              min="0"
              max={data.length - 1}
              value={dateRange.end}
              onChange={handleRangeChange}
            />
            <span>{data[dateRange.end].date}</span>
          </div>
        </div>

        <div className="view-controls">
          <button
            className={`btn ${viewMode === 'chart' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            Grafico
          </button>
          <button
            className={`btn ${viewMode === 'table' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Tabella
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <FaDownload /> Esporta CSV
          </button>
        </div>
      </div>

      {/* Selezione tipo di grafico */}
      {viewMode === 'chart' && (
        <div className="chart-type-selector">
          <button
            className={`btn ${chartType === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setChartType('all')}
          >
            Tutti i dati
          </button>
          <button
            className={`btn ${chartType === 'temperature' ? 'btn-primary' : ''}`}
            onClick={() => setChartType('temperature')}
          >
            <FaThermometerHalf /> Temperatura
          </button>
          <button
            className={`btn ${chartType === 'humidity' ? 'btn-primary' : ''}`}
            onClick={() => setChartType('humidity')}
          >
            <FaTint /> Umidità
          </button>
          <button
            className={`btn ${chartType === 'precipitation' ? 'btn-primary' : ''}`}
            onClick={() => setChartType('precipitation')}
          >
            <FaCloudRain /> Precipitazioni
          </button>
        </div>
      )}

      {/* Visualizzazione dati */}
      <div className="data-view">
        {viewMode === 'chart' ? (
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <FaCalendarAlt /> Data
                  </th>
                  <th>
                    <FaThermometerHalf /> Temperatura (°C)
                  </th>
                  <th>
                    <FaTint /> Umidità (%)
                  </th>
                  <th>
                    <FaCloudRain /> Precipitazioni (mm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((day, index) => (
                  <tr key={index}>
                    <td>{day.date}</td>
                    <td>{day.temperature}</td>
                    <td>{day.humidity}</td>
                    <td>{day.precipitation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentalData;