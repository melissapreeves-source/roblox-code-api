export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!global.codes) global.codes = {};

  const data = global.codes[username.toLowerCase()];
  
  if (data) {
    // Delete after retrieval
    delete global.codes[username.toLowerCase()];
    return res.status(200).json({ 
      hasCode: true, 
      code: data.code 
    });
  }

  return res.status(200).json({ hasCode: false });
}
