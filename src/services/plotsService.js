import { getData, setData, updateData, simulateApi } from './storageService';
import { TOTAL_PLOTS, getCurrentPlotPrice, indexToRowCol, rowColToIndex } from '../data/plotsData';
import { getPremiumThemeForPlotCount } from '../data/profileThemes';

const THEME_KEY_PREFIX = 'silvertriverse_profile_theme_';

const OWNERSHIP_KEY = 'silvertriverse_plots_ownership';

function getOwnershipList() {
  return getData(OWNERSHIP_KEY, []);
}

export const plotsService = {
  getPlotByIndex(index) {
    return simulateApi(() => {
      const list = getOwnershipList();
      const record = list.find((r) => r.plotIndex === index);
      const { row, col } = indexToRowCol(index);
      return {
        id: `plot_${index}`,
        index,
        row,
        col,
        ownerId: record?.ownerId ?? null,
        ownerName: record?.ownerName ?? null,
        price: getCurrentPlotPrice(list.length, TOTAL_PLOTS),
      };
    });
  },

  getPlot(row, col) {
    const index = rowColToIndex(row, col);
    return this.getPlotByIndex(index);
  },

  getOwnedPlots(userId) {
    return simulateApi(() => {
      const list = getOwnershipList();
      return list.filter((r) => r.ownerId === userId).map((r) => r.plotIndex);
    });
  },

  getAllOwnership() {
    return simulateApi(() => this.getOwnershipMapSync());
  },

  /** Sync read for instant grid load (no simulated delay). */
  getOwnershipMapSync() {
    const list = getOwnershipList();
    const map = {};
    if (Array.isArray(list)) {
      list.forEach((r) => {
        if (r && typeof r.plotIndex === 'number') {
          map[r.plotIndex] = { ownerId: r.ownerId, ownerName: r.ownerName };
        }
      });
    }
    return map;
  },

  purchasePlot(userId, ownerName, plotIndex) {
    return simulateApi(() => {
      const list = getOwnershipList();
      const taken = list.some((r) => r.plotIndex === plotIndex);
      if (taken) throw new Error('Plot already owned');
      if (plotIndex < 0 || plotIndex >= TOTAL_PLOTS) throw new Error('Invalid plot');
      const purchasePrice = getCurrentPlotPrice(list.length, TOTAL_PLOTS);
      const newRecord = {
        plotIndex,
        ownerId: userId,
        ownerName: ownerName || 'Unknown',
        purchasedAt: Date.now(),
      };
      const newList = Array.isArray(list) ? [...list, newRecord] : [newRecord];
      updateData(OWNERSHIP_KEY, () => newList, []);

      const ownedCount = newList.filter((r) => r.ownerId === userId).length;
      const themeId = getPremiumThemeForPlotCount(ownedCount);
      if (themeId) {
        const themeKey = THEME_KEY_PREFIX + userId;
        setData(themeKey, themeId);
      }

      return { success: true, plotIndex, ownerId: userId, themeAssigned: !!themeId, purchasePrice };
    });
  },
};
