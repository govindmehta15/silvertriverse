// Canonical module for collectible-units film/token data (re-exports + clearer names).
export {
  fcuFilms as collectibleUnitsFilms,
  FCU_PHASES as COLLECTIBLE_UNITS_PHASES,
  formatPrice,
  formatLargePrice,
} from './fcuData';

// Backward-compatible re-exports
export * from './fcuData';
