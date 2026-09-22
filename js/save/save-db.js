const DB_NAME='moshi-huaxia';
const DB_VERSION=1;
const STORE='saves';

export function openSaveDb({indexedDBImpl=globalThis.indexedDB}={}) {
  if(!indexedDBImpl) return Promise.reject(new Error('IndexedDB is unavailable'));
  return new Promise((resolve,reject)=>{
    const request=indexedDBImpl.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'slotId'});};
    request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error??new Error('Unable to open save database'));
  });
}

function metadataFor(state){return {playerName:state.player?.name??'Unknown',day:state.world?.day??1,districtId:state.world?.districtId??'unknown',difficulty:state.meta?.difficulty??'survival',seed:state.meta?.seed??'',updatedAt:new Date().toISOString()};}

async function idbPut(record){const db=await openSaveDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
async function idbGet(id){const db=await openSaveDb();return new Promise((resolve,reject)=>{const request=db.transaction(STORE,'readonly').objectStore(STORE).get(id);request.onsuccess=()=>{const value=request.result??null;db.close();resolve(value);};request.onerror=()=>reject(request.error);});}
async function idbList(){const db=await openSaveDb();return new Promise((resolve,reject)=>{const request=db.transaction(STORE,'readonly').objectStore(STORE).getAll();request.onsuccess=()=>{const value=request.result??[];db.close();resolve(value);};request.onerror=()=>reject(request.error);});}

export async function saveGame(slotId,state,{adapter}={}){
  const record={slotId,metadata:metadataFor(state),state:structuredClone(state)};
  if(adapter) await adapter.put(record); else await idbPut(record);
}
export async function loadGame(slotId,{adapter}={}){const record=adapter?await adapter.get(slotId):await idbGet(slotId);return record?structuredClone(record.state):null;}
export async function listSaves({adapter}={}){const records=adapter?await adapter.list():await idbList();return records.map(r=>({...r.metadata,slotId:r.slotId})).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));}
