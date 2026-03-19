import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { plotsService } from '../services/plotsService';
import { getData } from '../utils/storageService';
import { PRICE_PER_PLOT, COLS, ROWS, indexToRowCol } from '../data/plotsData';
import { mockUsers } from '../mock/mockUsers';
import Land3D from '../components/Land3D';

// Keep grid small for performance (e.g. 32x32 = 1024 cells)
const CELL_PX = 12;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.5;

function getTierLabel(count) {
  if (count >= 10) return 'Tycoon';
  if (count >= 5) return 'Collector';
  if (count >= 1) return 'Landholder';
  return null;
}

export default function LandMarketplacePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ownershipMap, setOwnershipMap] = useState({});
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [scale, setScale] = useState(0.85);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const usersById = useMemo(() => {
    const saved = getData('users');
    const all = (saved && saved.length > 0) ? saved : mockUsers;
    return all.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
  }, []);

  const loadOwnership = useCallback(() => {
    try {
      const map = plotsService.getOwnershipMapSync();
      setOwnershipMap(map || {});
    } catch (err) {
      console.error('Land: load ownership failed', err);
      setOwnershipMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadOwnership();
  }, [loadOwnership]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setScale((s) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s + delta)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handlePlotClick = (index) => {
    const { row, col } = indexToRowCol(index);
    const owner = ownershipMap[index];
    const ownerUser = owner ? usersById[owner.ownerId] : null;
    setSelectedPlot({
      index,
      row,
      col,
      ownerId: owner?.ownerId ?? null,
      ownerName: owner?.ownerName ?? null,
      ownerAvatar: ownerUser?.avatar ?? null,
    });
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) return;
    setPurchasing(true);
    const res = await plotsService.purchasePlot(user.id, user.name, selectedPlot.index);
    setPurchasing(false);
    if (res.success) {
      loadOwnership();
      setSelectedPlot(null);
    }
  };

  const myPlotCount = useMemo(
    () => Object.entries(ownershipMap).filter(([, v]) => v.ownerId === user?.id).length,
    [ownershipMap, user?.id]
  );


  const tierLabel = getTierLabel(myPlotCount);


  const totalCells = COLS * ROWS;

  return (
    <div className="min-h-screen pb-24 relative -mt-4 md:-mt-6">
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-white">Land Marketplace</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              ₹{PRICE_PER_PLOT} per plot · Own a plot to unlock premium profile themes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-navy-800/80 border border-navy-600 text-gray-300 text-sm">
              Your plots: <strong className="text-gold">{myPlotCount}</strong>
            </span>
            {tierLabel && (
              <span className="px-2.5 py-1 rounded-lg bg-gold/15 border border-gold/40 text-gold text-xs font-bold uppercase">
                {tierLabel}
              </span>
            )}
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(MAX_ZOOM, s + 0.15))}
                className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-600 text-white hover:border-gold/40 flex items-center justify-center text-sm"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(MIN_ZOOM, s - 0.15))}
                className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-600 text-white hover:border-gold/40 flex items-center justify-center text-sm"
              >
                −
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-navy-600 border border-navy-500" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-gold/40 border border-gold/50" /> Owned
          </span>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border border-navy-600/50 bg-navy-950 select-none shadow-2xl"
          style={{ height: 'min(75vmin, 580px)', minHeight: 400 }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              Loading…
            </div>
          ) : (
            <Land3D
              ownershipMap={ownershipMap}
              user={user}
              onPlotClick={handlePlotClick}
              selectedPlotIndex={selectedPlot?.index}
            />
          )}
        </div>
        <p className="text-gray-500 text-xs mt-2 italic">Navigate: Right-click/Drag to rotate · Zoom: Scroll · Click a plot to view details</p>
      </div>

      <AnimatePresence>
        {selectedPlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedPlot(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-900 border border-navy-600 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-serif text-lg font-bold text-white mb-1">Plot #{selectedPlot.index}</h3>
              <p className="text-gray-500 text-sm mb-4">
                Row {selectedPlot.row + 1}, Col {selectedPlot.col + 1}
              </p>

              {selectedPlot.ownerId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gold/40 bg-navy-800 shrink-0 flex items-center justify-center text-gold font-bold text-xl">
                      {selectedPlot.ownerAvatar ? (
                        <img src={selectedPlot.ownerAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        selectedPlot.ownerName?.trim().charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Owned by</p>
                      <p className="font-serif font-bold text-white text-lg">{selectedPlot.ownerName}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Visit their profile to see their theme and collection.</p>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Diagnostic: Navigating to profile for ownerId=', selectedPlot.ownerId);
                      setSelectedPlot(null);
                      navigate(`/profile?user=${selectedPlot.ownerId}`);
                    }}
                    className="w-full py-2.5 rounded-lg bg-gold/20 border border-gold/40 text-gold font-medium hover:bg-gold/30"
                  >
                    View profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Available for purchase</p>
                  <p className="text-gold font-serif text-xl font-bold">₹{PRICE_PER_PLOT}</p>
                  {!isAuthenticated ? (
                    <p className="text-gray-500 text-sm">Log in to purchase a plot.</p>
                  ) : (
                    <button
                      type="button"
                      disabled={purchasing}
                      onClick={handlePurchase}
                      className="w-full py-2.5 rounded-lg bg-gold/20 border border-gold/40 text-gold font-medium hover:bg-gold/30 disabled:opacity-50"
                    >
                      {purchasing ? 'Purchasing…' : 'Purchase (mock)'}
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedPlot(null)}
                className="mt-4 w-full py-2 rounded-lg border border-navy-600 text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
