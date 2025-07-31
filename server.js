const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [
    'https://homecare247.netlify.app',
    'https://homecare-booking-service.netlify.app',
    // Allow all origins in development
    /^https?:\/\/.*\.netlify\.app$/,
    /^https?:\/\/.*\.render\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HomeCare API is running',
    timestamp: new Date().toISOString()
  });
});

// Create JSON Server router
const router = jsonServer.router(path.join(__dirname, 'src/data/db.json'));
const middlewares = jsonServer.defaults({
  logger: true
});

// Apply JSON Server middlewares
app.use(middlewares);

// Use JSON Server router for all other routes
app.use('/', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HomeCare API server running on port ${PORT}`);
  console.log(`📊 JSON Server available at http://localhost:${PORT}`);
  console.log(`🔗 CORS enabled for multiple domains`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
}); 