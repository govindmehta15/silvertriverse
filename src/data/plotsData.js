export const COLS = 24;
export const ROWS = 24;
export const TOTAL_PLOTS = COLS * ROWS;
export const PRICE_PER_PLOT = 200;

export function indexToRowCol(index) {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  return { row, col };
}

export function rowColToIndex(row, col) {
  return row * COLS + col;
}
