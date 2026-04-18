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

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Check global storage
    if (!global.pendingCodes) {
      global.pendingCodes = {};
    }
    
    const usernameLower = username.toLowerCase();
    let foundCode = null;
    let foundId = null;
    
    // Find and mark as executed
    for (const [id, data] of Object.entries(global.pendingCodes)) {
      if (data.username === usernameLower && !data.executed) {
        foundCode = data.code;
        foundId = id;
        data.executed = true;
        break;
      }
    }
    
    if (foundCode) {
      console.log(`📤 Sending code to ${username}, length: ${foundCode.length}`);
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}
