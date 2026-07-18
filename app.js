function renderRows(items, targetId) {
  const root = document.getElementById(targetId);
  root.innerHTML = items.map(item => `
    <div class="row">
      <img src="${item.logo}" alt="${item.name}" />
      <div>
        <div>${item.name}</div>
        ${item.symbol ? `<small>${item.symbol}</small>` : ``}
      </div>
    </div>
  `).join('');
}

function renderRoutes(items) {
  const root = document.getElementById('routes');
  root.innerHTML = items.map(route => `
    <div class="route-card">
      <div class="route-top">
        <strong>${route.receiveAmount} ${route.receiveSymbol}</strong>
        <span>via ${route.router}</span>
      </div>
      <div>${route.receiveUsd}</div>
      <div class="route-meta">
        <span>${route.time}</span>
        <span>${route.gas}</span>
        <span>${route.slippage}</span>
        <span>${route.loss}</span>
      </div>
    </div>
  `).join('');
}

renderRows(chains, 'chains');
renderRows(tokens, 'tokens');
renderRoutes(routes);
