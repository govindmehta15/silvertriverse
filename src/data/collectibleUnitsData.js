// Canonical collectible-units catalog: film (legacy fcuData), sports, and brand sub-units.
import { fcuFilms } from './fcuData';
import { sportsCollectibleUnits } from './sportsCollectibleUnitsData';
import { brandCollectibleUnits } from './brandCollectibleUnitsData';

export {
  fcuFilms as collectibleUnitsFilms,
  FCU_PHASES as COLLECTIBLE_UNITS_PHASES,
  formatPrice,
  formatLargePrice,
} from './fcuData';

export { sportsCollectibleUnits, brandCollectibleUnits };

/** URL segment and tab key */
export const COLLECTIBLE_UNIT_CATEGORIES = ['film', 'sports', 'brand'];

/**
 * @param {'film'|'sports'|'brand'} category
 * @param {string|number} id
 * @returns {object|null}
 */
export function getCollectibleUnit(category, id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  switch (category) {
    case 'film':
      return fcuFilms.find((c) => c.id === num) ?? null;
    case 'sports':
      return sportsCollectibleUnits.find((c) => c.id === num) ?? null;
    case 'brand':
      return brandCollectibleUnits.find((c) => c.id === num) ?? null;
    default:
      return null;
  }
}

export function isValidCollectibleCategory(category) {
  return COLLECTIBLE_UNIT_CATEGORIES.includes(category);
}

// Backward-compatible re-exports from legacy film dataset
export * from './fcuData';
