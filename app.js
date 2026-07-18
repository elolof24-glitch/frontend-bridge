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
  token: tokens[0]
};

const routeData = [
  {
    router: 'Relay',
    receiveAmount: '10.0000',
    receiveSymbol: 'ETH',
    receiveUsd: '$18,420.88',
    time: 'a few seconds',
    gas: 'gas < $0.01',
    slippage: 'slippage 0.01%',
    loss: 'loss 0.00%',
    url: 'https://relay.link',
    logo: './logos/routers/relay.png'
  },
  {
    router: 'Zip',
    receiveAmount: '9.9959',
    receiveSymbol: 'ETH',
    receiveUsd: '$18,413.41',
    time: 'a few seconds',
    gas: 'gas < $0.01',
    slippage: 'slippage 0.05%',
    loss: 'loss 0.041%',
    url: 'https://zipswap.io',
    logo: './logos/routers/zip.png'
  },
  {
    router: 'Across',
    receiveAmount: '9.9920',
    receiveSymbol: 'ETH',
    receiveUsd: '$18,405.10',
    time: '15 minutes',
    gas: 'gas < $0.01',
    slippage: 'slippage 0.08%',
    loss: 'loss 0.08%',
    url: 'https://across.to',
    logo: './logos/routers/across.png'
  }
];

function renderChains() {
  const root = document.getElementById('chains');
  if (!root) return;

  root.innerHTML = chains.map(chain => `
    <button class="item ${state.fromChain && state.fromChain.id === chain.id ? 'active' : ''}" data-chain="${chain.id}" type="button">
      <div class="ico"><img src="${chain.logo}" alt="${chain.name} logo"></div>
      <div class="name">${chain.name}</div>
      <div class="chev">›</div>
    </button>
  `).join('');
}

function renderTokens() {
  const root = document.getElementById('tokens');
  if (!root) return;

  root.innerHTML = tokens.map(token => `
    <button class="token ${state.token && state.token.id === token.id ? 'active' : ''}" data-token="${token.id}" type="button">
      <div class="ico"><img src="${token.logo}" alt="${token.name} logo"></div>
      <div class="name">${token.name}</div>
      <div class="rightval">${token.symbol}</div>
      ${state.token && state.token.id === token.id ? '<div>✓</div>' : ''}
    </button>
  `).join('');
}

function renderSelected() {
  const from = document.getElementById('from-selected');
  const token = document.getElementById('token-selected');
  const amountToken = document.getElementById('amount-token');
  const tokenLabel = document.getElementById('token-label');

  if (from) {
    from.innerHTML = `
      <span>
        <img class="ico" src="${state.fromChain.logo}" alt="${state.fromChain.name}" style="width:24px;height:24px;display:inline-block;vertical-align:middle;margin-right:10px">
        ${state.fromChain.name}
      </span>
      <span>⌄</span>
    `;
  }

  if (token) {
    token.innerHTML = `
      <span>
        <img class="ico" src="${state.token.logo}" alt="${state.token.name}" style="width:24px;height:24px;display:inline-block;vertical-align:middle;margin-right:10px">
        ${state.token.name}
      </span>
      <span>⌄</span>
    `;
  }

  if (amountToken) {
    amountToken.innerHTML = `
      <img class="ico" src="${state.token.logo}" alt="${state.token.name}" style="width:24px;height:24px;display:inline-block">
      ${state.token.symbol}
    `;
  }

  if (tokenLabel) {
    tokenLabel.textContent = state.token.symbol;
  }
}

function renderRoutes(items) {
  const root = document.getElementById('routes');

  if (!root) return;

  if (!items.length) {
    root.innerHTML = `
      <div class="route-card">
        <div class="route-top">
          <strong>No live routes yet</strong>
        </div>
        <div>Router quotes will appear here once Across, Relay, and Zip are connected.</div>
      </div>
    `;
    return;
  }

  root.innerHTML = items.map(route => `
    <a class="route-card route-link" href="${route.url}" target="_blank" rel="noopener noreferrer">
      <div class="route-top">
        <div class="router-brand">
          <img src="${route.logo}" alt="${route.router} logo">
          <div>
            <div class="route-amount">${route.receiveAmount} ${route.receiveSymbol}</div>
            <div class="router-name">${route.router}</div>
          </div>
        </div>
        <span class="route-pill ${route.router === 'Relay' ? '' : route.router === 'Zip' ? 'gray' : 'green'}">
          ${route.router === 'Relay' ? 'Best Route' : route.router === 'Zip' ? 'Fast' : 'Cheap'}
        </span>
      </div>
      <div class="route-quote">${route.receiveUsd}</div>
      <div class="route-meta">
        <span>via <b>${route.router}</b></span>
        <span><b>${route.time}</b></span>
        <span>${route.gas}</span>
        <span>${route.slippage}</span>
        <span>${route.loss}</span>
      </div>
    </a>
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
}

renderChains();
renderTokens();
renderSelected();
renderRoutes(routeData);
bind();
