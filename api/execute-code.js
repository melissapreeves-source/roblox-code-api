import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
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
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    const executionId = Date.now().toString() + Math.random().toString(36);
    
    // Get existing codes
    const existing = await edgeConfig.get('pendingCodes') || {};
    
    // Add new code
    existing[executionId] = {
      username: username.toLowerCase(),
      code: code,
      timestamp: Date.now(),
      executed: false
    };
    
    // Save back
    await edgeConfig.set('pendingCodes', existing);
    
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
