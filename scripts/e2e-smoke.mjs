import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const sleep = ms => new Promise(r=>setTimeout(r,ms));
const userData=await mkdtemp(path.join(tmpdir(),'moshi-chromium-'));
const http=spawn('python3',['-m','http.server','4173','--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const chrome=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=9223',`--user-data-dir=${userData}`,'about:blank'],{stdio:'ignore'});
let ws;
let nextId=0;
const pending=new Map();
async function waitForHttp(){for(let i=0;i<80;i++){try{const response=await fetch('http://127.0.0.1:4173/index.html');if(response.ok)return;}catch{}await sleep(100);}throw new Error('Static HTTP server did not start');}
async function waitForJson(){for(let i=0;i<80;i++){try{const list=await fetch('http://127.0.0.1:9223/json/list').then(r=>r.json());if(list[0])return list[0];}catch{}await sleep(100);}throw new Error('Chromium DevTools endpoint did not start');}
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.result?.value;}
async function waitFor(predicate,label,timeout=8000){const start=Date.now();while(Date.now()-start<timeout){if(await predicate())return;await sleep(80);}throw new Error(`Timed out waiting for ${label}`);}
async function click(text){const result=await evaluate(`(()=>{const el=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!el)return {ok:false,buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim())};el.click();return {ok:true};})()`);if(!result?.ok)throw new Error(`Button not found: ${text}. Seen: ${result?.buttons?.join(' | ')}`);await sleep(80);}
async function fillLabel(label,value){const ok=await evaluate(`(()=>{const label=[...document.querySelectorAll('label')].find(l=>l.textContent.includes(${JSON.stringify(label)}));const el=label?.querySelector('input,select,textarea');if(!el)return false;el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true;})()`);if(!ok)throw new Error(`Field not found: ${label}`);}
async function bodyHas(text){return evaluate(`document.body.innerText.toLowerCase().includes(${JSON.stringify(text.toLowerCase())})`);}

try{
  await waitForHttp();
  const target=await waitForJson();
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg);}};
  await call('Page.enable'); await call('Runtime.enable');
  const navigation=await call('Page.navigate',{url:'http://127.0.0.1:4173/?test=1'});
  if(navigation.result?.errorText) throw new Error(`Chromium could not navigate to the local game: ${navigation.result.errorText}`);
  await waitFor(()=>bodyHas('Mòshì Huáxià'),'main menu');
  await click('New Game'); await click('Next'); await fillLabel('World seed','HX-E2E-0001'); await click('Next'); await fillLabel('Character name','Lin Wei'); await click('Next'); await click('Begin');
  await waitFor(()=>bodyHas('Northern Suburbs'),'Northern Suburbs gameplay');
  await click('Debug: Loot Starter Store'); await click('Debug: Recruit Survivor'); await click('Debug: Claim Apartment'); await click('Shelter'); await click('Assign Guard'); await click('Close');
  await click('Debug: Enter Van'); await click('Travel: Railway District'); await waitFor(()=>bodyHas('Railway District'),'Railway District');
  await click('Debug: Open Trader'); await click('Buy Water'); await click('Close'); await click('Debug: Advance Event Time'); await waitFor(()=>bodyHas('horde'),'horde radio message'); await click('Close');
  await click('Save'); await waitFor(()=>bodyHas('Saved'),'save completion');
  await call('Page.reload',{ignoreCache:true}); await waitFor(()=>bodyHas('Continue'),'Continue button after reload'); await click('Continue'); await waitFor(()=>bodyHas('Railway District'),'loaded Railway District save');
  console.log('Offline browser E2E passed: new game → shelter → van → Railway trade → horde → save/reload.');
} finally {
  try{ws?.close();}catch{}
  chrome.kill('SIGTERM'); http.kill('SIGTERM'); await sleep(150); await rm(userData,{recursive:true,force:true});
}
