/**
 * Simulatore di dati di produzione agricola
 * Genera dati casuali per raccolti, crescita delle colture e produzione
 * utilizzando distribuzioni statistiche e correlazioni con i dati ambientali
 */

class AgriculturalProductionSimulator {
    constructor(config = {}) {
        // Configurazione predefinita
        this.config = {
            // Tipi di colture disponibili
            crops: [
                {
                    name: 'Pomodori',
                    growthDays: 80,
                    optimalTemp: { min: 20, max: 32 },
                    optimalHumidity: { min: 60, max: 90 },
                    waterNeeds: 600,
                    yieldPerHectare: 35.0,
                    pricePerTon: 450,
                    costPerHectare: 3500,
                },
                {
                    name: 'Olivo',
                    growthDays: 210,
                    optimalTemp: { min: 10, max: 35 },
                    optimalHumidity: { min: 40, max: 70 },
                    waterNeeds: 450,
                    yieldPerHectare: 4.5,
                    pricePerTon: 1200,
                    costPerHectare: 3500,
                },
                {
                    name: 'Vite',
                    growthDays: 180,
                    optimalTemp: { min: 12, max: 28 },
                    optimalHumidity: { min: 40, max: 70 },
                    waterNeeds: 300,
                    yieldPerHectare: 12.0,
                    pricePerTon: 800,
                    costPerHectare: 4500,
                }
            ],
            // Configurazione dei campi
            fields: [
                { id: 1, name: 'Campo 1', size: 5, cropIndex: 0 },    // 5 ettari di pomodori
                { id: 2, name: 'Campo 2', size: 8, cropIndex: 1 },    // 8 ettari di olivo
                { id: 3, name: 'Campo 3', size: 12, cropIndex: 2 }       // 12 ettari di vite
            ],
            // Parametri di simulazione
            simulation: {
                pestProbability: 0.15,  // Probabilità di infestazione parassitaria
                diseaseProbability: 0.1,  // Probabilità di malattie delle piante
                irrigationEfficiency: 0.85,  // Efficienza dell'irrigazione (0-1)
                fertilizerEfficiency: 0.9,  // Efficienza dei fertilizzanti (0-1)
                randomVariation: 0.1,  // Variazione casuale nella produzione (±10%)
            }
        };

        // Sovrascrive la configurazione predefinita con quella fornita
        Object.assign(this.config, config);

        // Stato interno del simulatore
        this.fieldStatus = this.initializeFieldStatus();
        this.historicalData = [];
    }

    /**
     * Inizializza lo stato di tutti i campi
     * @returns {Array} - Array con lo stato iniziale di tutti i campi
     */
    initializeFieldStatus() {
        return this.config.fields.map(field => ({
            fieldId: field.id,
            fieldName: field.name,
            fieldSize: field.size,
            cropName: this.config.crops[field.cropIndex].name,
            cropIndex: field.cropIndex,
            plantingDate: null,
            harvestDate: null,
            growthStage: 0,  // 0-100%
            healthStatus: 100,  // 0-100%
            waterReceived: 0,  // mm di acqua ricevuta finora
            expectedYield: 0,  // tonnellate previste
            actualYield: 0,  // tonnellate effettive (dopo il raccolto)
            status: 'non piantato'  // non piantato, in crescita, pronto per il raccolto, raccolto
        }));
    }

    /**
     * Calcola un fattore di stress ambientale in base alle condizioni meteo
     * @param {Object} environmentalData - Dati ambientali (temperatura, umidità, precipitazioni)
     * @param {Object} crop - Configurazione della coltura
     * @returns {number} - Fattore di stress (0-1, dove 1 è ottimale)
     */
    calculateEnvironmentalStressFactor(environmentalData, crop) {
        // Fattore di temperatura (0-1)
        let tempFactor = 1.0;
        if (environmentalData.temperature < crop.optimalTemp.min) {
            // Troppo freddo
            tempFactor = Math.max(0, 1 - (crop.optimalTemp.min - environmentalData.temperature) / 10);
        } else if (environmentalData.temperature > crop.optimalTemp.max) {
            // Troppo caldo
            tempFactor = Math.max(0, 1 - (environmentalData.temperature - crop.optimalTemp.max) / 10);
        }

        // Fattore di umidità (0-1)
        let humidityFactor = 1.0;
        if (environmentalData.humidity < crop.optimalHumidity.min) {
            // Troppo secco
            humidityFactor = Math.max(0, 1 - (crop.optimalHumidity.min - environmentalData.humidity) / 30);
        } else if (environmentalData.humidity > crop.optimalHumidity.max) {
            // Troppo umido
            humidityFactor = Math.max(0, 1 - (environmentalData.humidity - crop.optimalHumidity.max) / 30);
        }

        // Media ponderata dei fattori (temperatura più importante dell'umidità)
        return tempFactor * 0.6 + humidityFactor * 0.4;
    }

