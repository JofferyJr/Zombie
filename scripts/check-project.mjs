import { readdir, readFile, stat, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
async function walk(dir) {
  const out=[];
  for (const name of await readdir(dir)) {
    const full=path.join(dir,name), info=await stat(full);
    if(info.isDirectory()) out.push(...await walk(full)); else out.push(full);
  }
  return out;
}
const jsFiles=(await walk(path.join(root,'js'))).filter(f=>f.endsWith('.js'));
for(const file of [...jsFiles,path.join(root,'playwright.config.js')]){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0) throw new Error(`Syntax check failed: ${path.relative(root,file)}\n${result.stderr}`);
}
const dataFiles=(await walk(path.join(root,'data'))).filter(f=>f.endsWith('.json'));
for(const file of dataFiles) JSON.parse(await readFile(file,'utf8'));
for(const file of jsFiles){
  const source=await readFile(file,'utf8');
  for(const match of source.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)){
    const target=path.resolve(path.dirname(file),match[1]);
    try{await access(target);}catch{throw new Error(`Unresolved local import ${match[1]} in ${path.relative(root,file)}`);}
  }
}
const html=await readFile(path.join(root,'index.html'),'utf8');
for(const id of ['app','game-canvas','hud-root','modal-root']) if(!html.includes(`id="${id}"`)) throw new Error(`Missing #${id} in index.html`);
console.log(`Static checks passed: ${jsFiles.length} JS modules, ${dataFiles.length} data catalogs, index shell valid.`);
