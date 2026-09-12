/**
 * TrafficAI - Express Static & REST API Server
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../')); // Serve static frontend

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TrafficAI Express Server', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TrafficAI Server running on http://localhost:${PORT}`);
});
