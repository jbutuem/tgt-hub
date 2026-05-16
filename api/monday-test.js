// /api/monday-test.js — usa APENAS env var

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const TOKEN = process.env.MONDAY_API_TOKEN;
  const tokenInfo = {
    set: !!TOKEN,
    length: TOKEN ? TOKEN.length : 0,
    starts_with: TOKEN ? TOKEN.substring(0, 30) : null,
    ends_with: TOKEN ? TOKEN.substring(TOKEN.length - 30) : null
  };

  if (!TOKEN) {
    return res.status(200).json({ tokenInfo, error: 'No token' });
  }

  try {
    const r = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': TOKEN,
        'API-Version': '2024-10'
      },
      body: JSON.stringify({ query: 'query { me { id name } }' })
    });
    const text = await r.text();
    return res.status(200).json({
      tokenInfo,
      monday_status: r.status,
      monday_body: text
    });
  } catch (e) {
    return res.status(200).json({ tokenInfo, error: e.message });
  }
};
