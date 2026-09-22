import { getTradeQuote } from '../economy/trade-system.js';
export function renderTradeHtml(state,factionId,itemCatalog){
 const f=state.factions[factionId]; if(!f?.market)return '<section><p>Market unavailable.</p></section>';
 const rows=Object.entries(f.market.stock).map(([id,stock])=>{const item=itemCatalog.find(i=>i.id===id);if(!item)return '';const quote=getTradeQuote({item,market:{stock,targetStock:f.market.targetStock,markup:f.market.markup},relation:f,world:state.world});const label=id==='bottled-water'?'Water':item.name;return `<li><span>${item.name} · stock ${stock} · Barter value ${quote}</span><button data-buy="${id}">Buy ${label}</button></li>`;}).join('');
 return `<section class="trade-panel"><header><h2>${f.shortName} Trader</h2><span>Reputation ${f.reputation} · Trust ${f.trust}</span></header><ul class="loot-list">${rows}</ul></section>`;
}
