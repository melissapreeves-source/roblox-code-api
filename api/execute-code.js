export default async function handler(req, res) {
  // Handle CORS properly
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, code } = req.body;

  if (!username || !code) {
    return res.status(400).json({ error: 'Username and code are required' });
  }

  try {
    // Simple in-memory storage (global)
    if (!global.pendingCodes) {
      global.pendingCodes = {};
    }
    
    const executionId = Date.now().toString() + Math.random().toString(36).substring(2);
    
    global.pendingCodes[executionId] = {
      username: username.toLowerCase(),
      code: code,
      timestamp: Date.now(),
      executed: false
    };
    
    // Clean old entries (older than 5 minutes)
    const now = Date.now();
    for (const [id, data] of Object.entries(global.pendingCodes)) {
      if (now - data.timestamp > 300000) {
        delete global.pendingCodes[id];
      }
    }
    
    console.log(`✅ Stored code for ${username}. Total: ${Object.keys(global.pendingCodes).length}`);
    
    return res.status(200).json({ 
      success: true, 
      executionId,
      message: `Code stored for ${username}`
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
