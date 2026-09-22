export const DEFAULT_SETTINGS = Object.freeze({ uiScale:1, textSize:1, reducedMotion:false, flashReduction:false, largeIcons:false, autoPauseThreat:true, touchMode:false, graphicsPreset:'auto' });
const KEY='moshi-huaxia-settings';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)));

export function normalizeSettings(settings={}){
  const preset=['auto','low','medium','high'].includes(settings.graphicsPreset)?settings.graphicsPreset:DEFAULT_SETTINGS.graphicsPreset;
  return {...DEFAULT_SETTINGS,...settings,uiScale:clamp(settings.uiScale??1,.8,1.4),textSize:clamp(settings.textSize??1,.8,1.4),graphicsPreset:preset,reducedMotion:Boolean(settings.reducedMotion),flashReduction:Boolean(settings.flashReduction),largeIcons:Boolean(settings.largeIcons),autoPauseThreat:settings.autoPauseThreat!==false,touchMode:Boolean(settings.touchMode)};
}

export function loadSettings({storage=globalThis.localStorage,matchMedia=globalThis.matchMedia?.bind(globalThis)}={}){
  let parsed={}; try{parsed=JSON.parse(storage?.getItem(KEY)??'{}')??{};}catch{}
  const settings=normalizeSettings(parsed); if(matchMedia?.('(pointer: coarse)')?.matches) settings.touchMode=true; return settings;
}

export function applySettings(settings,{storage=globalThis.localStorage,documentRef=globalThis.document,matchMedia=globalThis.matchMedia?.bind(globalThis)}={}){
  const normalized=normalizeSettings(settings); if(matchMedia?.('(pointer: coarse)')?.matches) normalized.touchMode=true;
  documentRef?.documentElement?.style?.setProperty('--ui-scale',String(normalized.uiScale)); documentRef?.documentElement?.style?.setProperty('--text-scale',String(normalized.textSize));
  for(const [cls,on] of [['reduced-motion',normalized.reducedMotion],['flash-reduction',normalized.flashReduction],['large-icons',normalized.largeIcons],['touch-mode',normalized.touchMode]]) documentRef?.body?.classList?.toggle(cls,on);
  storage?.setItem(KEY,JSON.stringify(normalized)); return normalized;
}

export function renderSettingsHtml(settings){const s=normalizeSettings(settings);return `<section class="settings-panel"><h2>Settings</h2><label>Text size <input name="textSize" type="range" min="0.8" max="1.4" step="0.1" value="${s.textSize}"></label><label>UI scale <input name="uiScale" type="range" min="0.8" max="1.4" step="0.1" value="${s.uiScale}"></label><label><input name="reducedMotion" type="checkbox" ${s.reducedMotion?'checked':''}> Reduced motion</label><label><input name="flashReduction" type="checkbox" ${s.flashReduction?'checked':''}> Flash reduction</label><label><input name="largeIcons" type="checkbox" ${s.largeIcons?'checked':''}> Large icons</label><label><input name="autoPauseThreat" type="checkbox" ${s.autoPauseThreat?'checked':''}> Auto-pause threat</label><label>Graphics preset <select name="graphicsPreset">${['auto','low','medium','high'].map(v=>`<option value="${v}" ${s.graphicsPreset===v?'selected':''}>${v}</option>`).join('')}</select></label></section>`;}

export function mountSettingsPanel(root, settings, {onClose=()=>{}}={}){
  root.innerHTML=`<div class="modal-card">${renderSettingsHtml(settings)}<div class="wizard-actions"><button data-apply>Apply</button><button data-close>Close</button></div></div>`;
  root.querySelector('[data-apply]')?.addEventListener('click',()=>{const q=n=>root.querySelector(`[name="${n}"]`); settings=applySettings({...settings,textSize:q('textSize').value,uiScale:q('uiScale').value,reducedMotion:q('reducedMotion').checked,flashReduction:q('flashReduction').checked,largeIcons:q('largeIcons').checked,autoPauseThreat:q('autoPauseThreat').checked,graphicsPreset:q('graphicsPreset').value});});
  root.querySelector('[data-close]')?.addEventListener('click',()=>{root.innerHTML='';onClose(settings);});
}
