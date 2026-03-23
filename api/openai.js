const axios = require('axios');

// Vercel serverless function handler
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}