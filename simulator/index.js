/**
 * Simulatore principale che integra i simulatori di dati ambientali e di produzione agricola
 * Genera e gestisce i dati simulati per l'utilizzo nella dashboard
 */

const EnvironmentalDataSimulator = require('./environmentalDataSimulator');
const AgriculturalProductionSimulator = require('./agriculturalProductionSimulator');
const fs = require('fs');
const path = require('path');

class Simulator {
    constructor(config = {}) {
        // Configurazione predefinita
        this.config = {
            // Configurazione della simulazione
            simulation: {
                startDate: new Date(2023, 0, 1),  // 1 gennaio 2023
                timeStep: 'day',  // Intervallo di tempo (hour, day, week)
                dataFolder: path.join(__dirname, '../data'),  // Cartella per salvare i dati
                autoSave: true,  // Salvataggio automatico dei dati
            },
            // Configurazioni specifiche per i simulatori
            environmental: {},
            agricultural: {}
        };

        // Sovrascrive la configurazione predefinita con quella fornita
        this.mergeConfig(config);

        // Assicura che la configurazione del tempo sia coerente tra i simulatori
        this.config.environmental.time = {
            startDate: this.config.simulation.startDate,
            timeStep: this.config.simulation.timeStep
        };

        // Crea i simulatori
        this.environmentalSimulator = new EnvironmentalDataSimulator(this.config.environmental);
        this.agriculturalSimulator = new AgriculturalProductionSimulator(this.config.agricultural);

        // Stato interno del simulatore
        this.simulationData = [];
        this.currentDate = new Date(this.config.simulation.startDate);

        // Crea la cartella dei dati se non esiste
        if (this.config.simulation.autoSave) {
            this.ensureDataFolder();
        }
    }

    /**
     * Unisce in modo ricorsivo le configurazioni
     * @param {Object} target - Oggetto target
     * @param {Object} source - Oggetto sorgente
     * @returns {Object} - Oggetto target con le proprietà unite
     */
    mergeConfig(source, target = this.config) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Object && key in target) {
                    this.mergeConfig(source[key], target[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    /**
     * Assicura che la cartella dei dati esista
     */
    ensureDataFolder() {
        if (!fs.existsSync(this.config.simulation.dataFolder)) {
            fs.mkdirSync(this.config.simulation.dataFolder, { recursive: true });
        }
    }

    /**
     * Simula un singolo intervallo di tempo
     * @returns {Object} - Dati simulati per l'intervallo di tempo
     */
    simulateTimeStep() {
        // Genera dati ambientali
        const environmentalData = this.environmentalSimulator.generateData();
        
        // Simula la produzione agricola in base ai dati ambientali
        const productionData = this.agriculturalSimulator.simulateDay(environmentalData);
        
        // Unisce i dati
        const simulationData = {
            timestamp: environmentalData.timestamp,
            date: environmentalData.date,
            environmental: environmentalData,
            production: productionData
        };
        
        // Aggiunge i dati alla cronologia
        this.simulationData.push(simulationData);
        
        // Salva i dati se richiesto
        if (this.config.simulation.autoSave) {
            this.saveData();
        }
        
        return simulationData;
    }

    /**
     * Simula un numero specificato di intervalli di tempo
     * @param {number} count - Numero di intervalli di tempo da simulare
     * @returns {Array} - Array di dati simulati
     */
    simulateBatch(count) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.simulateTimeStep());
        }
        return results;
    }

    /**
     * Salva i dati simulati su file
     */
    saveData() {
        const dataFile = path.join(this.config.simulation.dataFolder, 'simulation_data.json');
        fs.writeFileSync(dataFile, JSON.stringify(this.simulationData, null, 2));
        
        // Salva anche i dati più recenti separatamente per un accesso più facile
        const latestDataFile = path.join(this.config.simulation.dataFolder, 'latest_data.json');
        const latestData = this.simulationData[this.simulationData.length - 1];
        fs.writeFileSync(latestDataFile, JSON.stringify(latestData, null, 2));
    }

    /**
     * Carica i dati simulati da file
     * @returns {boolean} - true se i dati sono stati caricati con successo, false altrimenti
     */
    loadData() {
        const dataFile = path.join(this.config.simulation.dataFolder, 'simulation_data.json');
        if (fs.existsSync(dataFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
                this.simulationData = data;
                return true;
            } catch (error) {
                console.error('Errore nel caricamento dei dati:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Restituisce tutti i dati simulati
     * @returns {Array} - Array di tutti i dati simulati
     */
    getAllData() {
        return [...this.simulationData];
    }

    /**
     * Restituisce i dati più recenti
     * @returns {Object|null} - Dati più recenti o null se non ci sono dati
     */
    getLatestData() {
        if (this.simulationData.length === 0) {
            return null;
        }
        return this.simulationData[this.simulationData.length - 1];
    }

    /**
     * Resetta il simulatore allo stato iniziale
     */
    reset() {
        this.environmentalSimulator.reset();
        this.agriculturalSimulator.reset();
        this.simulationData = [];
        this.currentDate = new Date(this.config.simulation.startDate);
    }
}

module.exports = Simulator;

// Se il file viene eseguito direttamente, avvia una simulazione di esempio
if (require.main === module) {
    console.log('Avvio simulazione di esempio...');
    
    const simulator = new Simulator();
    
    // Simula 365 giorni (un anno)
    console.log('Simulazione di 365 giorni in corso...');
    const startTime = Date.now();
    
    const data = simulator.simulateBatch(365);
    
    const endTime = Date.now();
    console.log(`Simulazione completata in ${(endTime - startTime) / 1000} secondi.`);
    console.log(`Generati ${data.length} giorni di dati.`);
    console.log(`I dati sono stati salvati in: ${simulator.config.simulation.dataFolder}`);
}