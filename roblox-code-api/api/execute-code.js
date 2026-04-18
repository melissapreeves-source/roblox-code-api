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
    if (!global.pendingExecutions) {
      global.pendingExecutions = new Map();
    }

    const executionId = Math.random().toString(36).substring(7);
    global.pendingExecutions.set(executionId, {
      username,
      code,
      timestamp: Date.now(),
      executed: false
    });

    for (const [id, data] of global.pendingExecutions.entries()) {
      if (Date.now() - data.timestamp > 300000) {
        global.pendingExecutions.delete(id);
      }
    }

    return res.status(200).json({ 
      success: true, 
      executionId,
      message: `Code queued for user: ${username}`
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}