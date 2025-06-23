import React from 'react';
import { 
  FaThermometerHalf, 
  FaTint, 
  FaCloudRain, 
  FaSeedling,
  FaLeaf,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import './Dashboard.css';

// Registra i componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = ({ data }) => {
  // Verifica se i dati sono disponibili
  if (!data || !data.environmental || !data.production || !data.latest) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-warning">
          Nessun dato disponibile. Genera dati utilizzando il simulatore.
        </div>
      </div>
    );
  }

  // Estrai i dati più recenti
  const latestData = data.latest;
  const latestEnv = latestData.environmental;
  const latestProd = latestData.production;

  // Prepara i dati per i grafici
  const last30Days = data.environmental.slice(-30);
  const dates = last30Days.map(day => day.date);
  const temperatures = last30Days.map(day => day.temperature);
  const humidity = last30Days.map(day => day.humidity);
  const precipitation = last30Days.map(day => day.precipitation);

  // Dati per il grafico della temperatura
  const temperatureChartData = {
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

  // Dati per il grafico dell'umidità e precipitazioni
  const humidityPrecipitationChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Umidità (%)',
        data: humidity,
        borderColor: '#29b6f6',
        backgroundColor: 'rgba(41, 182, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Precipitazioni (mm)',
        data: precipitation,
        borderColor: '#5c6bc0',
        backgroundColor: 'rgba(92, 107, 192, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  // Opzioni per il grafico dell'umidità e precipitazioni
  const humidityPrecipitationOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Umidità (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
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

  // Estrai i dati di produzione per i grafici
  const productionData = data.production.slice(-30);
  
  // Calcola la media di salute delle colture per ogni giorno
  const cropHealthData = productionData.map(day => {
    const fields = day.fields;
    const avgHealth = fields.reduce((sum, field) => sum + field.healthStatus, 0) / fields.length;
    return avgHealth;
  });

  // Dati per il grafico della salute delle colture
  const cropHealthChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Salute Media Colture (%)',
        data: cropHealthData,
        borderColor: '#66bb6a',
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Calcola i dati per il grafico a ciambella dello stato dei campi
  const fieldStatusCounts = {
    'non piantato': 0,
    'in crescita': 0,
    'pronto per il raccolto': 0,
    'raccolto': 0
  };

  latestProd.fields.forEach(field => {
    fieldStatusCounts[field.status]++;
  });

  const fieldStatusChartData = {
    labels: Object.keys(fieldStatusCounts),
    datasets: [
      {
        data: Object.values(fieldStatusCounts),
        backgroundColor: [
          '#e0e0e0',  // non piantato
          '#81c784',  // in crescita
          '#ffb74d',  // pronto per il raccolto
          '#4caf50',  // raccolto
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Calcola i dati finanziari totali
  const totalHarvests = data.production.reduce((total, day) => {
    return total + (day.harvests ? day.harvests.length : 0);
  }, 0);

  const totalYield = data.production.reduce((total, day) => {
    if (!day.harvests) return total;
    return total + day.harvests.reduce((sum, harvest) => sum + harvest.totalYield, 0);
  }, 0);

  const totalRevenue = data.production.reduce((total, day) => {
    if (!day.harvests) return total;
    return total + day.harvests.reduce((sum, harvest) => sum + harvest.revenue, 0);
  }, 0);

  const totalProfit = data.production.reduce((total, day) => {
    if (!day.harvests) return total;
    return total + day.harvests.reduce((sum, harvest) => sum + harvest.profit, 0);
  }, 0);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">
        <FaChartLine className="page-title-icon" />
        Dashboard
      </h1>
      
      <div className="date-info">
        <FaCalendarAlt className="date-icon" />
        <span>Dati aggiornati al: {latestData.date}</span>
      </div>
      
      <div className="dashboard-summary">
        <h2>Riepilogo</h2>
        <div className="metrics-container">
          {/* Metriche ambientali */}
          <div className="metric-card">
            <div className="metric-icon">
              <FaThermometerHalf />
            </div>
            <h3 className="metric-title">Temperatura</h3>
            <div className="metric-value">{latestEnv.temperature}°C</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FaTint />
            </div>
            <h3 className="metric-title">Umidità</h3>
            <div className="metric-value">{latestEnv.humidity}%</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FaCloudRain />
            </div>
            <h3 className="metric-title">Precipitazioni</h3>
            <div className="metric-value">{latestEnv.precipitation} mm</div>
          </div>
          
          {/* Metriche di produzione */}
          <div className="metric-card">
            <div className="metric-icon">
              <FaSeedling />
            </div>
            <h3 className="metric-title">Campi Attivi</h3>
            <div className="metric-value">{latestProd.stats.fieldsPlanted}</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FaLeaf />
            </div>
            <h3 className="metric-title">Salute Media</h3>
            <div className="metric-value">{latestProd.stats.averageHealth}%</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <FaMoneyBillWave />
            </div>
            <h3 className="metric-title">Profitto Totale</h3>
            <div className="metric-value">€{totalProfit.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-charts">
        <div className="grid">
          {/* Grafico temperatura */}
          <div className="widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <FaThermometerHalf />
                Andamento Temperatura
              </h3>
            </div>
            <div className="widget-content">
              <div className="chart-container">
                <Line data={temperatureChartData} />
              </div>
            </div>
          </div>
          
          {/* Grafico umidità e precipitazioni */}
          <div className="widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <FaTint />
                Umidità e Precipitazioni
              </h3>
            </div>
            <div className="widget-content">
              <div className="chart-container">
                <Line data={humidityPrecipitationChartData} options={humidityPrecipitationOptions} />
              </div>
            </div>
          </div>
          
          {/* Grafico salute colture */}
          <div className="widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <FaSeedling />
                Salute delle Colture
              </h3>
            </div>
            <div className="widget-content">
              <div className="chart-container">
                <Line data={cropHealthChartData} />
              </div>
            </div>
          </div>
          
          {/* Grafico stato dei campi */}
          <div className="widget">
            <div className="widget-header">
              <h3 className="widget-title">
                <FaLeaf />
                Stato dei Campi
              </h3>
            </div>
            <div className="widget-content">
              <div className="chart-container doughnut-container">
                <Doughnut data={fieldStatusChartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <h2>Statistiche di Produzione</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Raccolti Totali</h3>
            <div className="stat-value">{totalHarvests}</div>
          </div>
          
          <div className="stat-card">
            <h3>Produzione Totale</h3>
            <div className="stat-value">{totalYield.toFixed(2)} ton</div>
          </div>
          
          <div className="stat-card">
            <h3>Ricavi Totali</h3>
            <div className="stat-value">€{totalRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
          </div>
          
          <div className="stat-card">
            <h3>Profitto Totale</h3>
            <div className="stat-value">€{totalProfit.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;