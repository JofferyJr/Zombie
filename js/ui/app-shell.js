export function renderMainMenu(root, { onNewGame, onContinue, onLoad, onImport, onSettings, hasSaves=false }) {
  root.classList.remove('gameplay');
  root.innerHTML = `<section class="menu-card"><p class="eyebrow">Leitian vertical slice</p><h1>Mòshì Huáxià</h1><p>Survive a changing fictional Chinese apocalypse.</p><div class="menu-actions menu-actions-stack">${hasSaves?'<button data-action="continue">Continue</button><button data-action="load">Load Game</button>':''}<button data-action="import">Import Save</button><button data-action="settings">Settings</button><button data-action="new-game">New Game</button></div></section>`;
  root.querySelector('[data-action="new-game"]')?.addEventListener('click', onNewGame);
  root.querySelector('[data-action="continue"]')?.addEventListener('click', onContinue);
  root.querySelector('[data-action="load"]')?.addEventListener('click', onLoad);
  root.querySelector('[data-action="import"]')?.addEventListener('click', onImport);
  root.querySelector('[data-action="settings"]')?.addEventListener('click', onSettings);
}

export function renderGameplayShell(root, state) {
  root.innerHTML = `<section class="game-shell"><div class="location-card"><span>${state.world.cityId === 'leitian' ? 'Leitian' : state.world.cityId}</span><strong>${state.world.districtId === 'railway-district' ? 'Railway District' : 'Northern Suburbs'}</strong></div><div id="game-actions" class="game-actions"><button data-game-action="save">Save</button><button data-game-action="export">Export Save</button><button data-game-action="menu">Main Menu</button></div></section>`;
}
