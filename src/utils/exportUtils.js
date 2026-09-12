/**
 * Export Utilities for TrafficAI
 * Provides CSV & GeoJSON export for traffic datasets, congestion metrics, and road network topology.
 */

class ExportUtils {
  static downloadFile(filename, text, mimeType = 'text/csv;charset=utf-8') {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export live road network metrics as CSV
   */
  static exportTrafficCSV(edges = window.CITY_ROAD_NETWORK.edges) {
    const headers = ['Edge_ID', 'Corridor_Name', 'Length_km', 'Lanes', 'Speed_Limit_kmh', 'Current_Speed_kmh', 'Current_Volume_veh_hr', 'Occupancy_Pct', 'Congestion_Status'];
    const rows = edges.map(e => [
      e.id,
      `"${e.name}"`,
      e.lengthKm,
      e.lanes,
      e.speedLimit,
      e.currentSpeed.toFixed(1),
      e.currentVolume,
      e.occupancy,
      e.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(`TrafficAI-Network-Metrics-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  }

  /**
   * Export road network topology as standard GeoJSON
   */
  static exportNetworkGeoJSON(network = window.CITY_ROAD_NETWORK) {
    const nodeMap = {};
    network.nodes.forEach(n => { nodeMap[n.id] = [n.lng, n.lat]; });

    const features = network.edges.map(e => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [nodeMap[e.from], nodeMap[e.to]]
      },
      properties: {
        id: e.id,
        name: e.name,
        lengthKm: e.lengthKm,
        lanes: e.lanes,
        currentSpeed: e.currentSpeed,
        currentVolume: e.currentVolume,
        occupancy: e.occupancy,
        status: e.status
      }
    }));

    const geoJson = {
      type: 'FeatureCollection',
      name: 'Metropolitan_Traffic_Network',
      features: features
    };

    this.downloadFile(
      `TrafficAI-Road-Network-${new Date().toISOString().slice(0, 10)}.geojson`,
      JSON.stringify(geoJson, null, 2),
      'application/geo+json'
    );
  }
}

window.ExportUtils = ExportUtils;
