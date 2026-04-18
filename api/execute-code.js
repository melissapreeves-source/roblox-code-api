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

  // Simple in-memory storage that actually works between calls
  if (!global.codes) global.codes = {};
  
  const executionId = Date.now().toString();
  global.codes[username.toLowerCase()] = {
    code: code,
    timestamp: Date.now(),
    id: executionId
  };
  
  // Clean old entries
  for (const user in global.codes) {
    if (Date.now() - global.codes[user].timestamp > 30000) {
      delete global.codes[user];
    }
  }
  
  return res.status(200).json({ success: true, executionId });
}

export { global };
