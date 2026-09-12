/**
 * Leaflet GIS Traffic Map & Simulation Layer for TrafficAI
 * Renders metropolitan road networks, real-time congestion coloring, junction markers, and dynamic routes.
 */

class TrafficMapManager {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.map = null;
    this.roadPolylines = {};
    this.nodeMarkers = {};
    this.routeHighlightLayer = null;
    this.network = window.CITY_ROAD_NETWORK;
  }

  init() {
    const el = document.getElementById(this.containerId);
    if (!el || typeof L === 'undefined') return;

    // Center map on CBD coordinates
    this.map = L.map(this.containerId, {
      center: [28.6320, 77.2200],
      zoom: 13,
      zoomControl: true
    });

    // Dark CartoDB Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.renderRoadNetwork();
    this.renderJunctionNodes();
  }

  getStatusColor(status) {
    switch (status) {
      case 'free_flow': return '#10b981'; // Emerald
      case 'moderate': return '#f59e0b';  // Amber
      case 'heavy': return '#f97316';     // Orange
      case 'gridlock': return '#ef4444';  // Red
      default: return '#3b82f6';          // Blue
    }
  }

  renderRoadNetwork() {
    if (!this.map) return;

    const nodeMap = {};
    this.network.nodes.forEach(n => { nodeMap[n.id] = [n.lat, n.lng]; });

    this.network.edges.forEach(edge => {
      const p1 = nodeMap[edge.from];
      const p2 = nodeMap[edge.to];
      if (!p1 || !p2) return;

      const color = this.getStatusColor(edge.status);

      const polyline = L.polyline([p1, p2], {
        color: color,
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.map);

      polyline.bindPopup(`
        <div class="space-y-1.5 p-1 text-xs">
          <div class="font-bold text-sm text-slate-100">${edge.name}</div>
          <div class="text-slate-400">Length: <strong class="text-slate-200">${edge.lengthKm} km</strong> | Lanes: <strong class="text-slate-200">${edge.lanes}</strong></div>
          <div class="flex justify-between pt-1 border-t border-slate-700 font-mono">
            <span>Speed: <strong class="${edge.currentSpeed < 20 ? 'text-red-400' : 'text-emerald-400'}">${edge.currentSpeed.toFixed(1)} km/h</strong></span>
            <span>Flow: <strong class="text-brand-300">${edge.currentVolume} veh/h</strong></span>
          </div>
          <div class="text-slate-400 font-mono">Occupancy: <strong>${edge.occupancy}%</strong> (${edge.status.replace('_', ' ').toUpperCase()})</div>
        </div>
      `);

      this.roadPolylines[edge.id] = polyline;
    });
  }

  renderJunctionNodes() {
    if (!this.map) return;

    this.network.nodes.forEach(node => {
      const icon = L.divIcon({
        className: 'custom-junction-icon',
        html: `
          <div class="w-6 h-6 rounded-full bg-surface-900 border-2 border-brand-400 text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-lg shadow-brand-500/50">
            ${node.id.replace('N', '')}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([node.lat, node.lng], { icon: icon }).addTo(this.map);
      marker.bindTooltip(`<strong>${node.id}</strong>: ${node.name} (${node.type})`, {
        direction: 'top',
        className: 'custom-tooltip'
      });

      this.nodeMarkers[node.id] = marker;
    });
  }

  updateRoadStates(edges) {
    edges.forEach(edge => {
      const poly = this.roadPolylines[edge.id];
      if (poly) {
        const color = this.getStatusColor(edge.status);
        poly.setStyle({ color: color });
      }
    });
  }

  highlightRoute(nodeIds) {
    if (!this.map) return;

    // Remove previous highlighted route
    if (this.routeHighlightLayer) {
      this.map.removeLayer(this.routeHighlightLayer);
      this.routeHighlightLayer = null;
    }

    if (!nodeIds || nodeIds.length < 2) return;

    const nodeMap = {};
    this.network.nodes.forEach(n => { nodeMap[n.id] = [n.lat, n.lng]; });

    const pathCoords = nodeIds.map(id => nodeMap[id]).filter(Boolean);

    this.routeHighlightLayer = L.polyline(pathCoords, {
      color: '#38bdf8', // Bright Sky Blue
      weight: 10,
      opacity: 0.9,
      dashArray: '8, 8',
      className: 'animate-pulse'
    }).addTo(this.map);

    this.map.fitBounds(this.routeHighlightLayer.getBounds(), { padding: [40, 40] });
  }
}

window.TrafficMapManager = TrafficMapManager;