    /**
     * Simula la crescita di una coltura in base ai dati ambientali
     * @param {Object} field - Stato attuale del campo
     * @param {Object} environmentalData - Dati ambientali
     * @param {Date} currentDate - Data corrente della simulazione
     * @returns {Object} - Stato aggiornato del campo
     */
    simulateGrowth(field, environmentalData, currentDate) {
        const crop = this.config.crops[field.cropIndex];
        const updatedField = { ...field };

        // Se il campo non è ancora piantato, lo piantiamo
        if (field.status === 'non piantato') {
            updatedField.plantingDate = new Date(currentDate);
            updatedField.harvestDate = new Date(currentDate);
            updatedField.harvestDate.setDate(updatedField.harvestDate.getDate() + crop.growthDays);
            updatedField.status = 'in crescita';
            updatedField.growthStage = 0;
            updatedField.waterReceived = 0;
            updatedField.healthStatus = 100;
            
            // Calcola la resa prevista in condizioni ottimali
            updatedField.expectedYield = crop.yieldPerHectare * field.fieldSize;
            return updatedField;
        }

        // Se il campo è già stato raccolto, non facciamo nulla
        if (field.status === 'raccolto') {
            return updatedField;
        }

        // Aggiorna l'acqua ricevuta
        updatedField.waterReceived += environmentalData.precipitation;

        // Calcola il fattore di stress ambientale
        const stressFactor = this.calculateEnvironmentalStressFactor(environmentalData, crop);

        // Aggiorna lo stato di salute della coltura
        const simulation = this.config.simulation;
        let healthChange = 0;

        // Effetto dello stress ambientale sulla salute
        healthChange -= (1 - stressFactor) * 2;

        // Possibilità di parassiti
        if (Math.random() < simulation.pestProbability) {
            healthChange -= Math.random() * 5; // Perdita di salute da 0% a 5%
        }

        // Possibilità di malattie (più probabili in condizioni umide)
        const diseaseProb = simulation.diseaseProbability * 
            (environmentalData.humidity > 80 ? 1.5 : 1.0);
        if (Math.random() < diseaseProb) {
            healthChange -= Math.random() * 8; // Perdita di salute da 0% a 8%
        }

        // Recupero naturale della salute (in condizioni ottimali)
        healthChange += stressFactor * 1;

        // Applica il cambiamento di salute
        updatedField.healthStatus = Math.max(0, Math.min(100, updatedField.healthStatus + healthChange));

        // Calcola l'incremento di crescita giornaliero
        // In condizioni ottimali, la crescita dovrebbe essere 100% / growthDays
        const optimalDailyGrowth = 100 / crop.growthDays;
        
        // La crescita effettiva dipende dallo stato di salute e dallo stress ambientale
        const actualDailyGrowth = optimalDailyGrowth * (updatedField.healthStatus / 100) * stressFactor;
        
        // Aggiorna lo stadio di crescita
        updatedField.growthStage = Math.min(100, updatedField.growthStage + actualDailyGrowth);

        // Aggiorna lo stato del campo
        if (updatedField.growthStage >= 100) {
            updatedField.status = 'pronto per il raccolto';
        }

        // Aggiorna la resa prevista in base allo stato di salute e all'acqua ricevuta
        const waterFactor = Math.min(1, updatedField.waterReceived / crop.waterNeeds);
        const healthFactor = updatedField.healthStatus / 100;
        
        // Calcola la resa prevista considerando tutti i fattori
        const basePotentialYield = crop.yieldPerHectare * field.fieldSize;
        const yieldMultiplier = waterFactor * 0.4 + healthFactor * 0.6;
        
        // Aggiungi una variazione casuale alla resa
        const randomVariation = 1 + (Math.random() * 2 - 1) * simulation.randomVariation;
        
        updatedField.expectedYield = basePotentialYield * yieldMultiplier * randomVariation;

        return updatedField;
    }

