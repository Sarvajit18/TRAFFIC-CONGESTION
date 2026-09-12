/**
 * What-If Policy Simulation Sandbox for TrafficAI
 * Allows testing climate extremes, incident blockages, and surge scenarios with real-time network impact feedback.
 */

class ScenarioSandbox {
  constructor() {
    this.rainMm = 0;
    this.surgeMultiplier = 1.0;
    this.accidentSeverity = 0;
  }

  updateScenario(rainMm, surgeMultiplier, accidentSeverity) {
    this.rainMm = parseFloat(rainMm);
    this.surgeMultiplier = parseFloat(surgeMultiplier);
    this.accidentSeverity = parseInt(accidentSeverity, 10);

    // Apply simulation impacts to CITY_ROAD_NETWORK edges
    let totalDelayPct = 0;
    let gridlockCount = 0;
    let excessCarbonTons = 0;

    const weather = this.rainMm > 50 ? 'storm' : (this.rainMm > 15 ? 'rain' : 'clear');
    const incident = this.accidentSeverity === 3 ? 'accident_major' : (this.accidentSeverity >= 1 ? 'accident_minor' : 'none');

    window.CITY_ROAD_NETWORK.edges.forEach((edge, idx) => {
      // Calculate adjusted prediction
      const pred = window.mlPredictor.predict({
        edgeId: edge.id,
        horizonMinutes: 15,
        weather: weather,
        incident: idx === 1 && incident !== 'none' ? incident : 'none', // apply incident to downtown
        currentHour: 17.5,
        demandMultiplier: this.surgeMultiplier
      });

      edge.currentSpeed = pred.predictedSpeed;
      edge.currentVolume = pred.predictedVolume;
      edge.occupancy = pred.congestionRiskPct;
      edge.status = pred.status;

      if (pred.status === 'gridlock') gridlockCount++;
      totalDelayPct += (1 - (pred.predictedSpeed / edge.speedLimit)) * 100;
    });

    const avgDelayIncrease = Math.round(totalDelayPct / window.CITY_ROAD_NETWORK.edges.length);
    excessCarbonTons = ((avgDelayIncrease / 100) * 4.8 * this.surgeMultiplier).toFixed(1);

    // Update UI metrics
    const delayEl = document.getElementById('simDelayImpact');
    const gridEl = document.getElementById('simGridlockCount');
    const carbEl = document.getElementById('simExcessCarbon');

    if (delayEl) delayEl.innerText = `+${avgDelayIncrease}%`;
    if (gridEl) gridEl.innerText = `${gridlockCount} corridor${gridlockCount === 1 ? '' : 's'}`;
    if (carbEl) carbEl.innerText = `+${excessCarbonTons} tons CO₂/h`;

    // Re-render GIS map
    if (window.trafficMapManager) {
      window.trafficMapManager.updateRoadStates(window.CITY_ROAD_NETWORK.edges);
    }
  }

  reset() {
    this.rainMm = 0;
    this.surgeMultiplier = 1.0;
    this.accidentSeverity = 0;

    const rSlider = document.getElementById('sliderRain');
    const sSlider = document.getElementById('sliderSurge');
    const aSlider = document.getElementById('sliderAccident');

    const rVal = document.getElementById('sliderRainVal');
    const sVal = document.getElementById('sliderSurgeVal');
    const aVal = document.getElementById('sliderAccidentVal');

    if (rSlider) rSlider.value = 0;
    if (sSlider) sSlider.value = 1.0;
    if (aSlider) aSlider.value = 0;

    if (rVal) rVal.innerText = '0 mm/h (Dry)';
    if (sVal) sVal.innerText = '1.0x (Normal)';
    if (aVal) aVal.innerText = '0 (None)';

    this.updateScenario(0, 1.0, 0);
  }
}

window.scenarioSandbox = new ScenarioSandbox();
