const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://webflow.com',
    'https://*.webflow.com',
    'https://*.webflow-ext.com'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy endpoint for OpenAI API
app.post('/api/openai', async (req, res) => {
  try {
    const { apiKey, ...requestData } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!apiKey.startsWith('sk-')) {
      console.log(`❌ Invalid API key format: "${apiKey.substring(0, 20)}..."`);
      return res.status(400).json({
        error: 'Invalid API key format',
        message: 'API key should start with "sk-"'
      });
    }

    // Log API key format (first 20 chars only for security)
    console.log(`🔑 Using OpenAI API key: ${apiKey.substring(0, 20)}...`);
    console.log(`📏 API key length: ${apiKey.length}`);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    res.json(response.data);

  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Proxy server error',
        message: error.message
      });
    }
  }
});

// Keep Claude endpoint for backward compatibility
app.post('/api/claude', async (req, res) => {
  res.status(410).json({
    error: 'Claude API endpoint deprecated',
    message: 'Please use /api/openai endpoint instead'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔗 Claude API proxy available at: http://localhost:${PORT}/api/claude`);
});

module.exports = app;