    /**
     * Simula il raccolto di un campo
     * @param {Object} field - Stato attuale del campo
     * @returns {Object} - Stato aggiornato del campo e dati del raccolto
     */
    harvestField(field) {
        if (field.status !== 'pronto per il raccolto') {
            return { field, harvestData: null };
        }

        const crop = this.config.crops[field.cropIndex];
        const updatedField = { ...field };
        
        // Imposta lo stato a 'raccolto'
        updatedField.status = 'raccolto';
        
        // La resa effettiva è la resa prevista con una piccola variazione casuale
        const actualYield = field.expectedYield * (0.95 + Math.random() * 0.1); // ±5%
        updatedField.actualYield = parseFloat(actualYield.toFixed(2));
        
        // Calcola i dati finanziari
        const revenue = actualYield * crop.pricePerTon;
        const costs = field.fieldSize * crop.costPerHectare;
        const profit = revenue - costs;
        
        // Calcola l'efficienza del raccolto (resa effettiva / resa teorica ottimale)
        const optimalYield = crop.yieldPerHectare * field.fieldSize;
        const efficiency = (actualYield / optimalYield) * 100;
        
        // Dati del raccolto
        const harvestData = {
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            cropName: crop.name,
            harvestDate: new Date(),
            areaHarvested: field.fieldSize,
            yieldPerHectare: parseFloat((actualYield / field.fieldSize).toFixed(2)),
            totalYield: parseFloat(actualYield.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(2)),
            revenue: parseFloat(revenue.toFixed(2)),
            costs: parseFloat(costs.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            waterEfficiency: parseFloat((actualYield / field.waterReceived).toFixed(3)),
            healthAtHarvest: field.healthStatus
        };
        
        return { field: updatedField, harvestData };
    }

    /**
     * Simula un giorno di produzione agricola in base ai dati ambientali
     * @param {Object} environmentalData - Dati ambientali del giorno
     * @returns {Object} - Dati di produzione agricola generati
     */
    simulateDay(environmentalData) {
        // Converti la stringa timestamp in un oggetto Date
        const currentDate = new Date(environmentalData.timestamp);
        
        // Aggiorna lo stato di ogni campo
        const updatedFields = [];
        const harvestData = [];
        
        for (const field of this.fieldStatus) {
            // Simula la crescita
            const updatedField = this.simulateGrowth(field, environmentalData, currentDate);
            
            // Verifica se il campo è pronto per il raccolto
            if (updatedField.status === 'pronto per il raccolto') {
                // Probabilità del 80% di raccogliere quando è pronto
                if (Math.random() < 0.8) {
                    const harvestResult = this.harvestField(updatedField);
                    updatedFields.push(harvestResult.field);
                    if (harvestResult.harvestData) {
                        harvestData.push(harvestResult.harvestData);
                    }
                } else {
                    updatedFields.push(updatedField);
                }
            } else {
                updatedFields.push(updatedField);
            }
        }
        
        // Aggiorna lo stato interno
        this.fieldStatus = updatedFields;
        
        // Crea l'oggetto dati di produzione
        const productionData = {
            timestamp: environmentalData.timestamp,
            date: environmentalData.date,
            fields: updatedFields.map(field => ({
                fieldId: field.fieldId,
                fieldName: field.fieldName,
                cropName: field.cropName,
                status: field.status,
                growthStage: parseFloat(field.growthStage.toFixed(1)),
                healthStatus: parseFloat(field.healthStatus.toFixed(1)),
                expectedYield: parseFloat(field.expectedYield.toFixed(2))
            })),
            harvests: harvestData,
            // Statistiche aggregate
            stats: {
                totalFields: updatedFields.length,
                fieldsPlanted: updatedFields.filter(f => f.status !== 'non piantato').length,
                fieldsHarvested: updatedFields.filter(f => f.status === 'raccolto').length,
                averageHealth: parseFloat((updatedFields.reduce((sum, f) => sum + f.healthStatus, 0) / updatedFields.length).toFixed(1)),
                totalExpectedYield: parseFloat(updatedFields.reduce((sum, f) => sum + f.expectedYield, 0).toFixed(2)),
                totalHarvestedToday: harvestData.length > 0 ? 
                    parseFloat(harvestData.reduce((sum, h) => sum + h.totalYield, 0).toFixed(2)) : 0,
                profitToday: harvestData.length > 0 ? 
                    parseFloat(harvestData.reduce((sum, h) => sum + h.profit, 0).toFixed(2)) : 0
            }
        };
        
        // Aggiungi i dati alla cronologia
        this.historicalData.push(productionData);
        
        return productionData;
    }

    /**
     * Simula la produzione agricola per un batch di dati ambientali
     * @param {Array} environmentalDataBatch - Array di dati ambientali
     * @returns {Array} - Array di dati di produzione agricola
     */
    simulateBatch(environmentalDataBatch) {
        const results = [];
        for (const envData of environmentalDataBatch) {
            results.push(this.simulateDay(envData));
        }
        return results;
    }

    /**
     * Restituisce tutti i dati storici di produzione generati finora
     * @returns {Array} - Array di tutti i dati di produzione generati
     */
    getHistoricalData() {
        return [...this.historicalData];
    }

    /**
     * Resetta il simulatore allo stato iniziale
     */
    reset() {
        this.fieldStatus = this.initializeFieldStatus();
        this.historicalData = [];
    }
}

module.exports = AgriculturalProductionSimulator;