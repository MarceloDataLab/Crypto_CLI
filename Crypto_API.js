const blessed = require('blessed');

// ======== CONFIG ========
const API_KEY = 'URICEDTCKRGV4I3M';
const SYMBOL = 'SOL';
const MARKET = 'USD';
const FUNCTION = 'DIGITAL_CURRENCY_WEEKLY';
const REFRESH_MS = 60_000; // 60s (atenção aos rate limits da Alpha Vantage)

// ======== UI ========
const screen = blessed.screen({
  smartCSR: true,
  title: 'SOLANA — CLI Dashboard',
  fullUnicode: true,
});

screen.key(['q', 'C-c'], () => process.exit(0));

const theme = {
  fg: 'green',
  label: { fg: 'black', bg: 'green' },
  border: { type: 'line', fg: 'green' },
};

const header = blessed.box({
  top: 0,
  left: 'center',
  width: '100%-2',
  height: 3,
  content: '   S O L A N A   ',
  tags: true,
  style: {
    fg: theme.fg,
    border: theme.border,
  },
  border: theme.border,
});

const title = blessed.box({
  top: 3,
  left: 'center',
  width: '100%-2',
  height: 5,
  content: '{bold}SOL → USD{/bold}\nCrypto-API by Marcelodatalabb',
  tags: true,
  align: 'center',
  valign: 'middle',
  style: { fg: theme.fg, border: theme.border },
  border: theme.border,
});

const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  height: 1,
  width: '100%',
  tags: true,
  content:
    '{green-fg}[Q]{/green-fg} sair  •  atualização automática a cada 60s  •  fonte: Alpha Vantage',
  style: { fg: theme.fg },
});

function mkRowBox(top) {
  return blessed.box({
    top,
    left: 'center',
    width: '100%-2',
    height: 6,
    tags: true,
    style: { fg: theme.fg, border: theme.border },
    border: theme.border,
    content: '...',
    align: 'left',
    padding: { left: 2, right: 1 },
  });
}

const row1 = mkRowBox(8);
const row2 = mkRowBox(14);
const row3 = mkRowBox(20);

const footer = blessed.box({
  bottom: 1,
  left: 'center',
  width: '100%-2',
  height: 2,
  align: 'right',
  tags: true,
  style: { fg: theme.fg },
});

screen.append(header);
screen.append(title);
screen.append(row1);
screen.append(row2);
screen.append(row3);
screen.append(footer);
screen.append(statusBar);

// ======== DATA FETCH ========
async function fetchWeekly() {
  const url = `https://www.alphavantage.co/query?function=${FUNCTION}&symbol=${SYMBOL}&market=${MARKET}&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data['Time Series (Digital Currency Weekly)']) {
    // Mostra o payload no rodapé para diagnosticar (rate limit, etc.)
    footer.setContent(
      `{red-fg}Aviso{/red-fg}: ${data['Note'] || data['Error Message'] || 'Resposta inesperada'}`
    );
    screen.render();
    return null;
  }
  return data;
}

function fmtNum(n) {
  if (n === undefined) return '-';
  const x = Number(n);
  if (!Number.isFinite(x)) return String(n);
  return x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function rowContent(date, d) {
  const o = d[`1a. open (${MARKET})`];
  const h = d[`2a. high (${MARKET})`];
  const l = d[`3a. low (${MARKET})`];
  const c = d[`4a. close (${MARKET})`];
  const up = Number(c) >= Number(o);

  const arrow = up ? '{green-fg}▲{/green-fg}' : '{red-fg}▼{/red-fg}';
  const diff = (Number(c) - Number(o)).toFixed(2);
  const pct =
    Number(o) > 0 ? ((Number(c) / Number(o) - 1) * 100).toFixed(2) : '0.00';

  return `{bold}${date}{/bold}   ${arrow}  Δ ${diff}  (${pct}%)\n` +
         `Open:  ${fmtNum(o)}   Close: ${fmtNum(c)}\n` +
         `High:  ${fmtNum(h)}   Low:   ${fmtNum(l)}`;
}

async function refresh() {
  try {
    footer.setContent('{|} a atualizar...');
    screen.render();

    const data = await fetchWeekly();
    if (!data) return;

    const ts = data['Time Series (Digital Currency Weekly)'];
    const dates = Object.keys(ts).sort().reverse(); // mais recente primeiro

    row1.setContent(rowContent(dates[0], ts[dates[0]]));
    row2.setContent(rowContent(dates[1], ts[dates[1]]));
    row3.setContent(rowContent(dates[2], ts[dates[2]]));

    const lastRef = data['Meta Data']?.['6. Last Refreshed'] || dates[0];
    footer.setContent(
      `Atualizado: {bold}${lastRef}{/bold}  •  ${SYMBOL}/${MARKET}  •  Alpha Vantage`
    );
  } catch (e) {
    footer.setContent(`{red-fg}Erro:{/red-fg} ${e.message}`);
  } finally {
    screen.render();
  }
}

// inicializa e agenda refresh
refresh();
const interval = setInterval(refresh, REFRESH_MS);
screen.on('destroy', () => clearInterval(interval));
