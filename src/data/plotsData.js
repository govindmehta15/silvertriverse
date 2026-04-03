export const COLS = 25;
export const ROWS = 25;
export const TOTAL_PLOTS = COLS * ROWS;
export const MIN_PLOT_PRICE = 500;
export const MAX_PLOT_PRICE = 1000;
// Kept for backward compatibility in older screens.
export const PRICE_PER_PLOT = MIN_PLOT_PRICE;

function clamp01(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Linear dynamic price model from 500 → 1000 based on world fill ratio.
 * @param {number} fillRatio value in [0..1]
 */
export function getPlotPriceByFillRatio(fillRatio) {
  const ratio = clamp01(Number(fillRatio) || 0);
  return Math.round(MIN_PLOT_PRICE + ((MAX_PLOT_PRICE - MIN_PLOT_PRICE) * ratio));
}

/**
 * Price for the next plot purchase based on current ownership progress.
 * @param {number} ownedCount number of currently owned plots
 * @param {number} totalPlots total plots in that world
 */
export function getCurrentPlotPrice(ownedCount, totalPlots = TOTAL_PLOTS) {
  const total = Math.max(1, Number(totalPlots) || TOTAL_PLOTS);
  const owned = Math.max(0, Number(ownedCount) || 0);
  const ratio = owned / total;
  return getPlotPriceByFillRatio(ratio);
}

export function indexToRowCol(index) {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  return { row, col };
}

export function rowColToIndex(row, col) {
  return row * COLS + col;
}
