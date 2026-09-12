/**
 * TrafficAI - Master Application Coordinator
 * Coordinates GIS map, AI forecasting, dynamic A* rerouting, signal controllers, and analytics.
 */

class TrafficAIApp {
  constructor() {
    this.currentTab = 'live-map';
    this.simRunning = true;
    this.simSpeed = 2;
    this.simInterval = null;
    this.clockMinutes = 17 * 60 + 30; // Starts at 17:30 (Evening peak)
    this.trafficMap = null;
  }

  init() {
    // Theme setup
    const savedTheme = localStorage.getItem('trafficai_theme_v1') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Initialize GIS Map
    setTimeout(() => {
      this.trafficMap = new window.TrafficMapManager('leafletMap');
      this.trafficMap.init();
      window.trafficMapManager = this.trafficMap;
    }, 100);

    // Initialize Charts
    setTimeout(() => {
      if (window.analyticsChartsManager) {
        window.analyticsChartsManager.init();
      }
    }, 150);

    // Start Real-Time Simulation Loop
    this.startSimulationLoop();

    // Lucide Icons
    if (window.lucide) lucide.createIcons();
  }

  // ================= TAB SWITCHING =================
  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab-btn') === tabId;
      btn.classList.toggle('active', isTarget);
      btn.classList.toggle('text-brand-400', isTarget);
      btn.classList.toggle('bg-brand-500/15', isTarget);
      btn.classList.toggle('text-slate-400', !isTarget);
    });

    document.querySelectorAll('.tab-content').forEach(section => {
      const isTarget = section.id === `tab-${tabId}`;
      section.classList.toggle('hidden', !isTarget);
      section.classList.toggle('block', isTarget);
    });

    if (tabId === 'live-map' && this.trafficMap && this.trafficMap.map) {
      setTimeout(() => this.trafficMap.map.invalidateSize(), 50);
    }

    if (window.lucide) lucide.createIcons();
  }

  // ================= THEME TOGGLE =================
  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('trafficai_theme_v1', isDark ? 'dark' : 'light');
  }

  // ================= SIMULATION CONTROLLER =================
  startSimulationLoop() {
    this.stopSimulationLoop();
    this.simRunning = true;

    this.simInterval = setInterval(() => {
      this.stepSimulation();
    }, 1000 / this.simSpeed);
  }

  stopSimulationLoop() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.simRunning = false;
  }

  toggleSimulation() {
    if (this.simRunning) {
      this.stopSimulationLoop();
      document.getElementById('simPlayLabel').innerText = 'Resume';
      document.getElementById('simPlayIcon')?.setAttribute('data-lucide', 'play');
    } else {
      this.startSimulationLoop();
      document.getElementById('simPlayLabel').innerText = 'Pause';
      document.getElementById('simPlayIcon')?.setAttribute('data-lucide', 'pause');
    }
    if (window.lucide) lucide.createIcons();
  }

  setSimulationSpeed(speed) {
    this.simSpeed = parseInt(speed, 10);
    if (this.simRunning) {
      this.startSimulationLoop();
    }
  }

  resetSimulation() {
    this.clockMinutes = 17 * 60 + 30;
    if (window.scenarioSandbox) window.scenarioSandbox.reset();
    this.showToast('Simulation state reset to default');
  }

  stepSimulation() {
    this.clockMinutes = (this.clockMinutes + 1) % (24 * 60);
    const hour = this.clockMinutes / 60;

    // Step traffic signals
    if (window.signalOptimizer) {
      window.signalOptimizer.step();
    }

    // Dynamic micro-fluctuations on network edges
    let totalSpeed = 0;
    let totalVolume = 0;
    let gridlockCount = 0;

    window.CITY_ROAD_NETWORK.edges.forEach(edge => {
      // Natural fluctuation +/- 2 km/h
      const jitter = (Math.random() - 0.5) * 2;
      edge.currentSpeed = Math.max(8, Math.min(edge.speedLimit, edge.currentSpeed + jitter));
      edge.currentVolume = Math.max(200, Math.round(edge.currentVolume + (Math.random() - 0.5) * 50));

      const ratio = edge.currentSpeed / edge.speedLimit;
      if (ratio < 0.25) edge.status = 'gridlock';
      else if (ratio < 0.55) edge.status = 'heavy';
      else if (ratio < 0.75) edge.status = 'moderate';
      else edge.status = 'free_flow';

      if (edge.status === 'gridlock') gridlockCount++;
      totalSpeed += edge.currentSpeed;
      totalVolume += edge.currentVolume;
    });

    const avgSpeed = (totalSpeed / window.CITY_ROAD_NETWORK.edges.length).toFixed(1);
    const congestionIndex = Math.round((1 - (avgSpeed / 70)) * 100);

    // Update Top Header & Metrics
    const headerCong = document.getElementById('headerCongestionIndex');
    const metricSpeed = document.getElementById('metricAvgSpeed');
    const metricVol = document.getElementById('metricVehicleCount');
    const metricHot = document.getElementById('metricHotspots');

    if (headerCong) {
      headerCong.innerText = `${congestionIndex}% (${congestionIndex > 60 ? 'Heavy' : 'Normal'})`;
      headerCong.className = `font-mono font-bold ${congestionIndex > 60 ? 'text-rose-400' : 'text-emerald-400'}`;
    }
    if (metricSpeed) metricSpeed.innerText = `${avgSpeed} km/h`;
    if (metricVol) metricVol.innerText = `${totalVolume.toLocaleString()} veh/h`;
    if (metricHot) metricHot.innerText = `${gridlockCount} Critical`;

    // Refresh map road colors
    if (this.trafficMap) {
      this.trafficMap.updateRoadStates(window.CITY_ROAD_NETWORK.edges);
    }
  }

  // ================= AI PREDICTIONS =================
  runAIPrediction() {
    const edgeId = document.getElementById('predCorridorSelect')?.value || 'e1';
    const horizon = parseInt(document.getElementById('predHorizonSelect')?.value || '30', 10);
    const weather = document.getElementById('predWeatherSelect')?.value || 'clear';
    const incident = document.getElementById('predIncidentSelect')?.value || 'none';

    const pred = window.mlPredictor.predict({
      edgeId,
      horizonMinutes: horizon,
      weather,
      incident,
      currentHour: this.clockMinutes / 60
    });

    const speedVal = document.getElementById('predSpeedVal');
    const riskVal = document.getElementById('predCongestionRisk');
    const riskBar = document.getElementById('predRiskBar');
    const volVal = document.getElementById('predVolumeVal');

    if (speedVal) speedVal.innerText = `${pred.predictedSpeed} km/h`;
    if (riskVal) riskVal.innerText = `${pred.congestionRiskPct}% (${pred.status.replace('_', ' ').toUpperCase()})`;
    if (riskBar) {
      riskBar.style.width = `${pred.congestionRiskPct}%`;
      riskBar.className = `h-full ${pred.congestionRiskPct > 70 ? 'bg-rose-500' : (pred.congestionRiskPct > 40 ? 'bg-amber-500' : 'bg-emerald-500')}`;
    }
    if (volVal) volVal.innerText = `${pred.predictedVolume.toLocaleString()} veh/h`;

    this.showToast(`✓ Generated ${horizon}min Traffic Forecast for ${pred.edgeName}!`);
  }

  // ================= A* ROUTE PLANNER =================
  calculateOptimalRoute() {
    const origin = document.getElementById('routeOriginSelect')?.value || 'N3';
    const dest = document.getElementById('routeDestSelect')?.value || 'N6';

    const route = window.routePlanner.findRoute(origin, dest, 'time');

    if (this.trafficMap) {
      this.trafficMap.highlightRoute(route.pathNodes);
    }

    this.showToast(`✓ Optimal A* Route computed (${route.totalDistKm} km, ${route.totalTimeMin} min)!`);
    this.switchTab('live-map');
  }

  // ================= SIGNAL CONTROLLER =================
  setSignalMode(mode) {
    if (window.signalOptimizer) window.signalOptimizer.setMode(mode);

    const adaptBtn = document.getElementById('sigModeAdaptiveBtn');
    const fixBtn = document.getElementById('sigModeFixedBtn');

    if (mode === 'adaptive') {
      adaptBtn?.classList.add('bg-brand-500', 'text-white');
      adaptBtn?.classList.remove('text-slate-400');
      fixBtn?.classList.remove('bg-brand-500', 'text-white');
      fixBtn?.classList.add('text-slate-400');
      this.showToast('Adaptive AI Signal Optimization enabled');
    } else {
      fixBtn?.classList.add('bg-brand-500', 'text-white');
      fixBtn?.classList.remove('text-slate-400');
      adaptBtn?.classList.remove('bg-brand-500', 'text-white');
      adaptBtn?.classList.add('text-slate-400');
      this.showToast('Switched to Fixed 45s cycle');
    }
  }

  // ================= WHAT-IF SANDBOX =================
  updateSandboxScenario() {
    const rain = document.getElementById('sliderRain')?.value || 0;
    const surge = document.getElementById('sliderSurge')?.value || 1.0;
    const acc = document.getElementById('sliderAccident')?.value || 0;

    const rVal = document.getElementById('sliderRainVal');
    const sVal = document.getElementById('sliderSurgeVal');
    const aVal = document.getElementById('sliderAccidentVal');

    if (rVal) rVal.innerText = `${rain} mm/h (${rain > 50 ? 'Heavy Storm' : (rain > 15 ? 'Rain' : 'Dry')})`;
    if (sVal) sVal.innerText = `${surge}x (${surge > 1.5 ? 'Severe Surge' : 'Normal'})`;
    if (aVal) aVal.innerText = acc == 0 ? '0 (None)' : (acc == 3 ? '3 (Major Crash)' : `${acc} (Lane Closed)`);

    if (window.scenarioSandbox) {
      window.scenarioSandbox.updateScenario(rain, surge, acc);
    }
  }

  resetSandboxSliders() {
    if (window.scenarioSandbox) window.scenarioSandbox.reset();
  }

  // ================= EXPORTS =================
  exportTrafficCSV() {
    window.ExportUtils.exportTrafficCSV();
    this.showToast('✓ Traffic metrics CSV downloaded!');
  }

  exportNetworkGeoJSON() {
    window.ExportUtils.exportNetworkGeoJSON();
    this.showToast('✓ Road Network GeoJSON downloaded!');
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-surface-900 border border-brand-500/40 text-slate-100 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in pointer-events-auto';
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

window.app = new TrafficAIApp();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
