import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

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
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    const pendingCodes = await edgeConfig.get('pendingCodes') || {};
    
    const usernameLower = username.toLowerCase();
    let foundCode = null;
    let foundId = null;
    
    // Find pending code
    for (const [id, data] of Object.entries(pendingCodes)) {
      if (data.username === usernameLower && !data.executed) {
        foundCode = data.code;
        foundId = id;
        data.executed = true;
        break;
      }
    }
    
    // Update if we found code
    if (foundCode) {
      await edgeConfig.set('pendingCodes', pendingCodes);
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}
