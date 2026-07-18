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

let state = {
  fromChain: chains[1],
  toChain: null,
  token: tokens[0],
  selectedRouteIndex: 0
};

const routeData = [
  {
    router: 'Relay',
    routerFullName: 'Relay Bridge',
    receiveAmount: '10.0000',
    receiveSymbol: 'ETH',
    receiveUsd: '$18,420.88',
    time: 'a few seconds',
    gas: 'gas < $0.01',
    slippage: 'slippage 0.01%',
    loss: 'loss 0.00%',
    url: 'https://relay.link',
    logo: './logos/routers/relay.png',
    badge: 'Best Route',
    badgeClass: ''
  },
  {
    router: 'Gas.zip',
    routerFullName: 'Gas.zip',
    receiveAmount: '9.9959',
    receiveSymbol: 'ETH',
    receiveUsd: '$18,413.41',
    time: 'a few seconds',
    gas: 'gas < $0.01',
    slippage: 'slippage 0.05%',
    loss: 'loss 0.041%',
    url: 'https://www.gas.zip/',
    logo: './logos/routers/gaszip.png',
    badge: 'Fast',
    badgeClass: 'gray'
  },
  {
    router: 'Across',
    routerFullName: 'Across Protocol',
    receiveAmount: '9.9920',
    receiveSymbol: 'ETH',
    receiveUsd: '$18,405.10',
    time: '15 minutes',
    gas: 'gas < $0.01',
    slippage: 'slippage 0.08%',
    loss: 'loss 0.08%',
    url: 'https://across.to',
    logo: './logos/routers/across.png',
    badge: 'Cheap',
    badgeClass: 'green'
  }
];

function logoFallback(img, label) {
  return `this.onerror=null;this.outerHTML='<span class="logo-fallback">${label}</span>'`;
}

function renderChains() {
  const root = document.getElementById('chains');
  if (!root) return;

  root.innerHTML = chains.map(chain => `
    <button class="item ${state.fromChain?.id === chain.id ? 'active' : ''}" data-chain="${chain.id}" type="button">
      <div class="ico"><img src="${chain.logo}" alt="${chain.name} logo" onerror="${logoFallback('this', chain.name[0])}"></div>
      <div class="name">${chain.name}</div>
      <div class="chev">›</div>
    </button>
  `).join('');
}

function renderTokens() {
  const root = document.getElementById('tokens');
  if (!root) return;

  root.innerHTML = tokens.map(token => `
    <button class="token ${state.token?.id === token.id ? 'active' : ''}" data-token="${token.id}" type="button">
      <div class="ico"><img src="${token.logo}" alt="${token.name} logo" onerror="${logoFallback('this', token.symbol[0])}"></div>
      <div class="name">${token.name}</div>
      <div class="rightval">${token.symbol}</div>
      ${state.token?.id === token.id ? '<div>✓</div>' : ''}
    </button>
  `).join('');
}

function renderSelected() {
  const from = document.getElementById('from-selected');
  const amountToken = document.getElementById('amount-token');

  if (from) {
    from.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        <img class="ico" src="${state.fromChain.logo}" alt="${state.fromChain.name} logo" style="width:24px;height:24px;" onerror="${logoFallback('this', state.fromChain.name[0])}">
        ${state.fromChain.name}
      </span>
      <span>⌄</span>
    `;
  }

  if (amountToken) {
    amountToken.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        <img class="ico" src="${state.token.logo}" alt="${state.token.name} logo" style="width:24px;height:24px;" onerror="${logoFallback('this', state.token.symbol[0])}">
        ${state.token.symbol}
      </span>
    `;
  }
}

function renderRoutes(items) {
  const root = document.getElementById('routes');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = `
      <div class="route">
        <div class="route-top">
          <strong>No live routes yet</strong>
        </div>
        <div>Router quotes will appear here once Across, Relay, and Gas.zip are connected.</div>
      </div>
    `;
    return;
  }

  root.innerHTML = items.map((route, index) => `
    <button
      class="route ${state.selectedRouteIndex === index ? 'active' : ''}"
      type="button"
      data-route="${index}"
      aria-label="Select ${route.routerFullName} route"
    >
      <div class="route-top">
        <div class="route-brand">
          <img src="${route.logo}" alt="${route.routerFullName} logo" onerror="${logoFallback('this', route.router[0])}">
          <div>
            <div class="r-amt">${route.receiveAmount} ${route.receiveSymbol}</div>
            <div class="router-name">${route.routerFullName}</div>
          </div>
        </div>

        <span class="badge ${route.badgeClass}">${route.badge}</span>
      </div>

      <div class="meta">
        <span>
          via
          <a
            href="${route.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="router-inline-link"
            data-stop-route="true"
          ><b>${route.routerFullName}</b></a>
        </span>
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
  });

  document.getElementById('tokens')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-token]');
    if (!btn) return;

    state.token = tokens.find(t => t.id === btn.dataset.token) || state.token;
    renderTokens();
    renderSelected();
  });

  document.getElementById('routes')?.addEventListener('click', e => {
    if (e.target.closest('[data-stop-route]')) {
      e.stopPropagation();
      return;
    }

    const btn = e.target.closest('[data-route]');
    if (!btn) return;

    state.selectedRouteIndex = Number(btn.dataset.route);
    renderRoutes(routeData);
  });
}

renderChains();
renderTokens();
renderSelected();
renderRoutes(routeData);
bind();
