import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { plotsService } from '../services/plotsService';
import { PRICE_PER_PLOT, COLS, ROWS, indexToRowCol, rowColToIndex } from '../data/plotsData';

const CELL_SIZE = 8;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;

export default function LandMarketplacePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ownershipMap, setOwnershipMap] = useState({});
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const loadOwnership = useCallback(async () => {
    const res = await plotsService.getAllOwnership();
    if (res.success && res.data) setOwnershipMap(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOwnership();
  }, [loadOwnership]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s + delta)));
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('[data-plot]')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handlePlotClick = (e, index) => {
    e.stopPropagation();
    const { row, col } = indexToRowCol(index);
    const owner = ownershipMap[index];
    setSelectedPlot({
      index,
      row,
      col,
      ownerId: owner?.ownerId ?? null,
      ownerName: owner?.ownerName ?? null,
    });
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) return;
    setPurchasing(true);
    const res = await plotsService.purchasePlot(user.id, user.name, selectedPlot.index);
    setPurchasing(false);
    if (res.success) {
      await loadOwnership();
      setSelectedPlot(null);
    }
  };

  const myPlotCount = ownershipMap
    ? Object.entries(ownershipMap).filter(([, v]) => v.ownerId === user?.id).length
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Land Marketplace</h1>
            <p className="text-gray-400 text-sm mt-1">
              Virtual plots · ₹{PRICE_PER_PLOT} per plot · Own at least one to unlock premium profile themes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-navy-800/80 border border-navy-600 text-gray-300 text-sm">
              Your plots: <strong className="text-gold">{myPlotCount}</strong>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(MAX_ZOOM, s + 0.25))}
                className="w-9 h-9 rounded-lg bg-navy-800 border border-navy-600 text-white hover:border-gold/40 flex items-center justify-center"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(MIN_ZOOM, s - 0.25))}
                className="w-9 h-9 rounded-lg bg-navy-800 border border-navy-600 text-white hover:border-gold/40 flex items-center justify-center"
              >
                −
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-navy-600 border border-navy-500" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gold/30 border border-gold/50" /> Owned
          </span>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border border-navy-600/50 bg-navy-950"
          style={{ height: '70vmin', minHeight: 320, maxHeight: 560 }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading grid…</div>
          ) : (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                  width: COLS * CELL_SIZE,
                  height: ROWS * CELL_SIZE,
                }}
              >
                {Array.from({ length: COLS * ROWS }, (_, index) => {
                  const owner = ownershipMap[index];
                  const isOwned = !!owner;
                  const isMine = owner?.ownerId === user?.id;
                  return (
                    <button
                      key={index}
                      type="button"
                      data-plot
                      onClick={(e) => handlePlotClick(e, index)}
                      className={`min-w-0 min-h-0 p-0 border border-transparent rounded-sm transition-colors hover:ring-1 hover:ring-white/30 ${
                        isOwned ? (isMine ? 'bg-gold/40 border-gold/50' : 'bg-navy-600/80 border-navy-500/50') : 'bg-navy-700/60 border-navy-600/50 hover:bg-navy-600'
                      }`}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      title={`Plot ${index}${isOwned ? ` · ${owner.ownerName}` : ' · Available'}`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-2">Scroll to zoom · Drag to pan · Click a plot to purchase or view profile</p>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-900 border border-navy-600 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-serif text-lg font-bold text-white mb-1">
                Plot #{selectedPlot.index}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Row {selectedPlot.row + 1}, Col {selectedPlot.col + 1}
              </p>

              {selectedPlot.ownerId ? (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Owned by <strong className="text-white">{selectedPlot.ownerName}</strong></p>
                  <button
                    type="button"
                    onClick={() => {
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
                className="mt-4 w-full py-2 rounded-lg border border-navy-600 text-gray-400 hover:text-white"
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
