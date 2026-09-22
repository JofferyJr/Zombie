import { createRng } from '../core/rng.js';
const NAMES = ['Chen Yu','Lin Mei','Zhao An','Qiao Ren','Sun Lan','He Jin','Lu Fang','Wei Tao'];
const PROFESSIONS = ['nurse','mechanic','teacher','driver','warehouse-worker','cook'];
const TRAITS = ['calm','resourceful','anxious','poor-sleeper'];

export function createSurvivor(seed, index) {
  const rng = createRng(`${seed}:survivor:${index}`);
  const first = rng.pick(TRAITS);
  let second = rng.pick(TRAITS);
  while (second === first) second = rng.pick(TRAITS);
  return {
    id: `survivor-${index}-${rng.int(1000,9999)}`,
    name: rng.pick(NAMES), profession: rng.pick(PROFESSIONS), traits:[first,second],
    health:100, morale:rng.int(55,80), loyalty:rng.int(35,60),
    skills:{ combat:rng.int(5,25), medical:rng.int(5,25), engineering:rng.int(5,25), scavenging:rng.int(5,25) },
    relationships:{ friendship:0, rivalry:0, familyLinkIds:[] },
    communityId:null, recruited:false, x:422 + index*30, y:470 + index*20,
  };
}

export function recruitSurvivor(state, npcId) {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error('Survivor not found');
  npc.communityId = state.player.communityId ?? 'player-community';
  npc.recruited = true;
  npc.loyalty = Math.min(100, npc.loyalty + 10);
  return state;
}
