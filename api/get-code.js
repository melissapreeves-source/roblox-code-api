export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Correct Edge Config import
    const { get, set } = require('@vercel/edge-config');
    
    // Get pending codes
    let pendingCodes = await get('pendingCodes');
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
        data.executed = true;
        break;
      }
    }
    
    // Save the updated status back
    if (foundCode) {
      await set('pendingCodes', pendingCodes);
      return res.status(200).json({ 
        hasCode: true, 
        code: foundCode,
        executionId: foundId
      });
    } else {
      return res.status(200).json({ hasCode: false });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
