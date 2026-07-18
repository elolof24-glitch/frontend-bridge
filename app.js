const chains = [
  { id: 'arc', name: 'Arc', logo: './logos/chains/arc.png' },
  { id: 'arbitrum', name: 'Arbitrum', logo: './logos/chains/arbitrum.svg' },
  { id: 'ethereum', name: 'Ethereum', logo: './logos/chains/ethereum.svg' },
  { id: 'base', name: 'Base', logo: './logos/chains/base.svg' },
  { id: 'optimism', name: 'Optimism', logo: './logos/chains/optimism.png' },
  { id: 'solana', name: 'Solana', logo: './logos/chains/solana.png' }
];

const tokens = [
  { id: 'usdc', name: 'USDC', symbol: 'USDC', logo: './logos/tokens/usdc.png' },
  { id: 'usdt', name: 'USDT', symbol: 'USDT', logo: './logos/tokens/usdt.png' },
  { id: 'weth', name: 'WETH', symbol: 'WETH', logo: './logos/tokens/weth.png' },
  { id: 'eth', name: 'ETH', symbol: 'ETH', logo: './logos/tokens/eth.png' },
  { id: 'sol', name: 'SOL', symbol: 'SOL', logo: './logos/tokens/sol.png' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', logo: './logos/tokens/bnb.png' }
];

const chainIdMap = {
  ethereum: 1,
  optimism: 10,
  base: 8453,
  arbitrum: 42161,
  solana: 101,
  arc: 1
};

let state = {
  fromChain: chains[1],
  toChain: chains[3],
  token: tokens[0],
  amount: '1',
  selectedRouteIndex: 0,
  wallet: null,
  quotes: [],
  loading: false,
  error: ''
};

function logoFallback(label) {
  return `this.onerror=null;this.outerHTML='<span class="logo-fallback">${label}</span>'`;
}

function fmt(n, d = 4) {
  const x = Number(n);
  return Number.isFinite(x)
    ? x.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
    : n;
}

function shortAddr(a) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

function chainLabel(chain) {
  return chain?.name || 'Select chain';
}

function renderChains() {
  const root = document.getElementById('chains');
  if (!root) return;

  root.innerHTML = chains.map(chain => `
    <button class="item ${state.fromChain?.id === chain.id ? 'active' : ''}" data-chain="${chain.id}" type="button">
      <div class="ico"><img src="${chain.logo}" alt="${chain.name} logo" onerror="${logoFallback(chain.name[0])}"></div>
      <div class="name">${chain.name}</div>
      <div class="chev">›</div>
    </button>
  `).join('');
}

function renderToChains() {
  const root = document.getElementById('to-chains');
  if (!root) return;

  root.innerHTML = chains.map(chain => `
    <button class="chain ${state.toChain?.id === chain.id ? 'active' : ''}" data-to-chain="${chain.id}" type="button">
      <div class="ico"><img src="${chain.logo}" alt="${chain.name} logo" onerror="${logoFallback(chain.name[0])}"></div>
      <div class="name">${chain.name}</div>
      <div class="rightval">${chain.id}</div>
    </button>
  `).join('');
}

function renderTokens() {
  const root = document.getElementById('tokens');
  if (!root) return;

  root.innerHTML = tokens.map(token => `
    <button class="token ${state.token?.id === token.id ? 'active' : ''}" data-token="${token.id}" type="button">
      <div class="ico"><img src="${token.logo}" alt="${token.name} logo" onerror="${logoFallback(token.symbol[0])}"></div>
      <div class="name">${token.name}</div>
      <div class="rightval">${token.symbol}</div>
      ${state.token?.id === token.id ? '<div>✓</div>' : ''}
    </button>
  `).join('');
}

function renderSelected() {
  const from = document.getElementById('from-selected');
  const to = document.getElementById('to-selected');
  const amountToken = document.getElementById('amount-token');
  const walletBtn = document.getElementById('wallet-btn');
  const amt = document.getElementById('amount-value');

  if (from) {
    from.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        <img class="ico" src="${state.fromChain.logo}" alt="${state.fromChain.name} logo" style="width:24px;height:24px;" onerror="${logoFallback(state.fromChain.name[0])}">
        ${state.fromChain.name}
      </span>
      <span>⌄</span>
    `;
  }

  if (to) {
    to.innerHTML = `<span>${chainLabel(state.toChain)}</span><span>⌄</span>`;
  }

  if (amountToken) {
    amountToken.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        <img class="ico" src="${state.token.logo}" alt="${state.token.name} logo" style="width:24px;height:24px;" onerror="${logoFallback(state.token.symbol[0])}">
        ${state.token.symbol}
      </span>
    `;
  }

  if (amt) amt.textContent = state.amount;
  if (walletBtn) walletBtn.textContent = state.wallet ? `Connected ${shortAddr(state.wallet)}` : 'Connect Wallet';
}

async function connectWallet() {
  if (!window.ethereum) {
    alert('No wallet found');
    return;
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  state.wallet = accounts?.[0] || null;
  renderSelected();
  await loadQuotes();
}

async function loadQuotes() {
  state.loading = true;
  state.error = '';
  renderRoutes([]);

  const amountWei = BigInt(Math.max(0, Math.floor(Number(state.amount || 0) * 1e18))).toString();
  const fromId = chainIdMap[state.fromChain.id];
  const toId = chainIdMap[state.toChain.id];
  const user = state.wallet || '0x0000000000000000000000000000000000000000';
  const originCurrency = '0x0000000000000000000000000000000000000000';
  const destinationCurrency = '0x0000000000000000000000000000000000000000';

  const relayBody = {
    user,
    recipient: user,
    originChainId: fromId,
    destinationChainId: toId,
    originCurrency,
    destinationCurrency,
    amount: amountWei,
    tradeType: 'EXACT_INPUT'
  };

  const relayReq = fetch('https://api.relay.link/quote/v2', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(relayBody)
  }).then(r => r.ok ? r.json() : Promise.reject(r.statusText));

  const gasReq = fetch(`https://backend.gas.zip/v2/quotes/${fromId}/${amountWei}/${toId}?to=${encodeURIComponent(user)}&from=${encodeURIComponent(user)}`)
    .then(r => r.ok ? r.json() : Promise.reject(r.statusText));

  const acrossReq = fetch(`https://app.across.to/api/swap/approval?originChainId=${fromId}&destinationChainId=${toId}&inputToken=${originCurrency}&outputToken=${destinationCurrency}&amount=${amountWei}&integratorId=demo`, {
    headers: state.wallet ? { Authorization: 'Bearer demo' } : {}
  }).then(r => r.ok ? r.json() : Promise.reject(r.statusText));

  const settled = await Promise.allSettled([relayReq, gasReq, acrossReq]);
  const routes = [];

  const relay = settled[0].status === 'fulfilled' ? settled[0].value : null;
  if (relay) {
    const fee = relay.fees?.relayer?.amountFormatted || relay.fees?.gas?.amountFormatted || '';
    routes.push({
      router: 'Relay',
      routerFullName: 'Relay Bridge',
      receiveAmount: relay.outputAmountFormatted || relay.amountOutFormatted || relay.toAmountFormatted || relay.amountReceivedFormatted || '—',
      receiveSymbol: state.token.symbol,
      time: relay.estimatedTime || relay.estimatedExecutionTime || '—',
      gas: fee ? `fee ${fee}` : 'fee —',
      slippage: 'live quote',
      loss: 'Relay',
      url: 'https://relay.link',
      logo: './logos/routers/relay.png',
      badge: 'Best Route',
      badgeClass: ''
    });
  }

  const gas = settled[1].status === 'fulfilled' ? settled[1].value : null;
  if (gas) {
    const q = gas.quotes?.[0] || gas.quotes?.find?.(x => x && !x.error);
    routes.push({
      router: 'Gas.zip',
      routerFullName: 'Gas.zip',
      receiveAmount: q?.expected ? fmt(Number(q.expected) / 1e18, 4) : '—',
      receiveSymbol: state.token.symbol,
      time: q?.speed ? `${Math.round(q.speed)} s` : '—',
      gas: q?.gas ? `gas ${q.gas}` : 'gas —',
      slippage: 'live quote',
      loss: 'Gas.zip',
      url: 'https://www.gas.zip/',
      logo: './logos/routers/gaszip.png',
      badge: 'Fast',
      badgeClass: 'gray'
    });
  }

  const across = settled[2].status === 'fulfilled' ? settled[2].value : null;
  if (across) {
    const est = across.estimatedOutput || across.outputAmount || across.outputAmountFormatted || across.output || across.amountOut;
    routes.push({
      router: 'Across',
      routerFullName: 'Across Protocol',
      receiveAmount: est ? String(est) : '—',
      receiveSymbol: state.token.symbol,
      time: across.fillDeadline || across.estimatedTime || '—',
      gas: across.relayerGas?.amountFormatted ? `fee ${across.relayerGas.amountFormatted}` : 'fee —',
      slippage: 'live quote',
      loss: 'Across',
      url: 'https://across.to',
      logo: './logos/routers/across.png',
      badge: 'Cheap',
      badgeClass: 'green'
    });
  }

  state.quotes = routes;
  state.loading = false;
  renderRoutes(routes);
}

function renderRoutes(items) {
  const root = document.getElementById('routes');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = `
      <div class="route">
        <div class="route-top">
          <strong>${state.loading ? 'Loading quotes…' : 'No live routes yet'}</strong>
        </div>
        <div>${state.error || 'Router quotes will appear here once the APIs respond.'}</div>
      </div>
    `;
    return;
  }

  root.innerHTML = items.map((route, index) => `
    <button class="route ${state.selectedRouteIndex === index ? 'active' : ''}" type="button" data-route="${index}" aria-label="Select ${route.routerFullName} route">
      <div class="route-top">
        <div class="route-brand">
          <img src="${route.logo}" alt="${route.routerFullName} logo" onerror="${logoFallback(route.router[0])}">
          <div>
            <div class="r-amt">${route.receiveAmount} ${route.receiveSymbol}</div>
            <div class="router-name">${route.routerFullName}</div>
          </div>
        </div>
        <span class="badge ${route.badgeClass}">${route.badge}</span>
      </div>
      <div class="meta">
        <span>via <a href="${route.url}" target="_blank" rel="noopener noreferrer" class="router-inline-link" data-stop-route="true"><b>${route.routerFullName}</b></a></span>
        <span><b>${route.time}</b></span>
        <span>${route.gas}</span>
        <span>${route.slippage}</span>
        <span>${route.loss}</span>
      </div>
    </button>
  `).join('');
}

