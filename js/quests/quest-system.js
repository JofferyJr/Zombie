function rewardResearchNote(state) {
  const shelter = Object.values(state.shelters ?? {})[0];
  if (shelter) {
    let stack = shelter.storage.find(x => x.itemId === 'research-note');
    if (!stack) { stack = { itemId:'research-note', quantity:0 }; shelter.storage.push(stack); }
    stack.quantity++;
  } else {
    state.inventory.items.push({ itemId:'research-note', quantity:1 });
  }
}

export function offerQuest(state, quest) {
  state.quests ??= {};
  if (!state.quests[quest.id]) state.quests[quest.id] = structuredClone(quest);
  return state;
}

export function acceptQuest(state, questId) {
  const quest=state.quests?.[questId]; if(!quest) throw new Error('Quest not found');
  if(quest.status!=='offered') throw new Error('Quest is not available');
  quest.status='active'; return state;
}

export function completeQuestObjective(state, questId, objectiveId) {
  const quest=state.quests?.[questId]; if(!quest || quest.status!=='active') throw new Error('Quest is not active');
  const objective=quest.objectives.find(o=>o.id===objectiveId); if(!objective) throw new Error('Objective not found');
  objective.completed=true;
  if(quest.objectives.every(o=>o.completed)) {
    quest.status='completed';
    if(quest.reward?.craReputation) {
      const cra=state.factions?.['central-restoration-authority']; if(cra) cra.reputation=(cra.reputation??0)+quest.reward.craReputation;
    }
    if(quest.reward?.researchNote) rewardResearchNote(state);
  }
  return state;
}
