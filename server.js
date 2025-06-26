/**
 * Server Express per servire l'API dei dati simulati e la dashboard React
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Simulator = require('./simulator');

// Inizializza il simulatore
const simulator = new Simulator();

// Verifica se esistono già dati simulati, altrimenti genera 365 giorni di dati
if (!simulator.loadData()) {
    console.log('Generazione di 365 giorni di dati simulati...');
    simulator.simulateBatch(365);
    console.log('Generazione completata.');
}

// Inizializza l'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Cartella per i dati simulati
const dataFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

// Endpoint API

// Restituisce tutti i dati simulati
app.get('/api/data', (req, res) => {
    res.json(simulator.getAllData());
});

// Restituisce i dati più recenti
app.get('/api/data/latest', (req, res) => {
    const latestData = simulator.getLatestData();
    if (latestData) {
        res.json(latestData);
    } else {
        res.status(404).json({ error: 'Nessun dato disponibile' });
    }
});

// Restituisce i dati ambientali
app.get('/api/data/environmental', (req, res) => {
    const allData = simulator.getAllData();
    const environmentalData = allData.map(data => data.environmental);
    res.json(environmentalData);
});

// Restituisce i dati di produzione
app.get('/api/data/production', (req, res) => {
    const allData = simulator.getAllData();
    const productionData = allData.map(data => data.production);
    res.json(productionData);
});

// Restituisce i dati per un intervallo di date specifico
app.get('/api/data/range', (req, res) => {
    const { start, end } = req.query;
    
    if (!start || !end) {
        return res.status(400).json({ error: 'Parametri start e end richiesti' });
    }
    
    try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const allData = simulator.getAllData();
        const filteredData = allData.filter(data => {
            const dataDate = new Date(data.timestamp);
            return dataDate >= startDate && dataDate <= endDate;
        });
        
        res.json(filteredData);
    } catch (error) {
        res.status(400).json({ error: 'Formato data non valido' });
    }
});

// Genera nuovi dati simulati
app.post('/api/simulate', (req, res) => {
    const { days = 1 } = req.body;
    
    if (isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({ error: 'Il parametro days deve essere un numero tra 1 e 365' });
    }
    
    try {
        const newData = simulator.simulateBatch(days);
        res.json({ success: true, count: newData.length, data: newData });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante la simulazione', details: error.message });
    }
});

// Resetta il simulatore
app.post('/api/reset', (req, res) => {
    try {
        simulator.reset();
        res.json({ success: true, message: 'Simulatore resettato con successo' });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante il reset', details: error.message });
    }
});

// Servi i file statici della dashboard React
app.use(express.static(path.join(__dirname, 'dashboard/build')));

// Per qualsiasi altra richiesta, servi l'app React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard/build', 'index.html'));
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
    console.log(`Dashboard disponibile su http://localhost:${PORT}`);
    console.log(`API disponibile su http://localhost:${PORT}/api/data`);
});