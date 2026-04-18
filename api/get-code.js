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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Import Edge Config
    const { createClient } = await import('@vercel/edge-config');
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // Get pending codes
    let pendingCodes = await edgeConfig.get('pendingCodes');
    if (!pendingCodes) {
      pendingCodes = {};
    }
    
    const usernameLower = username.toLowerCase();
    let foundCode = null;
    let foundId = null;
    
    // Find and claim the code
    for (const [id, data] of Object.entries(pendingCodes)) {
      if (data.username === usernameLower && !data.executed) {
        foundCode = data.code;
        foundId = id;
        data.executed = true; // Mark as executed
        break;
      }
    }
    
    // Save the updated status back to Edge Config
    if (foundCode) {
      await edgeConfig.set('pendingCodes', pendingCodes);
      console.log(`📤 Sent code to ${username}`);
      return res.status(200).json({ 
        hasCode: true, 
        code: foundCode,
        executionId: foundId
      });
    } else {
      console.log(`📭 No code for ${username}`);
      return res.status(200).json({ hasCode: false });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
