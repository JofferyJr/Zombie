export function renderShelterHtml(state, shelterId) {
  const shelter = state.shelters[shelterId];
  if (!shelter) return '<section class="shelter-panel"><p>No shelter claimed.</p></section>';
  const people = Object.values(state.npcs).filter(n => n.shelterId === shelterId || n.communityId === state.player.communityId);
  return `<section class="shelter-panel"><header><h2>${shelter.name}</h2><span>Security ${shelter.security} · Beds ${shelter.beds}</span></header><nav class="tabs"><button>Overview</button><button>People</button><button>Jobs</button><button>Storage</button></nav><div class="shelter-grid"><article><h3>Overview</h3><p>Space ${shelter.space} · Water ${shelter.waterAccess} · Power ${shelter.power}</p></article><article><h3>People</h3><p>${people.map(n=>n.name).join(', ') || 'No assigned survivors'}</p></article><article><h3>Jobs</h3><p>${Object.values(shelter.jobs).map(j=>j.jobId).join(', ') || 'Unassigned'}</p></article><article><h3>Storage</h3><p>${shelter.storage.map(s=>`${s.itemId} ×${s.quantity}`).join(', ') || 'Empty'}</p></article></div></section>`;
}
export function mountShelterPanel(root,state,shelterId){ root.innerHTML = `<div class="modal-card">${renderShelterHtml(state,shelterId)}<button data-close>Close</button></div>`; }
