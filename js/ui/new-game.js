const DIFFICULTIES = new Set(['casual', 'survival', 'permadeath']);
const STARTING_DATES = new Set(['day0', 'day3', 'week2', 'month1', 'random']);
const BACKGROUNDS = new Set(['civilian', 'ex-military', 'student', 'doctor', 'engineer', 'researcher', 'police', 'logistics-driver']);
const BACKGROUND_LABELS = {
  civilian: 'Civilian', 'ex-military': 'Former Soldier', student: 'Student', doctor: 'Doctor', engineer: 'Engineer', researcher: 'Biotech Researcher', police: 'Police', 'logistics-driver': 'Logistics Driver'
};

function makeSeed() {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  const hex = [...bytes].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `HX-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

export function createNewGameConfig(formData) {
  const difficulty = String(formData.difficulty ?? '');
  const startingDate = String(formData.startingDate ?? '');
  const backgroundId = String(formData.backgroundId ?? '');
  const name = String(formData.name ?? '').trim();
  if (!DIFFICULTIES.has(difficulty)) throw new Error('Unsupported difficulty');
  if (!STARTING_DATES.has(startingDate)) throw new Error('Unsupported starting date');
  if (!BACKGROUNDS.has(backgroundId)) throw new Error('Unsupported background');
  if (!name) throw new Error('Character name is required');
  const age = Number.parseInt(formData.age, 10);
  if (!Number.isInteger(age) || age < 18 || age > 80) throw new Error('Age must be between 18 and 80');
  const traits = Array.isArray(formData.traits) ? [...new Set(formData.traits)].slice(0, 2) : [];
  if (traits.length !== 2) throw new Error('Choose exactly two traits');
  const seed = String(formData.seed ?? '').trim().toUpperCase() || makeSeed();
  return {
    difficulty,
    startingDate,
    seed,
    character: {
      name,
      age,
      gender: String(formData.gender ?? 'unspecified'),
      backgroundId,
      traits,
      hometown: String(formData.hometown ?? 'Leitian').trim() || 'Leitian',
    },
  };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

export function renderNewGameStep({ step, form }) {
  const f = form ?? {};
  if (step === 0) return `<section class="wizard-step"><p class="eyebrow">1 / 4</p><h2>Difficulty</h2><label><input type="radio" name="difficulty" value="casual" ${f.difficulty === 'casual' ? 'checked' : ''}> Casual</label><label><input type="radio" name="difficulty" value="survival" ${f.difficulty === 'survival' ? 'checked' : ''}> Survival</label><label><input type="radio" name="difficulty" value="permadeath" ${f.difficulty === 'permadeath' ? 'checked' : ''}> Permadeath</label></section>`;
  if (step === 1) return `<section class="wizard-step"><p class="eyebrow">2 / 4</p><h2>World</h2><label>Starting date<select name="startingDate"><option value="day0">Day 0</option><option value="day3">Day 3</option><option value="week2">Week 2</option><option value="month1">Month 1</option><option value="random">Random</option></select></label><label>World seed<input name="seed" value="${esc(f.seed)}" placeholder="HX-XXXX-XXXX"></label><p>Starting region: <strong>Leizhou — Leitian</strong></p></section>`;
  if (step === 2) return `<section class="wizard-step"><p class="eyebrow">3 / 4</p><h2>Character</h2><label>Character name<input name="name" value="${esc(f.name)}" required></label><div class="field-grid"><label>Age<input name="age" type="number" min="18" max="80" value="${esc(f.age ?? 24)}"></label><label>Gender<select name="gender"><option value="male">Male</option><option value="female">Female</option><option value="unspecified">Unspecified</option></select></label></div><label>Background<select name="backgroundId">${[...BACKGROUNDS].map(id => `<option value="${id}">${BACKGROUND_LABELS[id]}</option>`).join('')}</select></label><label>Hometown<input name="hometown" value="${esc(f.hometown ?? 'Leitian')}"></label><fieldset><legend>Choose two traits</legend><label><input type="checkbox" name="traits" value="calm"> Calm</label><label><input type="checkbox" name="traits" value="resourceful"> Resourceful</label><label><input type="checkbox" name="traits" value="anxious"> Anxious</label><label><input type="checkbox" name="traits" value="poor-sleeper"> Poor Sleeper</label></fieldset></section>`;
  return `<section class="wizard-step"><p class="eyebrow">4 / 4</p><h2>Summary</h2><dl><dt>Difficulty</dt><dd>${esc(f.difficulty)}</dd><dt>Starting date</dt><dd>${esc(f.startingDate)}</dd><dt>Seed</dt><dd>${esc(f.seed || 'Generated on Begin')}</dd><dt>Character</dt><dd>${esc(f.name)}</dd><dt>Region</dt><dd>Leizhou — Leitian</dd></dl></section>`;
}

function collect(root, form) {
  const checkedDifficulty = root.querySelector('input[name="difficulty"]:checked');
  if (checkedDifficulty) form.difficulty = checkedDifficulty.value;
  for (const name of ['startingDate', 'seed', 'name', 'age', 'gender', 'backgroundId', 'hometown']) {
    const el = root.querySelector(`[name="${name}"]`);
    if (el) form[name] = el.value;
  }
  const traitEls = [...root.querySelectorAll?.('input[name="traits"]:checked') ?? []];
  if (traitEls.length) form.traits = traitEls.map(el => el.value);
}

export function mountNewGame(root, { onStart }) {
  const state = { step: 0, form: { difficulty: 'survival', startingDate: 'day3', seed: '', name: '', age: 24, gender: 'male', backgroundId: 'civilian', hometown: 'Leitian', traits: ['calm', 'resourceful'] } };
  const draw = () => {
    root.innerHTML = `<section class="menu-card wizard"><button class="ghost" data-action="cancel">← Main menu</button>${renderNewGameStep(state)}<p class="form-error" aria-live="polite"></p><div class="wizard-actions">${state.step > 0 ? '<button data-action="back">Back</button>' : ''}<button data-action="next">${state.step === 3 ? 'Begin' : 'Next'}</button></div></section>`;
    if (state.step === 2) {
      const bg = root.querySelector('[name="backgroundId"]'); if (bg) bg.value = state.form.backgroundId;
      const gender = root.querySelector('[name="gender"]'); if (gender) gender.value = state.form.gender;
      root.querySelectorAll('input[name="traits"]').forEach(el => { el.checked = state.form.traits.includes(el.value); });
    }
    if (state.step === 1) { const date = root.querySelector('[name="startingDate"]'); if (date) date.value = state.form.startingDate; }
  };
  root.addEventListener('click', event => {
    const action = event.target.closest?.('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'back') { collect(root, state.form); state.step--; draw(); return; }
    if (action === 'cancel') { location.reload(); return; }
    if (action === 'next') {
      collect(root, state.form);
      if (state.step < 3) { state.step++; draw(); return; }
      try { onStart(createNewGameConfig(state.form)); }
      catch (error) { root.querySelector('.form-error').textContent = error.message; }
    }
  });
  draw();
}
