/**
 * Read-only unlock rules for Land World (independent from Land marketplace UI).
 * Uses plot count + collectible card count to mirror progression tiers conceptually.
 */

/** @typedef {{
 *   version: number;
 *   facadeId: string;
 *   wallColor: string;
 *   roofColor: string;
 *   trimColor: string;
 *   doorStyle: string;
 *   windows: { front: boolean; left: boolean; right: boolean };
 *   yardProps: { lamp: boolean; path: boolean; shrub: boolean };
 *   spawn: { x: number; y: number; z: number };
 * }} LandWorldDesignState */

export const FACADE_OPTIONS = [
  { id: 'cottage', label: 'Classic Cottage', minPlots: 0, minCards: 0 },
  { id: 'modern', label: 'Modern Villa', minPlots: 1, minCards: 0 },
  { id: 'pagoda', label: 'Pagoda', minPlots: 3, minCards: 0 },
  { id: 'tower', label: 'Crystal Tower', minPlots: 0, minCards: 1 },
  { id: 'floating', label: 'Floating Cube', minPlots: 0, minCards: 5 },
  { id: 'cosmic', label: 'Cosmic Pyramid', minPlots: 0, minCards: 10 },
];

export const DOOR_OPTIONS = [
  { id: 'single', label: 'Single door', minPlots: 0, minCards: 0 },
  { id: 'double', label: 'Double door', minPlots: 1, minCards: 0 },
  { id: 'arched', label: 'Arched entry', minPlots: 0, minCards: 5 },
];

const WINDOW_SLOTS = [
  { key: 'front', label: 'Front bay', minPlots: 0, minCards: 0 },
  { key: 'left', label: 'Left windows', minPlots: 0, minCards: 1 },
  { key: 'right', label: 'Right windows', minPlots: 0, minCards: 3 },
];

const YARD_PROP_DEFS = [
  { key: 'lamp', label: 'Path lamp', minPlots: 0, minCards: 1 },
  { key: 'path', label: 'Stone path', minPlots: 0, minCards: 3 },
  { key: 'shrub', label: 'Garden shrubs', minPlots: 0, minCards: 5 },
];

/**
 * @param {{ plotCount: number; cardCount: number }} input
 */
export function getUnlockContext(input) {
  const { plotCount, cardCount } = input;
  return { plotCount, cardCount };
}

function meetsRequirement(minPlots, minCards, plotCount, cardCount) {
  return plotCount >= minPlots && cardCount >= minCards;
}

/**
 * @param {{ plotCount: number; cardCount: number }} ctx
 */
export function resolveFacadeUnlocks(ctx) {
  const { plotCount, cardCount } = ctx;
  return FACADE_OPTIONS.map((o) => ({
    ...o,
    locked: !meetsRequirement(o.minPlots, o.minCards, plotCount, cardCount),
    lockReason:
      !meetsRequirement(o.minPlots, o.minCards, plotCount, cardCount)
        ? `Need ${o.minPlots > 0 ? `${o.minPlots}+ plots` : ''}${o.minPlots > 0 && o.minCards > 0 ? ' · ' : ''}${o.minCards > 0 ? `${o.minCards}+ cards` : ''}`.trim() || 'Locked'
        : null,
  }));
}

/**
 * @param {{ plotCount: number; cardCount: number }} ctx
 */
export function resolveDoorUnlocks(ctx) {
  const { plotCount, cardCount } = ctx;
  return DOOR_OPTIONS.map((o) => ({
    ...o,
    locked: !meetsRequirement(o.minPlots, o.minCards, plotCount, cardCount),
    lockReason: !meetsRequirement(o.minPlots, o.minCards, plotCount, cardCount)
      ? `Requires ${o.minPlots}+ plots or ${o.minCards}+ cards where listed`
      : null,
  }));
}

/**
 * @param {{ plotCount: number; cardCount: number }} ctx
 */
export function resolveWindowSlots(ctx) {
  const { plotCount, cardCount } = ctx;
  return WINDOW_SLOTS.map((s) => ({
    ...s,
    locked: !meetsRequirement(s.minPlots, s.minCards, plotCount, cardCount),
  }));
}

/**
 * @param {{ plotCount: number; cardCount: number }} ctx
 */
export function resolveYardProps(ctx) {
  const { plotCount, cardCount } = ctx;
  return YARD_PROP_DEFS.map((p) => ({
    ...p,
    locked: !meetsRequirement(p.minPlots, p.minCards, plotCount, cardCount),
  }));
}

/**
 * If saved design references locked options, coerce to nearest allowed defaults.
 * @param {LandWorldDesignState} state
 * @param {{ plotCount: number; cardCount: number }} ctx
 * @returns {LandWorldDesignState}
 */
export function coerceDesignToUnlocks(state, ctx) {
  const facades = resolveFacadeUnlocks(ctx);
  const doors = resolveDoorUnlocks(ctx);
  const windows = resolveWindowSlots(ctx);
  const yard = resolveYardProps(ctx);

  let facadeId = state.facadeId;
  const f = facades.find((x) => x.id === facadeId);
  if (!f || f.locked) {
    facadeId = facades.find((x) => !x.locked)?.id ?? 'cottage';
  }

  let doorStyle = state.doorStyle;
  const d = doors.find((x) => x.id === doorStyle);
  if (!d || d.locked) {
    doorStyle = doors.find((x) => !x.locked)?.id ?? 'single';
  }

  const win = { ...state.windows };
  windows.forEach((slot) => {
    if (slot.locked) win[slot.key] = false;
  });

  const yp = { ...state.yardProps };
  yard.forEach((p) => {
    if (p.locked) yp[p.key] = false;
  });

  return {
    ...state,
    facadeId,
    doorStyle,
    windows: win,
    yardProps: yp,
  };
}
