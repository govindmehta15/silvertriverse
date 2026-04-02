/**
 * World layout adapter — private yard MVP; neighborhood mode can extend this API later.
 */

export const WORLD_MODES = /** @type {const} */ ({
  PRIVATE_YARD: 'privateYard',
  /** Future: grid of plots from plotsData */
  NEIGHBORHOOD: 'neighborhood',
});

/**
 * @param {typeof WORLD_MODES[keyof typeof WORLD_MODES} mode
 */
export function getWorldLayout(mode) {
  if (mode === WORLD_MODES.NEIGHBORHOOD) {
    return {
      mode,
      /** @deprecated Not implemented in MVP */
      plotCells: [],
      bounds: { halfExtent: 24, center: [0, 0, 0] },
    };
  }

  return {
    mode: WORLD_MODES.PRIVATE_YARD,
    plotCells: [{ id: 'home', center: [0, 0, -2], halfSize: [5, 0, 4] }],
    bounds: { halfExtent: 12, center: [0, 0, 0] },
    homePosition: [0, 0, -4],
  };
}
