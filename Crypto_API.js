// ----------- API engine ----------------- 
const request = require('request');
let url = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_WEEKLY&symbol=SOL&market=USD&apikey=URICEDTCKRGV4I3M';

// Função que devolve uma Promise
function callApi() {
  return new Promise((resolve, reject) => {
    request.get({
      url: url,
      json: true,
      headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
      if (err) {
        reject(err); // ❌ erro de rede
      } else if (res.statusCode !== 200) {
        reject(new Error(`Status: ${res.statusCode}`)); // ❌ erro de HTTP
      } else if (data['Note']) {
        reject(new Error('Rate limit atingido pela API')); // ❌ aviso da API
      } else {
        resolve(data); // ✅ sucesso
      }
    });
  });
}

// ----------- UI ----------------- 
console.log(`
\x1b[32m
 ██████ ██████  ██    ██ ██████  ████████  ██████       ██████ ██      ██ 
██      ██   ██  ██  ██  ██   ██    ██    ██    ██     ██      ██      ██ 
██      ██████    ████   ██████     ██    ██    ██     ██      ██      ██ 
██      ██   ██    ██    ██         ██    ██    ██     ██      ██      ██ 
 ██████ ██   ██    ██    ██         ██     ██████       ██████ ███████ ██ 
\x1b[0m                                                                         
`);

function centerLine(text, totalWidth = 74) {
  const padding = Math.max(0, totalWidth - text.length);
  const left = Math.floor(padding / 2);
  const right = totalWidth - text.length - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

console.log(centerLine('Crypto CLI — dados de criptomoedas em tempo real no teu terminal'));
console.log(centerLine('by MarceloDataLab'));
console.log(centerLine('Source: Alpha Vantage — https://www.alphavantage.co'));

// ---------------------------------- 
/* callApi()
  .then(data => {
    console.log("Dados recebidos:", data);
  })
  .catch(err => {
    console.error("Erro:", err.message);
  });
*/