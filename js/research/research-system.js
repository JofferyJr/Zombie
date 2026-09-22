function hasResearchNote(state) {
  return Object.values(state.shelters ?? {}).some(s=>s.storage?.some(x=>x.itemId==='research-note' && x.quantity>0));
}

export function startResearch(state, projectId) {
  if(projectId!=='infection-observation-1') throw new Error('Unknown research project');
  if(!hasResearchNote(state)) throw new Error('A research note in shelter storage is required');
  state.research ??= {};
  state.research.active={id:projectId,elapsedMinutes:0,durationMinutes:360,status:'active'};
  return state;
}

export function advanceResearch(state, elapsedMinutes) {
  const project=state.research?.active; if(!project || project.status!=='active') return state;
  project.elapsedMinutes+=Math.max(0,elapsedMinutes);
  if(project.elapsedMinutes>=project.durationMinutes){project.elapsedMinutes=project.durationMinutes;project.status='completed';state.research.infectionObservationUnlocked=true;}
  return state;
}
