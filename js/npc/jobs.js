const JOBS = new Set(['guard','scavenger','medic','mechanic']);

export function assignJob(state, shelterId, npcId, jobId) {
  if (!JOBS.has(jobId)) throw new Error('Unsupported job');
  const shelter = state.shelters[shelterId]; const npc = state.npcs[npcId];
  if (!shelter || !npc) throw new Error('Shelter or survivor not found');
  if (npc.communityId !== state.player.communityId) throw new Error('Survivor is not in player community');
  for (const [id, job] of Object.entries(shelter.jobs)) if (job.npcId === npcId) delete shelter.jobs[id];
  shelter.jobs[`${jobId}:${npcId}`] = { npcId, jobId };
  npc.jobId = jobId; npc.shelterId = shelterId;
  return state;
}

export function applyShelterJobs(state, shelterId) {
  const shelter = state.shelters[shelterId]; if (!shelter) return state;
  shelter.vehicleMaintenanceUnlocked = false; shelter.medicalRecoveryBonus = false;
  for (const job of Object.values(shelter.jobs)) {
    if (job.jobId === 'guard') shelter.security = Math.min(100, shelter.security + 2);
    if (job.jobId === 'medic') shelter.medicalRecoveryBonus = true;
    if (job.jobId === 'mechanic') shelter.vehicleMaintenanceUnlocked = true;
    if (job.jobId === 'scavenger' && state.world?.day && shelter.lastScavengeDay !== state.world.day) {
      shelter.resources.materials = (shelter.resources.materials ?? 0) + 1;
      shelter.lastScavengeDay = state.world.day;
    }
  }
  return state;
}
