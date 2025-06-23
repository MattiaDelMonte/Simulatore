/**
 * Simulatore di dati ambientali
 * Genera dati casuali per temperatura, umidità e precipitazioni
 * utilizzando distribuzioni statistiche per simulare variazioni realistiche
 */

class EnvironmentalDataSimulator {
    constructor(config = {}) {
        // Configurazione predefinita
        this.config = {
            // Temperatura (°C)
            temperature: {
                min: -5,
                max: 40,
                mean: 18,  // Media annuale
                stdDev: 8,  // Deviazione standard
                seasonalVariation: true,  // Variazione stagionale
            },
            // Umidità (%)
            humidity: {
                min: 20,
                max: 100,
                mean: 65,
                stdDev: 15,
                correlationWithTemp: -0.7,  // Correlazione negativa con la temperatura
            },
            // Precipitazioni (mm)
            precipitation: {
                probabilityOfRain: 0.3,  // Probabilità di pioggia in un giorno
                meanAmount: 5,  // Quantità media di pioggia (mm)
                maxAmount: 50,  // Quantità massima di pioggia (mm)
                seasonalVariation: true,  // Variazione stagionale
            },
            // Parametri temporali
            time: {
                startDate: new Date(2023, 0, 1),  // 1 gennaio 2023
                timeStep: 'day',  // Intervallo di tempo (hour, day, week)
            }
        };

        // Sovrascrive la configurazione predefinita con quella fornita
        Object.assign(this.config, config);

        // Stato interno del simulatore
        this.currentDate = new Date(this.config.time.startDate);
        this.historicalData = [];
    }

    /**
     * Genera un numero casuale da una distribuzione normale (gaussiana)
     * @param {number} mean - Media della distribuzione
     * @param {number} stdDev - Deviazione standard della distribuzione
     * @returns {number} - Numero casuale dalla distribuzione normale
     */
    gaussianRandom(mean, stdDev) {
        // Algoritmo Box-Muller per generare numeri casuali con distribuzione normale
        const u1 = 1 - Math.random(); // Conversione da [0,1) a (0,1]
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stdDev + mean;
    }

    /**
     * Limita un valore all'interno di un intervallo specificato
     * @param {number} value - Valore da limitare
     * @param {number} min - Limite inferiore
     * @param {number} max - Limite superiore
     * @returns {number} - Valore limitato nell'intervallo [min, max]
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Calcola il fattore stagionale (da -1 a 1) in base alla data
     * @param {Date} date - Data per cui calcolare il fattore stagionale
     * @returns {number} - Fattore stagionale (-1 per inverno, 1 per estate)
     */
    getSeasonalFactor(date) {
        // Calcola il giorno dell'anno (0-365)
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        // Converte il giorno dell'anno in un valore sinusoidale tra -1 e 1
        // dove -1 è il picco dell'inverno e 1 è il picco dell'estate
        return Math.sin((dayOfYear - 172) * (2 * Math.PI / 365));
    }

    /**
     * Genera dati di temperatura in base alla configurazione e alla data
     * @param {Date} date - Data per cui generare i dati
     * @returns {number} - Temperatura in °C
     */
    generateTemperature(date) {
        const config = this.config.temperature;
        let baseTemp = this.gaussianRandom(config.mean, config.stdDev);
        
        // Applica variazione stagionale se abilitata
        if (config.seasonalVariation) {
            const seasonalFactor = this.getSeasonalFactor(date);
            // Aggiunge fino a ±10°C in base alla stagione
            baseTemp += seasonalFactor * 10;
        }
        
        // Limita la temperatura nell'intervallo configurato
        return this.clamp(baseTemp, config.min, config.max);
    }

    /**
     * Genera dati di umidità in base alla configurazione e alla temperatura
     * @param {number} temperature - Temperatura corrente in °C
     * @returns {number} - Umidità in %
     */
    generateHumidity(temperature) {
        const config = this.config.humidity;
        
        // Base di umidità con distribuzione normale
        let baseHumidity = this.gaussianRandom(config.mean, config.stdDev);
        
        // Applica correlazione con la temperatura
        // Quando fa più caldo, l'umidità tende ad essere più bassa
        const tempEffect = (temperature - this.config.temperature.mean) * config.correlationWithTemp;
        baseHumidity += tempEffect;
        
        // Limita l'umidità nell'intervallo configurato
        return this.clamp(Math.round(baseHumidity), config.min, config.max);
    }

    /**
     * Genera dati di precipitazioni in base alla configurazione e alla data
     * @param {Date} date - Data per cui generare i dati
     * @param {number} humidity - Umidità corrente in %
     * @returns {number} - Precipitazioni in mm
     */
    generatePrecipitation(date, humidity) {
        const config = this.config.precipitation;
        
        // Probabilità base di pioggia
        let rainProbability = config.probabilityOfRain;
        
        // Aumenta la probabilità di pioggia con l'aumentare dell'umidità
        rainProbability *= (humidity / 100) * 1.5;
        
        // Applica variazione stagionale se abilitata
        if (config.seasonalVariation) {
            const seasonalFactor = this.getSeasonalFactor(date);
            // Più pioggia in primavera e autunno, meno in estate e inverno
            rainProbability *= 1 - Math.abs(seasonalFactor) * 0.3;
        }
        
        // Determina se piove oggi
        if (Math.random() < rainProbability) {
            // Genera quantità di pioggia con distribuzione esponenziale
            // (molte piogge leggere, poche piogge intense)
            const rainAmount = -Math.log(1 - Math.random()) * config.meanAmount;
            return this.clamp(rainAmount, 0, config.maxAmount);
        }
        
        return 0; // Nessuna precipitazione
    }

    /**
     * Avanza la data corrente in base al timeStep configurato
     */
    advanceTime() {
        const timeStep = this.config.time.timeStep;
        const currentDate = this.currentDate;
        
        switch (timeStep) {
            case 'hour':
                currentDate.setHours(currentDate.getHours() + 1);
                break;
            case 'day':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            default:
                currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    /**
     * Genera un set completo di dati ambientali per la data corrente
     * @returns {Object} - Dati ambientali generati
     */
    generateData() {
        // Crea una copia della data corrente
        const date = new Date(this.currentDate);
        
        // Genera temperatura
        const temperature = parseFloat(this.generateTemperature(date).toFixed(1));
        
        // Genera umidità basata sulla temperatura
        const humidity = this.generateHumidity(temperature);
        
        // Genera precipitazioni basate su umidità e data
        const precipitation = parseFloat(this.generatePrecipitation(date, humidity).toFixed(1));
        
        // Crea oggetto dati
        const data = {
            timestamp: date.toISOString(),
            date: date.toLocaleDateString(),
            temperature,
            humidity,
            precipitation
        };
        
        // Aggiunge i dati alla cronologia
        this.historicalData.push(data);
        
        // Avanza la data per la prossima generazione
        this.advanceTime();
        
        return data;
    }

    /**
     * Genera dati ambientali per un numero specificato di intervalli di tempo
     * @param {number} count - Numero di intervalli di tempo da simulare
     * @returns {Array} - Array di dati ambientali generati
     */
    generateBatch(count) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.generateData());
        }
        return results;
    }

    /**
     * Restituisce tutti i dati storici generati finora
     * @returns {Array} - Array di tutti i dati ambientali generati
     */
    getHistoricalData() {
        return [...this.historicalData];
    }

    /**
     * Resetta il simulatore alla data di inizio configurata
     */
    reset() {
        this.currentDate = new Date(this.config.time.startDate);
        this.historicalData = [];
    }
}

module.exports = EnvironmentalDataSimulator;