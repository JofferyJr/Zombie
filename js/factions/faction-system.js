import { createRng } from '../core/rng.js';
const MAJORS = [
  ['central-restoration-authority','Central Restoration Authority','CRA',1],
  ['iron-banner-coalition','Iron Banner Coalition','IBC',1.08],
  ['jade-river-union','Jade River Union','JRU',.95],
  ['longyuan-research-directorate','Longyuan Research Directorate','LRD',1.15],
  ['black-road-network','Black Road Network','BRN',1.25],
  ['white-lantern-communities','White Lantern Communities','WLC',.98],
];

function relationRecord([id,name,shortName,tradeModifier]) {
  return { id,name,shortName,tradeModifier,reputation:0,trust:0,fear:0,favor:0,tradeAccess:id==='central-restoration-authority'?20:0,intelAccess:0,activeInSlice:id==='central-restoration-authority' };
}

export function initializeVerticalSliceFactions(state, seed) {
  state.factions = Object.fromEntries(MAJORS.map(meta=>{const record=relationRecord(meta);return [record.id,record];}));
  const cra=state.factions['central-restoration-authority'];
  cra.checkpoint={districtId:'railway-district',name:'Railway Relief Checkpoint'};
  cra.market={stock:{'bottled-water':8,'bandage':4,'basic-medicine':2,'batteries':4},markup:1.18,targetStock:6};
  const rng=createRng(`${seed}:minor-faction`); const left=['Red','North','Quiet','Stone','Green','Old']; const right=['Gate','Bridge','Workshop','Courtyard','Track','Harbor'];
  const roll=rng.int(1000,9999); const id=`minor-${roll}`;
  state.factions[id]={id,name:`${rng.pick(left)} ${rng.pick(right)} Collective`,shortName:`M-${roll}`,procedural:true,tradeModifier:1.1,reputation:0,trust:0,fear:0,favor:0,tradeAccess:0,intelAccess:0,homeDistrictId:rng.pick(['old-residential-district','steelworks-zone','freight-logistics-park'])};
  return state;
}

export function changeFactionRelation(state, factionId, deltas={}) {
  const faction=state.factions[factionId]; if(!faction) throw new Error('Faction not found');
  for(const key of ['reputation','trust','fear','favor','tradeAccess','intelAccess']) if(Number.isFinite(deltas[key])) faction[key]=Math.max(-100,Math.min(100,(faction[key]??0)+deltas[key]));
  return state;
}
