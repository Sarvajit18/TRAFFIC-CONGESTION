/**
 * Metropolitan City Road Network Graph Topology
 * Provides node coordinates, road segment definitions, lane capacities, and connection adjacency.
 */

const CITY_ROAD_NETWORK = {
  // Major Urban Junctions (Nodes)
  nodes: [
    { id: 'N1', name: 'North Ring Entry', lat: 28.6448, lng: 77.2000, type: 'Interchange' },
    { id: 'N2', name: 'Downtown West Gateway', lat: 28.6320, lng: 77.2100, type: 'Urban Junction' },
    { id: 'N3', name: 'Central Business District (CBD)', lat: 28.6280, lng: 77.2250, type: 'High Density CBD' },
    { id: 'N4', name: 'South Industrial Corridor', lat: 28.6150, lng: 77.2180, type: 'Industrial Zone' },
    { id: 'N5', name: 'Airport Link Flyover', lat: 28.6100, lng: 77.2020, type: 'Expressway Interchange' },
    { id: 'N6', name: 'Tech Park Arterial Gateway', lat: 28.6220, lng: 77.2400, type: 'Commercial Hub' },
    { id: 'N7', name: 'East Ring Interchange', lat: 28.6380, lng: 77.2450, type: 'Highway Interchange' },
    { id: 'N8', name: 'Suburban North-East Bypass', lat: 28.6520, lng: 77.2300, type: 'Bypass' }
  ],

  // Road Corridors (Edges)
  edges: [
    {
      id: 'e1',
      name: 'Outer North-East Ring Corridor',
      from: 'N1',
      to: 'N8',
      lengthKm: 3.2,
      lanes: 4,
      speedLimit: 80,
      baseCapacityVehPerHour: 3600,
      currentSpeed: 68.5,
      currentVolume: 1420,
      occupancy: 28,
      status: 'free_flow' // 'free_flow' | 'moderate' | 'heavy' | 'gridlock'
    },
    {
      id: 'e2',
      name: 'Downtown Central Expressway',
      from: 'N1',
      to: 'N2',
      lengthKm: 2.1,
      lanes: 3,
      speedLimit: 60,
      baseCapacityVehPerHour: 2800,
      currentSpeed: 24.2,
      currentVolume: 2450,
      occupancy: 76,
      status: 'heavy'
    },
    {
      id: 'e3',
      name: 'CBD Main Arterial Spine',
      from: 'N2',
      to: 'N3',
      lengthKm: 1.8,
      lanes: 3,
      speedLimit: 50,
      baseCapacityVehPerHour: 2400,
      currentSpeed: 14.2,
      currentVolume: 2320,
      occupancy: 88,
      status: 'gridlock'
    },
    {
      id: 'e4',
      name: 'South Industrial Link',
      from: 'N3',
      to: 'N4',
      lengthKm: 2.4,
      lanes: 2,
      speedLimit: 50,
      baseCapacityVehPerHour: 1800,
      currentSpeed: 38.0,
      currentVolume: 980,
      occupancy: 42,
      status: 'moderate'
    },
    {
      id: 'e5',
      name: 'Airport Expressway Connector',
      from: 'N4',
      to: 'N5',
      lengthKm: 3.5,
      lanes: 4,
      speedLimit: 90,
      baseCapacityVehPerHour: 4000,
      currentSpeed: 78.4,
      currentVolume: 1850,
      occupancy: 32,
      status: 'free_flow'
    },
    {
      id: 'e6',
      name: 'Tech Park Eastern Link',
      from: 'N3',
      to: 'N6',
      lengthKm: 2.6,
      lanes: 3,
      speedLimit: 60,
      baseCapacityVehPerHour: 2700,
      currentSpeed: 42.1,
      currentVolume: 1650,
      occupancy: 48,
      status: 'moderate'
    },
    {
      id: 'e7',
      name: 'East Ring Expressway',
      from: 'N6',
      to: 'N7',
      lengthKm: 2.9,
      lanes: 4,
      speedLimit: 80,
      baseCapacityVehPerHour: 3600,
      currentSpeed: 58.4,
      currentVolume: 2100,
      occupancy: 44,
      status: 'free_flow'
    },
    {
      id: 'e8',
      name: 'North-East Connector',
      from: 'N7',
      to: 'N8',
      lengthKm: 2.2,
      lanes: 3,
      speedLimit: 70,
      baseCapacityVehPerHour: 2900,
      currentSpeed: 54.2,
      currentVolume: 1540,
      occupancy: 38,
      status: 'free_flow'
    },
    {
      id: 'e9',
      name: 'West-Airport Bypass Highway',
      from: 'N2',
      to: 'N5',
      lengthKm: 4.1,
      lanes: 4,
      speedLimit: 80,
      baseCapacityVehPerHour: 3800,
      currentSpeed: 64.0,
      currentVolume: 1980,
      occupancy: 35,
      status: 'free_flow'
    }
  ]
};

window.CITY_ROAD_NETWORK = CITY_ROAD_NETWORK;
