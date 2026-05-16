// /api/monday-test.js
// Endpoint de diagnóstico: faz UMA chamada ao Monday e retorna o erro cru
// Uso: GET /api/monday-test?itemId=11954850316

const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const itemId = req.query?.itemId || '11954850316';
  
  // Diagnóstico 1: token está setado?
  const tokenInfo = {
    token_set: !!MONDAY_TOKEN,
    token_length: MONDAY_TOKEN ? MONDAY_TOKEN.length : 0,
    token_prefix: MONDAY_TOKEN ? MONDAY_TOKEN.substring(0, 20) + '...' : null
  };

  // Diagnóstico 2: fazer chamada simples ao Monday
  try {
    const query = `query { items(ids: [${itemId}]) { id name column_values { id type text } } }`;
    const r = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MONDAY_TOKEN,
        'API-Version': '2024-10'
      },
      body: JSON.stringify({ query })
    });
    const statusCode = r.status;
    const responseText = await r.text();
    let parsed;
    try { parsed = JSON.parse(responseText); } catch (e) { parsed = null; }
    
    return res.status(200).json({
      tokenInfo,
      monday_response: {
        status: statusCode,
        raw_text_preview: responseText.substring(0, 1500),
        parsed: parsed
      }
    });
  } catch (e) {
    return res.status(200).json({
      tokenInfo,
      fetch_error: e.message,
      stack: e.stack?.substring(0, 500)
    });
  }
};
