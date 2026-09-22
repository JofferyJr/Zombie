import { addItem } from '../world/loot-system.js';

export function getTradeQuote({ item, market, relation }) {
  const numericStock=typeof market.stock==='number'?market.stock:0;
  const target=Math.max(1,market.targetStock??5);
  const scarcity=1+Math.max(-.25,Math.min(.75,(target-numericStock)/target*.5));
  const accessDiscount=Math.max(0,Math.min(.24,(relation.tradeAccess??0)/100*.3));
  return Math.max(1,Math.round(item.baseValue*(market.markup??1.15)*scarcity*(1-accessDiscount)));
}

export function executeTrade(state, trade) {
  const faction=state.factions[trade.factionId]; if(!faction?.market) throw new Error('Faction market unavailable');
  const quantity=Math.max(1,Math.floor(trade.quantity??1)); const item=trade.item;
  const stock=faction.market.stock[item.id]??0;
  const quote=getTradeQuote({item,market:{stock,targetStock:faction.market.targetStock,markup:faction.market.markup},relation:faction,world:state.world});
  if(trade.direction==='buy'){
    if(stock<quantity) throw new Error('Market stock is insufficient');
    if((trade.offeredValue??0)<quote*quantity) throw new Error('Barter offer is too low');
    const result=addItem(state.inventory,{itemId:item.id,quantity},trade.itemCatalog);
    const moved=quantity-result.remainder; if(moved===0) throw new Error('Inventory cannot hold purchase');
    state.inventory=result.inventory; faction.market.stock[item.id]-=moved; return state;
  }
  if(trade.direction==='sell'){
    const stack=state.inventory.items.find(s=>s.itemId===item.id); if(!stack) throw new Error('Item not owned');
    const moved=Math.min(quantity,stack.quantity); stack.quantity-=moved; state.inventory.items=state.inventory.items.filter(s=>s.quantity>0); faction.market.stock[item.id]=(faction.market.stock[item.id]??0)+moved; return state;
  }
  throw new Error('Unsupported trade direction');
}
