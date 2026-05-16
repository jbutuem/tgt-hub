// /api/monday-test.js — TOKEN HARDCODED TEMPORARIAMENTE

const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxNzY3OTcwMSwiYWFpIjoxMSwidWlkIjo0MzE2OTUwOSwiaWFkIjoiMjAyNS0wOC0xN1QwMTozNzo1OS4wMTNaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTk5NjU2MzgsInJnbiI6InVzZTEifQ.z1ECf7jCEGC2j_UGqtX2h_NkTAw';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const tokenInfo = {
    length: MONDAY_TOKEN.length,
    starts_with: MONDAY_TOKEN.substring(0, 30),
    ends_with: MONDAY_TOKEN.substring(MONDAY_TOKEN.length - 30)
  };

  try {
    const r = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MONDAY_TOKEN,
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
    return res.status(200).json({
      tokenInfo,
      error: e.message
    });
  }
};
