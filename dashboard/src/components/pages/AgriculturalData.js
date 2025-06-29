import React, { useState, useEffect } from 'react';
import { 
  FaSeedling, 
  FaLeaf, 
  FaFilter, 
  FaCalendarAlt,
  FaDownload,
  FaChartBar,
  FaInfoCircle
} from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
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

import './AgriculturalData.css';

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

const AgriculturalData = ({ data }) => {
  
  const [dateRange, setDateRange] = useState({
    start: 0,
    end: data && data.length > 0 ? data.length - 1 : 0
  });
  const [filteredData, setFilteredData] = useState(data || []);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'fields', 'harvests'
  const [selectedField, setSelectedField] = useState(null);
  const [chartType, setChartType] = useState('growth'); // 'growth', 'health', 'yield'
  
// Funzione per filtrare i dati in base al range di date selezionato
// Si attiva quando i dati o il range di date cambiano e aggiorna lo stato dei dati filtrati 
 
  // Inizializza i dati filtrati con i dati originali se non sono ancora disponibili
  useEffect(() => {
    if (data && data.length > 0) {
      const filtered = data.slice(dateRange.start, dateRange.end + 1);
      setFilteredData(filtered);
    }
  }, [data, dateRange]);
  
  if (!data || data.length === 0) {
    return (
      <div className="agricultural-container">
        <div className="alert alert-warning">
          Nessun dato di produzione agricola disponibile. Genera dati utilizzando il simulatore.
        </div>
      </div>
    );
  }
  

  // Estrai tutti i campi unici
  const allFields = [];
  data.forEach(day => {
    day.fields.forEach(field => {
      if (!allFields.some(f => f.fieldId === field.fieldId)) {
        allFields.push({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          cropName: field.cropName
        });
      }
    });
  });

  // Funzione per gestire il cambio del range di date
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  // Prepara i dati per i grafici
  const dates = filteredData.map(day => day.date);

  // Calcola statistiche aggregate
  const aggregateStats = {
    totalFields: allFields.length,
    averageHealth: filteredData.reduce((sum, day) => sum + day.stats.averageHealth, 0) / filteredData.length,
    totalHarvests: filteredData.reduce((sum, day) => sum + (day.harvests ? day.harvests.length : 0), 0),
    totalYield: filteredData.reduce((sum, day) => {
      if (!day.harvests) return sum;
      return sum + day.harvests.reduce((s, h) => s + h.totalYield, 0);
    }, 0),
    totalProfit: filteredData.reduce((sum, day) => {
      if (!day.harvests) return sum;
      return sum + day.harvests.reduce((s, h) => s + h.profit, 0);
    }, 0)
  };

  // Prepara i dati per il grafico di panoramica
  const prepareOverviewChartData = () => {
    // Media giornaliera della salute delle colture
    const avgHealthData = filteredData.map(day => day.stats.averageHealth);
    
    // Numero di campi piantati per giorno
    const plantedFieldsData = filteredData.map(day => day.stats.fieldsPlanted);
    
    // Numero di campi raccolti per giorno
    const harvestedFieldsData = filteredData.map(day => day.stats.fieldsHarvested);
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Salute Media (%)',
          data: avgHealthData,
          borderColor: '#66bb6a',
          backgroundColor: 'rgba(102, 187, 106, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y-health',
        },
        {
          label: 'Campi Piantati',
          data: plantedFieldsData,
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y-fields',
        },
        {
          label: 'Campi Raccolti',
          data: harvestedFieldsData,
          borderColor: '#ffb74d',
          backgroundColor: 'rgba(255, 183, 77, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y-fields',
        },
      ],
    };
  };

  // Prepara i dati per il grafico dei campi
  const prepareFieldChartData = () => {
    if (!selectedField) return null;
    
    // Trova i dati del campo selezionato per ogni giorno
    const fieldData = filteredData.map(day => {
      const field = day.fields.find(f => f.fieldId === selectedField.fieldId);
      return field || { growthStage: 0, healthStatus: 0, expectedYield: 0 };
    });
    
    if (chartType === 'growth') {
      // Dati di crescita
      return {
        labels: dates,
        datasets: [
          {
            label: 'Stadio di Crescita (%)',
            data: fieldData.map(field => field.growthStage),
            borderColor: '#66bb6a',
            backgroundColor: 'rgba(102, 187, 106, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    } else if (chartType === 'health') {
      // Dati di salute
      return {
        labels: dates,
        datasets: [
          {
            label: 'Stato di Salute (%)',
            data: fieldData.map(field => field.healthStatus),
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    } else if (chartType === 'yield') {
      // Dati di resa prevista
      return {
        labels: dates,
        datasets: [
          {
            label: 'Resa Prevista (ton)',
            data: fieldData.map(field => field.expectedYield),
            borderColor: '#ffb74d',
            backgroundColor: 'rgba(255, 183, 77, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
  };

  // Prepara i dati per il grafico dei raccolti
  const prepareHarvestChartData = () => {
    // Raccogli tutti i raccolti dal periodo filtrato
    const allHarvests = [];
    filteredData.forEach(day => {
      if (day.harvests && day.harvests.length > 0) {
        allHarvests.push(...day.harvests);
      }
    });
    
    // Raggruppa i raccolti per tipo di coltura
    const harvestsByCrop = {};
    allHarvests.forEach(harvest => {
      if (!harvestsByCrop[harvest.cropName]) {
        harvestsByCrop[harvest.cropName] = {
          totalYield: 0,
          totalProfit: 0,
          count: 0
        };
      }
      harvestsByCrop[harvest.cropName].totalYield += harvest.totalYield;
      harvestsByCrop[harvest.cropName].totalProfit += harvest.profit;
      harvestsByCrop[harvest.cropName].count += 1;
    });
    
    // Prepara i dati per il grafico a torta
    const cropNames = Object.keys(harvestsByCrop);
    const cropYields = cropNames.map(name => harvestsByCrop[name].totalYield);
    
    return {
      labels: cropNames,
      datasets: [
        {
          data: cropYields,
          backgroundColor: [
            '#4caf50',
            '#2196f3',
            '#ff9800',
            '#f44336',
            '#9c27b0',
            '#00bcd4',
            '#ffeb3b'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  };

  // Funzione per esportare i dati in CSV
  const exportToCSV = () => {
    let csvData = '';
    let headers = [];
    let rows = [];
    
    if (viewMode === 'overview') {
      headers = ['Data', 'Campi Piantati', 'Campi Raccolti', 'Salute Media (%)', 'Resa Prevista (ton)', 'Raccolto Giornaliero (ton)', 'Profitto Giornaliero (€)'];
      rows = filteredData.map(day => [
        day.date,
        day.stats.fieldsPlanted,
        day.stats.fieldsHarvested,
        day.stats.averageHealth,
        day.stats.totalExpectedYield,
        day.stats.totalHarvestedToday,
        day.stats.profitToday
      ]);
    } else if (viewMode === 'fields' && selectedField) {
      headers = ['Data', 'Stadio di Crescita (%)', 'Stato di Salute (%)', 'Resa Prevista (ton)', 'Stato'];
      rows = filteredData.map(day => {
        const field = day.fields.find(f => f.fieldId === selectedField.fieldId);
        return field ? [
          day.date,
          field.growthStage,
          field.healthStatus,
          field.expectedYield,
          field.status
        ] : [day.date, 0, 0, 0, 'N/A'];
      });
    } else if (viewMode === 'harvests') {
      headers = ['Data', 'Campo', 'Coltura', 'Area (ha)', 'Resa (ton)', 'Efficienza (%)', 'Ricavi (€)', 'Costi (€)', 'Profitto (€)'];
      filteredData.forEach(day => {
        if (day.harvests && day.harvests.length > 0) {
          day.harvests.forEach(harvest => {
            rows.push([
              day.date,
              harvest.fieldName,
              harvest.cropName,
              harvest.areaHarvested,
              harvest.totalYield,
              harvest.efficiency,
              harvest.revenue,
              harvest.costs,
              harvest.profit
            ]);
          });
        }
      });
    }
    
    csvData = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dati_agricoli_${viewMode}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="agricultural-container">
      <h1 className="page-title">
        <FaSeedling className="page-title-icon" />
        Dati di Produzione Agricola
      </h1>

      {/* Statistiche aggregate */}
      <div className="agri-stats">
        <div className="stats-card">
          <div className="stats-icon">
            <FaLeaf />
          </div>
          <h3>Campi</h3>
          <div className="stats-value">{aggregateStats.totalFields}</div>
          <div className="stats-label">Totale campi monitorati</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FaSeedling />
          </div>
          <h3>Salute</h3>
          <div className="stats-value">{aggregateStats.averageHealth.toFixed(1)}%</div>
          <div className="stats-label">Salute media delle colture</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FaChartBar />
          </div>
          <h3>Raccolti</h3>
          <div className="stats-value">{aggregateStats.totalHarvests}</div>
          <div className="stats-label">Numero totale di raccolti</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FaChartBar />
          </div>
          <h3>Produzione</h3>
          <div className="stats-value">{aggregateStats.totalYield.toFixed(2)} ton</div>
          <div className="stats-label">Produzione totale</div>
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
            className={`btn ${viewMode === 'overview' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            Panoramica
          </button>
          <button
            className={`btn ${viewMode === 'fields' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('fields')}
          >
            Campi
          </button>
          <button
            className={`btn ${viewMode === 'harvests' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('harvests')}
          >
            Raccolti
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <FaDownload /> Esporta CSV
          </button>
        </div>
      </div>

      {/* Visualizzazione dati */}
      <div className="data-view">
        {viewMode === 'overview' && (
          <div className="overview-view">
            <div className="chart-container">
              <Line 
                data={prepareOverviewChartData()} 
                options={{
                  responsive: true,
                  scales: {
                    'y-health': {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Salute (%)',
                      },
                      min: 0,
                      max: 100,
                    },
                    'y-fields': {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Numero di Campi',
                      },
                      min: 0,
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  },
                }}
              />
            </div>
            
            <h3 className="section-title">Statistiche Giornaliere</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><FaCalendarAlt /> Data</th>
                    <th>Campi Piantati</th>
                    <th>Campi Raccolti</th>
                    <th>Salute Media (%)</th>
                    <th>Resa Prevista (ton)</th>
                    <th>Raccolto Giornaliero (ton)</th>
                    <th>Profitto Giornaliero (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((day, index) => (
                    <tr key={index}>
                      <td>{day.date}</td>
                      <td>{day.stats.fieldsPlanted}</td>
                      <td>{day.stats.fieldsHarvested}</td>
                      <td>{day.stats.averageHealth}</td>
                      <td>{day.stats.totalExpectedYield}</td>
                      <td>{day.stats.totalHarvestedToday}</td>
                      <td>{day.stats.profitToday.toLocaleString('it-IT', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'fields' && (
          <div className="fields-view">
            <div className="field-selector">
              <h3>Seleziona un campo:</h3>
              <div className="field-buttons">
                {allFields.map(field => (
                  <button
                    key={field.fieldId}
                    className={`btn ${selectedField && selectedField.fieldId === field.fieldId ? 'btn-primary' : ''}`}
                    onClick={() => setSelectedField(field)}
                  >
                    {field.fieldName} ({field.cropName})
                  </button>
                ))}
              </div>
            </div>

            {selectedField ? (
              <>
                <div className="field-info">
                  <h3>{selectedField.fieldName}</h3>
                  <p>Coltura: {selectedField.cropName}</p>
                </div>

                <div className="chart-type-selector">
                  <button
                    className={`btn ${chartType === 'growth' ? 'btn-primary' : ''}`}
                    onClick={() => setChartType('growth')}
                  >
                    Crescita
                  </button>
                  <button
                    className={`btn ${chartType === 'health' ? 'btn-primary' : ''}`}
                    onClick={() => setChartType('health')}
                  >
                    Salute
                  </button>
                  <button
                    className={`btn ${chartType === 'yield' ? 'btn-primary' : ''}`}
                    onClick={() => setChartType('yield')}
                  >
                    Resa
                  </button>
                </div>

                <div className="chart-container">
                  <Line data={prepareFieldChartData()} />
                </div>

                <h3 className="section-title">Dati Giornalieri</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th><FaCalendarAlt /> Data</th>
                        <th>Stadio di Crescita (%)</th>
                        <th>Stato di Salute (%)</th>
                        <th>Resa Prevista (ton)</th>
                        <th>Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((day, index) => {
                        const field = day.fields.find(f => f.fieldId === selectedField.fieldId);
                        return field ? (
                          <tr key={index}>
                            <td>{day.date}</td>
                            <td>{field.growthStage}</td>
                            <td>{field.healthStatus}</td>
                            <td>{field.expectedYield}</td>
                            <td>
                              <span className={`status-badge status-${field.status.replace(/\s+/g, '-')}`}>
                                {field.status}
                              </span>
                            </td>
                          </tr>
                        ) : null;
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <FaInfoCircle />
                <p>Seleziona un campo per visualizzare i dati dettagliati.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'harvests' && (
          <div className="harvests-view">
            <div className="chart-container pie-chart-container">
              <h3>Distribuzione Raccolti per Coltura</h3>
              <Pie data={prepareHarvestChartData()} />
            </div>

            <h3 className="section-title">Dettaglio Raccolti</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><FaCalendarAlt /> Data</th>
                    <th>Campo</th>
                    <th>Coltura</th>
                    <th>Area (ha)</th>
                    <th>Resa (ton)</th>
                    <th>Efficienza (%)</th>
                    <th>Ricavi (€)</th>
                    <th>Costi (€)</th>
                    <th>Profitto (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((day, dayIndex) => {
                    if (!day.harvests || day.harvests.length === 0) return null;
                    
                    return day.harvests.map((harvest, harvestIndex) => (
                      <tr key={`${dayIndex}-${harvestIndex}`}>
                        <td>{day.date}</td>
                        <td>{harvest.fieldName}</td>
                        <td>{harvest.cropName}</td>
                        <td>{harvest.areaHarvested}</td>
                        <td>{harvest.totalYield}</td>
                        <td>{harvest.efficiency}%</td>
                        <td>{harvest.revenue.toLocaleString('it-IT', { maximumFractionDigits: 2 })}</td>
                        <td>{harvest.costs.toLocaleString('it-IT', { maximumFractionDigits: 2 })}</td>
                        <td className={harvest.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                          {harvest.profit.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriculturalData;