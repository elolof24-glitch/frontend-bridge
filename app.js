function renderRoutes(items) {
  const root = document.getElementById('routes');

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
