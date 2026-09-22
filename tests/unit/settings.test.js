import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, normalizeSettings, applySettings, loadSettings, renderSettingsHtml } from '../../js/ui/settings-panel.js';

function storage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))};}
function fakeDocument(){const classes=new Set();const props=new Map();return {documentElement:{style:{setProperty:(k,v)=>props.set(k,v)}},body:{classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}},_classes:classes,_props:props};}

test('settings defaults and scale normalization stay inside 0.8..1.4',()=>{
 assert.equal(DEFAULT_SETTINGS.uiScale,1); assert.equal(normalizeSettings({uiScale:2}).uiScale,1.4); assert.equal(normalizeSettings({uiScale:.2}).uiScale,.8);
});

test('applySettings persists under moshi-huaxia-settings and applies CSS/classes',()=>{
 const s=storage(), doc=fakeDocument(); const out=applySettings({...DEFAULT_SETTINGS,uiScale:1.2,textSize:1.1,reducedMotion:true},{storage:s,documentRef:doc,matchMedia:()=>({matches:false})});
 assert.equal(JSON.parse(s.getItem('moshi-huaxia-settings')).uiScale,1.2); assert.equal(doc._props.get('--ui-scale'),'1.2'); assert.ok(doc._classes.has('reduced-motion')); assert.equal(out.touchMode,false);
});

test('loadSettings automatically enables touchMode for coarse pointer',()=>{
 const s=storage(); const loaded=loadSettings({storage:s,matchMedia:()=>({matches:true})}); assert.equal(loaded.touchMode,true);
});

test('settings markup exposes accessibility controls',()=>{
 const html=renderSettingsHtml(DEFAULT_SETTINGS); for(const label of ['Text size','UI scale','Reduced motion','Flash reduction','Large icons','Auto-pause threat','Graphics preset']) assert.match(html,new RegExp(label,'i'));
});
