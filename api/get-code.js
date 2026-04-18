import { pendingCodes } from './execute-code.js';

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
    const usernameLower = username.toLowerCase();
    let foundCode = null;
    
    // Find pending code for this username
    for (const [id, data] of pendingCodes.entries()) {
      if (data.username === usernameLower && !data.executed) {
        data.executed = true;
        foundCode = { id, code: data.code };
        break;
      }
    }

    if (foundCode) {
      console.log(`Sending code to ${username}, code length: ${foundCode.code.length}`);
      return res.status(200).json({ 
        hasCode: true, 
        code: foundCode.code,
        executionId: foundCode.id
      });
    } else {
      return res.status(200).json({ hasCode: false });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
