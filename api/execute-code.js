export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, code } = req.body;

  if (!username || !code) {
    return res.status(400).json({ error: 'Username and code are required' });
  }

  try {
    // Import Edge Config
    const { createClient } = await import('@vercel/edge-config');
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // Get existing codes
    let pendingCodes = await edgeConfig.get('pendingCodes');
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
    
    // Save back to Edge Config
    await edgeConfig.set('pendingCodes', pendingCodes);
    
    console.log(`✅ Stored code for ${username}. Total: ${Object.keys(pendingCodes).length}`);
    
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
