/**
 * LocalStorage Manager for TrafficAI
 */

const STORAGE_KEYS = {
  SETTINGS: 'trafficai_settings_v1',
  HISTORY: 'trafficai_history_v1',
  THEME: 'trafficai_theme_v1'
};

const DEFAULT_SETTINGS = {
  simSpeed: 2,
  signalMode: 'adaptive', // 'adaptive' | 'fixed'
  autoReroute: true,
  theme: 'dark'
};

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    }
  }

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    const updated = { ...this.getSettings(), ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  saveLogEntry(entry) {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
      history.unshift({ id: 'log-' + Date.now(), timestamp: new Date().toISOString(), ...entry });
      if (history.length > 50) history.pop();
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {}
  }
}

window.storage = new StorageManager();
