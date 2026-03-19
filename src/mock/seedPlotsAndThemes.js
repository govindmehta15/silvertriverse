import { getData, setData } from '../utils/storageService';
import { mockUsers } from './mockUsers';

const MOCK_THEMES = {
  u1: 'gold-luxe',
  u2: 'emerald-sovereign',
  u3: 'violet-crown',
  u4: 'crimson-legacy',
};

const MOCK_PLOT_ASSIGNMENTS = [
  { plotIndex: 0, ownerId: 'u1', ownerName: 'Natalie Portman' },
  { plotIndex: 1, ownerId: 'u1', ownerName: 'Natalie Portman' },
  { plotIndex: 100, ownerId: 'u1', ownerName: 'Natalie Portman' },
  { plotIndex: 101, ownerId: 'u1', ownerName: 'Natalie Portman' },
  { plotIndex: 10, ownerId: 'u2', ownerName: 'Elias Vance' },
  { plotIndex: 11, ownerId: 'u2', ownerName: 'Elias Vance' },
  { plotIndex: 200, ownerId: 'u2', ownerName: 'Elias Vance' },
  { plotIndex: 201, ownerId: 'u2', ownerName: 'Elias Vance' },
  { plotIndex: 20, ownerId: 'u3', ownerName: 'Sarah Jenkins' },
  { plotIndex: 21, ownerId: 'u3', ownerName: 'Sarah Jenkins' },
  { plotIndex: 300, ownerId: 'u3', ownerName: 'Sarah Jenkins' },
  { plotIndex: 30, ownerId: 'u4', ownerName: 'Marcus Thorne' },
  { plotIndex: 31, ownerId: 'u4', ownerName: 'Marcus Thorne' },
  { plotIndex: 400, ownerId: 'u4', ownerName: 'Marcus Thorne' },
];

const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000;

export function seedPlotsAndThemes() {
  const existing = getData('silvertriverse_plots_ownership');
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    const records = MOCK_PLOT_ASSIGNMENTS.map((r, i) => ({
      ...r,
      purchasedAt: baseTime + i * 60 * 60 * 1000,
    }));
    setData('silvertriverse_plots_ownership', records);
  }

  mockUsers.forEach((u) => {
    const themeKey = `silvertriverse_profile_theme_${u.id}`;
    if (getData(themeKey) == null) {
      setData(themeKey, MOCK_THEMES[u.id] || 'default');
    }
  });
}