function bind() {
  document.getElementById('chains')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-chain]');
    if (!btn) return;
    state.fromChain = chains.find(c => c.id === btn.dataset.chain) || state.fromChain;
    renderChains();
    renderSelected();
    loadQuotes();
  });

  document.getElementById('tokens')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-token]');
    if (!btn) return;
    state.token = tokens.find(t => t.id === btn.dataset.token) || state.token;
    renderTokens();
    renderSelected();
    loadQuotes();
  });

  document.getElementById('to-selected')?.addEventListener('click', () => {
    document.getElementById('to-panel')?.classList.toggle('open');
  });

  document.getElementById('to-chains')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-to-chain]');
    if (!btn) return;
    state.toChain = chains.find(c => c.id === btn.dataset.toChain) || state.toChain;
    renderToChains();
    renderSelected();
    loadQuotes();
  });

  document.getElementById('amount-value')?.addEventListener('input', e => {
    state.amount = e.target.value;
    loadQuotes();
  });

  document.getElementById('wallet-btn')?.addEventListener('click', connectWallet);

  document.getElementById('routes')?.addEventListener('click', e => {
    if (e.target.closest('[data-stop-route]')) return;
    const btn = e.target.closest('[data-route]');
    if (!btn) return;
    state.selectedRouteIndex = Number(btn.dataset.route);
    renderRoutes(state.quotes);
  });
}

