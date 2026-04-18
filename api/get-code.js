import { createClient } from '@vercel/redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

export default async function handler(req, res) {
  // CORS headers
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
    const key = `code:${username.toLowerCase()}`;
    
    // Get and delete the code
    const code = await redis.get(key);
    if (code) {
      await redis.del(key);
      console.log(`✅ Sent code to ${username}`);
      return res.status(200).json({ 
        hasCode: true, 
        code: code
      });
    } else {
      console.log(`❌ No code for ${username}`);
      return res.status(200).json({ hasCode: false });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
