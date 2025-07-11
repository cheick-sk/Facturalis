const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration
const PORT = process.env.PORT || 4000;
const API_BACKEND_URL = process.env.API_BACKEND_URL || 'http://backend:3001'; // backend is the service name in docker-compose, 3001 is the port NestJS listens on

// Create Express Server
const app = express();

// Logging
app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
    res.send('This is a proxy service for the HR Tool.');
});

// Proxy endpoints
app.use('/api/v1', createProxyMiddleware({
    target: API_BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/api/v1`]: '', // remove /api/v1 prefix when forwarding to backend
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    }
}));

// Start the Proxy
app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`);
    console.log(`Forwarding /api/v1 to ${API_BACKEND_URL}`);
});
