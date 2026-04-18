export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username } = req.query;
  
  if (!global.codes) global.codes = {};
  
  const data = global.codes[username.toLowerCase()];
  if (data && Date.now() - data.timestamp < 30000) {
    delete global.codes[username.toLowerCase()];
    return res.status(200).json({ hasCode: true, code: data.code });
  }
  
  return res.status(200).json({ hasCode: false });
}
