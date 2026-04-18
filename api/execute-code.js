// Simple in-memory storage (will work better than before)
const pendingCodes = new Map();

export default async function handler(req, res) {
  // Enable CORS
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
    // Store the code
    const executionId = Date.now().toString() + Math.random().toString(36);
    pendingCodes.set(executionId, {
      username: username.toLowerCase(),
      code: code,
      timestamp: Date.now(),
      executed: false
    });

    // Clean up old entries (older than 5 minutes)
    for (const [id, data] of pendingCodes.entries()) {
      if (Date.now() - data.timestamp > 300000) {
        pendingCodes.delete(id);
      }
    }

    console.log(`Stored code for ${username}. Total pending: ${pendingCodes.size}`);
    
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

// Export for get-code endpoint to use
export { pendingCodes };
