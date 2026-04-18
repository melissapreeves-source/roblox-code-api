import { codes } from './execute-code.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const usernameLower = username.toLowerCase();
  let foundCode = null;
  let foundId = null;

  // Find code for this user
  for (const [id, data] of Object.entries(codes)) {
    if (data.username === usernameLower) {
      foundCode = data.code;
      foundId = id;
      delete codes[id]; // Remove after retrieval
      break;
    }
  }

  if (foundCode) {
    console.log(`✅ Sending code to ${username}`);
    return res.status(200).json({ 
      hasCode: true, 
      code: foundCode,
      executionId: foundId
    });
  } else {
    console.log(`❌ No code for ${username}`);
    return res.status(200).json({ hasCode: false });
  }
}