function initExtras() {
  const amountField = document.getElementById('amount-field');
  if (amountField && !document.getElementById('amount-value')) {
    amountField.innerHTML = `<input id="amount-value" value="${state.amount}" inputmode="decimal" style="background:transparent;border:none;color:inherit;font-size:38px;font-weight:900;letter-spacing:-.03em;outline:none;width:100%;max-width:220px" />`;
  }

  const toBtn = document.getElementById('to-selected');
  if (toBtn && !document.getElementById('to-panel')) {
    const panel = document.createElement('div');
    panel.id = 'to-panel';
    panel.style.display = 'none';
    panel.style.marginTop = '10px';
    panel.innerHTML = `<div class="list" id="to-chains"></div>`;
    toBtn.parentElement.appendChild(panel);
  }

  const routes = document.getElementById('routes');
  if (routes && state.loading) renderRoutes([]);
}

const mo = new MutationObserver(() => {
  const af = document.querySelector('.field .amount');
  if (af && !document.getElementById('amount-value')) {
    af.replaceWith(Object.assign(document.createElement('input'), {
      id: 'amount-value',
      value: state.amount,
      inputMode: 'decimal',
      style: 'background:transparent;border:none;color:inherit;font-size:38px;font-weight:900;letter-spacing:-.03em;outline:none;width:100%;max-width:220px'
    }));
  }
});

mo.observe(document.documentElement, { childList: true, subtree: true });

renderChains();
renderTokens();
renderSelected();
renderRoutes([]);
bind();
setTimeout(() => {
  renderToChains();
  loadQuotes();
}, 0);
