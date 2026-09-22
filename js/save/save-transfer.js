import { assertSerializableGameState } from '../core/game-state.js';

export function suggestSaveFilename(state){const name=String(state.player?.name??'Survivor').trim().replace(/[^A-Za-z0-9_-]+/g,'_');return `Moshi_Huaxia_${name}_Day${state.world?.day??1}.hxs`;}
export function exportSave(state){assertSerializableGameState(state);return new Blob([JSON.stringify(state,null,2)],{type:'application/json'});}
export async function importSave(fileOrText){
  const text=typeof fileOrText==='string'?fileOrText:await fileOrText.text();
  let state;try{state=JSON.parse(text);}catch{throw new Error('Save is not valid JSON');}
  if(!state?.meta?.version)throw new Error('Save version is missing');
  if(state.meta.version>1)throw new Error(`Unsupported future save version: ${state.meta.version}`);
  if(state.meta.version!==1)throw new Error(`Unsupported save version: ${state.meta.version}`);
  assertSerializableGameState(state);return state;
}
