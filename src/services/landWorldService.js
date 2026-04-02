import { getData, setData } from './storageService';
import { COLS, ROWS } from '../data/plotsData';

const STORAGE_PREFIX = 'silvertriverse_land_world_v1';
const LAYOUT_PREFIX = 'silvertriverse_land_world_layout_v1';
const VIRTUAL_OWNERSHIP_PREFIX = 'silvertriverse_land_world_virtual_ownership_v1';
const DECOR_PREFIX = 'silvertriverse_land_world_decor_v1';
const LAYOUT_VERSION = 3;
const DECOR_SLOT_COUNT = 4; // front, left, right, towerRing

function keyForUser(userId) {
  return `${STORAGE_PREFIX}_${userId}`;
}

function layoutKeyForUser(userId) {
  return `${LAYOUT_PREFIX}_${userId}`;
}

function virtualOwnershipKeyForUser(userId) {
  return `${VIRTUAL_OWNERSHIP_PREFIX}_${userId}`;
}

function decorKeyForUser(userId) {
  return `${DECOR_PREFIX}_${userId}`;
}

export function getDefaultLandWorldState() {
  return {
    version: 1,
    facadeId: 'cottage',
    wallColor: '#f59e0b',
    roofColor: '#7f1d1d',
    trimColor: '#fcd34d',
    doorStyle: 'single',
    windows: { front: true, left: false, right: false },
    yardProps: { lamp: false, path: false, shrub: false },
    spawn: { x: 0, y: 1.6, z: 7 },
  };
}

export function getLandWorldState(userId) {
  if (!userId) return getDefaultLandWorldState();
  const raw = getData(keyForUser(userId));
  if (!raw || typeof raw !== 'object') return getDefaultLandWorldState();
  const def = getDefaultLandWorldState();
  return {
    ...def,
    ...raw,
    windows: { ...def.windows, ...(raw.windows || {}) },
    yardProps: { ...def.yardProps, ...(raw.yardProps || {}) },
    spawn: { ...def.spawn, ...(raw.spawn || {}) },
  };
}

export function saveLandWorldState(userId, patch) {
  if (!userId) return;
  const prev = getLandWorldState(userId);
  setData(keyForUser(userId), { ...prev, ...patch });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function defaultLayout() {
  const total = COLS * ROWS;
  return {
    version: 1,
    cols: COLS,
    rows: ROWS,
    activePlotIndices: Array.from({ length: total }, (_, i) => i),
    slotToSourceIndex: Object.fromEntries(Array.from({ length: total }, (_, i) => [i, i])),
  };
}

function buildExpandedRandomLayout() {
  const cols = COLS + randomInt(12, 16);
  const rows = ROWS + randomInt(12, 16);
  const total = cols * rows;
  const baseTotal = COLS * ROWS;
  const targetTotalActive = Math.floor(baseTotal * 2.6);
  const activePlotIndices = [];
  const slotToSourceIndex = {};
  const extraSlots = [];

  for (let slot = 0; slot < total; slot++) {
    const row = Math.floor(slot / cols);
    const col = slot % cols;

    // Keep original map area always active and source-linked.
    if (row < ROWS && col < COLS) {
      activePlotIndices.push(slot);
      slotToSourceIndex[slot] = row * COLS + col;
      continue;
    }

    extraSlots.push(slot);
  }

  // Randomly activate just enough extra slots to reach ~2x of base map.
  const neededExtras = Math.min(extraSlots.length, Math.max(0, targetTotalActive - activePlotIndices.length));
  for (let i = extraSlots.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    const tmp = extraSlots[i];
    extraSlots[i] = extraSlots[j];
    extraSlots[j] = tmp;
  }

  for (let i = 0; i < neededExtras; i++) {
    const slot = extraSlots[i];
    activePlotIndices.push(slot);
    slotToSourceIndex[slot] = null;
  }

  return {
    version: LAYOUT_VERSION,
    cols,
    rows,
    activePlotIndices,
    slotToSourceIndex,
  };
}

export function getOrCreateLandWorldLayout(userId) {
  if (!userId) return defaultLayout();
  const key = layoutKeyForUser(userId);
  const existing = getData(key);
  if (
    existing &&
    typeof existing === 'object' &&
    existing.version === LAYOUT_VERSION &&
    existing.cols &&
    existing.rows
  ) {
    return existing;
  }
  const created = buildExpandedRandomLayout();
  setData(key, created);
  return created;
}

export function getVirtualLandWorldOwnership(userId) {
  if (!userId) return {};
  return getData(virtualOwnershipKeyForUser(userId), {}) || {};
}

export function purchaseVirtualLandWorldPlot(userId, ownerName, slotIndex) {
  if (!userId) throw new Error('Invalid user');
  const key = virtualOwnershipKeyForUser(userId);
  const map = getData(key, {}) || {};
  if (map[slotIndex]) throw new Error('Plot already owned');
  map[slotIndex] = {
    ownerId: userId,
    ownerName: ownerName || 'Unknown',
    purchasedAt: Date.now(),
  };
  setData(key, map);
  return { success: true, slotIndex, ownerId: userId, virtual: true };
}

export function getLandWorldDecorMap(userId) {
  if (!userId) return {};
  return getData(decorKeyForUser(userId), {}) || {};
}

function normalizeSlots(slots) {
  const normalized = Array.from({ length: DECOR_SLOT_COUNT }, (_, i) => {
    const v = Array.isArray(slots) ? slots[i] : null;
    return typeof v === 'string' ? v : null;
  });
  return normalized;
}

export function setLandWorldDecorSlots(userId, plotIndex, slots) {
  if (!userId) return;
  const key = decorKeyForUser(userId);
  const map = getData(key, {}) || {};
  const normalized = normalizeSlots(slots);
  map[String(plotIndex)] = normalized;
  setData(key, map);
  return map;
}

export function setLandWorldDecorSlot(userId, plotIndex, slotIndex, collectibleId) {
  const existing = getLandWorldDecorMap(userId);
  const current = normalizeSlots(existing[String(plotIndex)]);
  if (slotIndex < 0 || slotIndex >= DECOR_SLOT_COUNT) return existing;
  current[slotIndex] = collectibleId || null;
  return setLandWorldDecorSlots(userId, plotIndex, current);
}

export function clearLandWorldDecorSlot(userId, plotIndex, slotIndex) {
  return setLandWorldDecorSlot(userId, plotIndex, slotIndex, null);
}

export function moveLandWorldDecorSlot(userId, plotIndex, fromIndex, toIndex) {
  if (fromIndex === toIndex) return getLandWorldDecorMap(userId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= DECOR_SLOT_COUNT || toIndex >= DECOR_SLOT_COUNT) {
    return getLandWorldDecorMap(userId);
  }
  const existing = getLandWorldDecorMap(userId);
  const current = normalizeSlots(existing[String(plotIndex)]);
  const tmp = current[fromIndex];
  current[fromIndex] = current[toIndex];
  current[toIndex] = tmp;
  return setLandWorldDecorSlots(userId, plotIndex, current);
}
