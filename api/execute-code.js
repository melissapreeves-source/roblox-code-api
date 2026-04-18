// Simple working version - no Edge Config needed!
let codes = {};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

  // Generate unique ID
  const executionId = Date.now().toString() + Math.random().toString(36).substring(7);
  
  // Store the code
  codes[executionId] = {
    username: username.toLowerCase(),
    code: code,
    timestamp: Date.now()
  };

  // Clean up old codes (older than 30 seconds)
  const now = Date.now();
  for (const id in codes) {
    if (now - codes[id].timestamp > 30000) {
      delete codes[id];
    }
  }

  console.log(`📝 Stored code for ${username}. Total codes: ${Object.keys(codes).length}`);
  
  return res.status(200).json({ 
    success: true, 
    executionId,
    message: `Code stored for ${username}`
  });
}

// Export for get-code to use
export { codes };
