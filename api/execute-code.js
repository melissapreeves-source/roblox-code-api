import { createClient } from '@vercel/redis';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL
});

export default async function handler(req, res) {
  // CORS headers
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
    const key = `code:${username.toLowerCase()}`;
    
    // Store code with 60 second expiration
    await redis.set(key, code);
    await redis.expire(key, 60);
    
    console.log(`✅ Stored code for ${username}`);
    
    return res.status(200).json({ 
      success: true, 
      message: `Code stored for ${username}`
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
