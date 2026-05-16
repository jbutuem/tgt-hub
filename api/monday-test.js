// /api/monday-test.js — token em pedaços anti-corte

const P1 = 'eyJhbGciOiJIUzI1NiJ9.';
const P2A = 'eyJ0aWQiOjUxNzY3OTcwMSwiYWFpIjoxMSwidWlkIjo0MzE2OTUwOSwi';
const P2B = 'aWFkIjoiMjAyNS0wOC0xN1QwMTozNzo1OS4wMTNaIiwicGVyIjoibWU6';
const P2C = 'd3JpdGUiLCJhY3RpZCI6MTk5NjU2MzgsInJnbiI6InVzZTEifQ.';
const P3 = 'z1ECf7jCEGC2j_UGqtX2h_NkTAw';
const MONDAY_TOKEN = P1 + P2A + P2B + P2C + P3;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const tokenInfo = {
    length: MONDAY_TOKEN.length,
    p1_len: P1.length,
    p2a_len: P2A.length,
    p2b_len: P2B.length,
    p2c_len: P2C.length,
    p3_len: P3.length
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
