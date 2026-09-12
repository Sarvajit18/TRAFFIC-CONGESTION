/**
 * Adaptive Traffic Signal Timing & Queue Optimization Module
 * Dynamically reallocates green light phases based on real-time and predicted queue lengths.
 */

class SignalOptimizer {
  constructor() {
    this.mode = 'adaptive'; // 'adaptive' | 'fixed'
    this.currentPhase = 'NS'; // 'NS' (North-South) | 'EW' (East-West)
    this.timeRemaining = 35;
    this.timerInterval = null;

    this.queues = {
      north: 18,
      south: 14,
      east: 32,
      west: 28
    };
  }

  setMode(mode) {
    this.mode = mode;
    this.updateUI();
  }

  /**
   * Calculate dynamic green allocation for approach pairs (15s to 90s)
   */
  calculateAdaptiveGreenTime(q1, q2, otherQ1, otherQ2) {
    const activeDemand = q1 + q2;
    const totalDemand = activeDemand + otherQ1 + otherQ2;

    if (totalDemand === 0) return 30;

    const demandRatio = activeDemand / totalDemand;
    // Base cycle = 90 seconds
    const allocated = Math.round(90 * demandRatio);
    return Math.min(75, Math.max(15, allocated));
  }

  step() {
    // Discharge vehicles on green phase, accumulate on red phase
    if (this.currentPhase === 'NS') {
      this.queues.north = Math.max(2, this.queues.north - 1);
      this.queues.south = Math.max(2, this.queues.south - 1);
      this.queues.east += Math.round(Math.random() * 2);
      this.queues.west += Math.round(Math.random() * 2);
    } else {
      this.queues.east = Math.max(2, this.queues.east - 1);
      this.queues.west = Math.max(2, this.queues.west - 1);
      this.queues.north += Math.round(Math.random() * 2);
      this.queues.south += Math.round(Math.random() * 2);
    }

    this.timeRemaining--;

    if (this.timeRemaining <= 0) {
      // Switch phase
      if (this.currentPhase === 'NS') {
        this.currentPhase = 'EW';
        this.timeRemaining = this.mode === 'adaptive'
          ? this.calculateAdaptiveGreenTime(this.queues.east, this.queues.west, this.queues.north, this.queues.south)
          : 45;
      } else {
        this.currentPhase = 'NS';
        this.timeRemaining = this.mode === 'adaptive'
          ? this.calculateAdaptiveGreenTime(this.queues.north, this.queues.south, this.queues.east, this.queues.west)
          : 45;
      }
    }

    this.updateUI();
  }

  updateUI() {
    const qNorth = document.getElementById('queueNorth');
    const qSouth = document.getElementById('queueSouth');
    const qEast = document.getElementById('queueEast');
    const qWest = document.getElementById('queueWest');

    const sigNorth = document.getElementById('sigTimeNorth');
    const sigSouth = document.getElementById('sigTimeSouth');
    const sigEast = document.getElementById('sigTimeEast');
    const sigWest = document.getElementById('sigTimeWest');

    if (qNorth) qNorth.innerText = `${this.queues.north} Vehicles`;
    if (qSouth) qSouth.innerText = `${this.queues.south} Vehicles`;
    if (qEast) qEast.innerText = `${this.queues.east} Vehicles`;
    if (qWest) qWest.innerText = `${this.queues.west} Vehicles`;

    const isNSGreen = this.currentPhase === 'NS';

    if (sigNorth) {
      sigNorth.innerText = isNSGreen ? `GREEN (${this.timeRemaining}s)` : `RED (${this.timeRemaining}s)`;
      sigNorth.className = `text-2xl font-black font-mono ${isNSGreen ? 'text-emerald-400' : 'text-red-400'}`;
    }
    if (sigSouth) {
      sigSouth.innerText = isNSGreen ? `GREEN (${this.timeRemaining}s)` : `RED (${this.timeRemaining}s)`;
      sigSouth.className = `text-2xl font-black font-mono ${isNSGreen ? 'text-emerald-400' : 'text-red-400'}`;
    }
    if (sigEast) {
      sigEast.innerText = !isNSGreen ? `GREEN (${this.timeRemaining}s)` : `RED (${this.timeRemaining}s)`;
      sigEast.className = `text-2xl font-black font-mono ${!isNSGreen ? 'text-emerald-400' : 'text-red-400'}`;
    }
    if (sigWest) {
      sigWest.innerText = !isNSGreen ? `GREEN (${this.timeRemaining}s)` : `RED (${this.timeRemaining}s)`;
      sigWest.className = `text-2xl font-black font-mono ${!isNSGreen ? 'text-emerald-400' : 'text-red-400'}`;
    }
  }
}

window.signalOptimizer = new SignalOptimizer();
