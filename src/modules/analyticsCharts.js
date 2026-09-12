/**
 * Chart.js Analytics & 24h Diurnal Traffic Curve Visualizer for TrafficAI
 */

class AnalyticsChartsManager {
  constructor() {
    this.chart = null;
  }

  init() {
    const canvas = document.getElementById('diurnalChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    
    // Generate synthetic 24h diurnal volume and speed curve
    const volumeData = hours.map((_, h) => {
      const surge = window.mlPredictor ? window.mlPredictor.getDiurnalSurge(h) : 0.5;
      return Math.round(1800 * surge);
    });

    const speedData = hours.map((_, h) => {
      const surge = window.mlPredictor ? window.mlPredictor.getDiurnalSurge(h) : 0.5;
      return Math.round(75 / (1 + 0.15 * Math.pow(surge * 1.5, 3)));
    });

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Traffic Volume (veh/h)',
            data: volumeData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            yAxisID: 'yVolume',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5
          },
          {
            label: 'Average Speed (km/h)',
            data: speedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            yAxisID: 'ySpeed',
            fill: false,
            tension: 0.4,
            borderWidth: 2.5,
            borderDash: [4, 4]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 11 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1'
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
          },
          yVolume: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#60a5fa', font: { family: 'JetBrains Mono', size: 10 } },
            title: { display: true, text: 'Volume (Vehicles/Hour)', color: '#60a5fa' }
          },
          ySpeed: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#34d399', font: { family: 'JetBrains Mono', size: 10 } },
            title: { display: true, text: 'Avg Speed (km/h)', color: '#34d399' }
          }
        }
      }
    });
  }
}

window.analyticsChartsManager = new AnalyticsChartsManager();
