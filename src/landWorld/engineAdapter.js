export const ENGINE_TYPES = {
  WEB_R3F: 'web-r3f',
  UNITY: 'unity',
  UNREAL: 'unreal',
};

export function getEngineProfile(engineType = ENGINE_TYPES.WEB_R3F) {
  if (engineType === ENGINE_TYPES.UNITY) {
    return {
      id: ENGINE_TYPES.UNITY,
      label: 'Unity bridge',
      movementModel: 'firstPerson',
      transport: 'postMessage',
    };
  }

  if (engineType === ENGINE_TYPES.UNREAL) {
    return {
      id: ENGINE_TYPES.UNREAL,
      label: 'Unreal bridge',
      movementModel: 'firstPerson',
      transport: 'postMessage',
    };
  }

  return {
    id: ENGINE_TYPES.WEB_R3F,
    label: 'Web R3F runtime',
    movementModel: 'firstPerson',
    transport: 'direct',
  };
}

/**
 * Normalized payload shape for future Unity/Unreal sync.
 */
export function createEnginePayload({ userId, design, spawn, unlocks }) {
  return {
    version: 1,
    userId,
    design,
    spawn,
    unlocks: {
      plotCount: unlocks.plotCount,
      cardCount: unlocks.cardCount,
    },
  };
}
