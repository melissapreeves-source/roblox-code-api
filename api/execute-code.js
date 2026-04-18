export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, code } = req.body;

  if (!username || !code) {
    return res.status(400).json({ error: 'Username and code are required' });
  }

  try {
    // Correct Edge Config import and usage
    const { get, set } = require('@vercel/edge-config');
    
    // Get existing codes
    let pendingCodes = await get('pendingCodes');
    if (!pendingCodes) {
      pendingCodes = {};
    }
    
    // Create new code entry
    const executionId = Date.now().toString() + Math.random().toString(36).substring(2);
    pendingCodes[executionId] = {
      username: username.toLowerCase(),
      code: code,
      timestamp: Date.now(),
      executed: false
    };
    
    // Save back using set function
    await set('pendingCodes', pendingCodes);
    
    return res.status(200).json({ 
      success: true, 
      executionId,
      message: `Code stored for ${username}`
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
