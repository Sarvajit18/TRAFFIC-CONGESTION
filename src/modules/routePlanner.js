/**
 * Dynamic A* Congestion-Aware Route Planner & Carbon Estimator
 * Computes shortest-distance vs. dynamic real-time minimum delay routes across the city network.
 */

class RoutePlanner {
  constructor() {
    this.network = window.CITY_ROAD_NETWORK;
  }

  /**
   * Find route using A* / Dijkstra algorithm with configurable cost function
   * @param {string} startNodeId Origin junction
   * @param {string} endNodeId Destination junction
   * @param {string} costMode 'time' (dynamic congestion) | 'distance' (static km)
   */
  findRoute(startNodeId, endNodeId, costMode = 'time') {
    const adj = {};
    this.network.nodes.forEach(n => { adj[n.id] = []; });

    this.network.edges.forEach(e => {
      // Travel time in hours = length / currentSpeed
      const travelTimeMin = (e.lengthKm / Math.max(5, e.currentSpeed)) * 60;
      const weight = costMode === 'time' ? travelTimeMin : e.lengthKm;

      adj[e.from].push({ to: e.to, edge: e, weight, travelTimeMin });
      // Undirected / bidirectional arterial assumption
      adj[e.to].push({ to: e.from, edge: e, weight, travelTimeMin });
    });

    // Dijkstra / Priority Queue
    const dist = {};
    const prev = {};
    const visited = new Set();
    const queue = [];

    this.network.nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
    });

    dist[startNodeId] = 0;
    queue.push({ node: startNodeId, cost: 0 });

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const { node: u } = queue.shift();

      if (visited.has(u)) continue;
      visited.add(u);

      if (u === endNodeId) break;

      adj[u].forEach(neighbor => {
        const v = neighbor.to;
        const alt = dist[u] + neighbor.weight;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = { node: u, edge: neighbor.edge, travelTimeMin: neighbor.travelTimeMin };
          queue.push({ node: v, cost: alt });
        }
      });
    }

    // Reconstruct path
    const pathNodes = [];
    const pathEdges = [];
    let curr = endNodeId;

    let totalDistKm = 0;
    let totalTimeMin = 0;

    while (curr) {
      pathNodes.unshift(curr);
      const p = prev[curr];
      if (p) {
        pathEdges.unshift(p.edge);
        totalDistKm += p.edge.lengthKm;
        totalTimeMin += p.travelTimeMin;
        curr = p.node;
      } else {
        break;
      }
    }

    // Fuel & Carbon footprint estimation (Average vehicle: 8.5L/100km at 60km/h, +40% idle in gridlock)
    const congestionPenalty = totalTimeMin / ((totalDistKm / 60) * 60);
    const fuelLitres = (totalDistKm * (8.5 / 100)) * (1 + (congestionPenalty - 1) * 0.3);
    const co2Kg = fuelLitres * 2.31; // 2.31 kg CO2 per litre of petrol

    return {
      startNodeId,
      endNodeId,
      costMode,
      pathNodes,
      pathEdges,
      totalDistKm: parseFloat(totalDistKm.toFixed(1)),
      totalTimeMin: Math.round(totalTimeMin),
      fuelLitres: parseFloat(fuelLitres.toFixed(2)),
      co2Kg: parseFloat(co2Kg.toFixed(2))
    };
  }
}

window.routePlanner = new RoutePlanner();
