export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, code } = req.body;

  if (!username || !code) {
    return res.status(400).json({ error: 'Username and code are required' });
  }

  // Simple storage
  if (!global.codes) global.codes = {};
  
  const executionId = Date.now().toString();
  global.codes[username.toLowerCase()] = {
    code: code,
    timestamp: Date.now()
  };

  return res.status(200).json({ 
    success: true, 
    executionId: executionId 
  });
}
