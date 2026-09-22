export function createInitialGameState({ seed, difficulty, startingDate, character }) {
  return {
    meta: { version: 1, seed, difficulty, createdAt: new Date().toISOString() },
    world: {
      regionId: 'leizhou', cityId: 'leitian', districtId: 'northern-suburbs',
      startingDate, minutes: 8 * 60, day: 1, weather: 'cloudy',
      containers: {}, radioLog: [], threats: {}, blockedRoutes: [], lastRegionalTickMinute: 0,
    },
    player: {
      id: 'player', name: character.name, backgroundId: character.backgroundId,
      age: character.age ?? 24, gender: character.gender ?? 'unspecified', traits: character.traits ?? [], hometown: character.hometown ?? 'Leitian',
      health: 100, stamina: 100, hunger: 0, thirst: 0, infection: 0, x: 320, y: 240, communityId: 'player-community', vehicleId: null,
    },
    inventory: { capacity: 24, weightLimit: 20, items: [] },
    shelters: {}, npcs: {}, zombies: {}, vehicles: {}, factions: {}, quests: {}, research: {},
    flags: { tacticalPaused: false }, tactical: { selectedActorId: 'player', orders: [] },
  };
}

export function assertSerializableGameState(state) {
  let decoded;
  try {
    decoded = JSON.parse(JSON.stringify(state));
  } catch (error) {
    throw new Error(`Game state is not serializable: ${error.message}`);
  }
  if (!decoded?.meta?.version || !decoded?.world || !decoded?.player) {
    throw new Error('Invalid serializable game state');
  }
  return true;
}
