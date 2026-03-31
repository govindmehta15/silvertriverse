import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { plotsService } from '../services/plotsService';
import { getData } from '../utils/storageService';
import { PRICE_PER_PLOT, COLS, ROWS, indexToRowCol } from '../data/plotsData';
import { mockUsers } from '../mock/mockUsers';
import Land3D from '../components/Land3D';

const CELL_PX = 12;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.5;

function getTierLabel(count) {
  if (count >= 10) return { label: 'Tycoon', color: '#f59e0b', emoji: '🏆' };
  if (count >= 5)  return { label: 'Collector', color: '#06b6d4', emoji: '💎' };
  if (count >= 1)  return { label: 'Landholder', color: '#22c55e', emoji: '🗺️' };
  return null;
}

// House type legend data
const HOUSE_LEGEND = [
  { emoji: '🏡', name: 'Classic Cottage',  desc: 'Default',         color: '#f59e0b' },
  { emoji: '🏢', name: 'Modern Villa',     desc: 'Default (alt)',    color: '#3b82f6' },
  { emoji: '🔮', name: 'Crystal Tower',    desc: '1+ cards',         color: '#06b6d4' },
  { emoji: '⛩️', name: 'Pagoda',           desc: '3+ cards',         color: '#ef4444' },
  { emoji: '🚀', name: 'Floating Cube',    desc: '5+ cards',         color: '#8b5cf6' },
  { emoji: '🌌', name: 'Cosmic Pyramid',   desc: '10+ cards',        color: '#f97316' },
];

export default function LandMarketplacePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ownershipMap, setOwnershipMap] = useState({});
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [scale, setScale] = useState(0.85);
  const [legendOpen, setLegendOpen] = useState(false);

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

  const handlePlotClick = (index) => {
    const { row, col } = indexToRowCol(index);
    const owner = ownershipMap[index];
    const ownerUser = owner ? usersById[owner.ownerId] : null;
    setSelectedPlot({
      index, row, col,
      ownerId: owner?.ownerId ?? null,
      ownerName: owner?.ownerName ?? null,
      ownerAvatar: ownerUser?.avatar ?? null,
      ownerCardCount: ownerUser?.ownedCards?.length ?? 0,
    });
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) return;
    setPurchasing(true);
    const res = await plotsService.purchasePlot(user.id, user.name, selectedPlot.index);
    setPurchasing(false);
    if (res.success) { loadOwnership(); setSelectedPlot(null); }
  };

  const myPlotCount = useMemo(
    () => Object.entries(ownershipMap).filter(([, v]) => v.ownerId === user?.id).length,
    [ownershipMap, user?.id]
  );
  const myCardCount = user ? (usersById[user.id]?.ownedCards?.length ?? 0) : 0;
  const tierInfo = getTierLabel(myPlotCount);
  const totalOwned = Object.keys(ownershipMap).length;
  const totalCells = COLS * ROWS;

  return (
    <div className="min-h-screen pb-24 relative -mt-4 md:-mt-6 overflow-hidden">

      {/* ── Animated gradient background ────────────────────────────────── */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0f0c29, #1a1040, #302b63, #24243e)',
          backgroundSize: '400% 400%',
          animation: 'landBgShift 14s ease infinite',
        }}
      />
      {/* Glow orbs */}
      <div className="absolute -z-10 top-[-60px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
      <div className="absolute -z-10 bottom-[40px] right-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)' }} />
      <div className="absolute -z-10 top-[30%] right-[20%] w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)' }} />

      <style>{`
        @keyframes landBgShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0%   { opacity: 0.6; }
          50%  { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 pt-5 pb-4">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-wide"
              style={{ textShadow: '0 0 24px rgba(139,92,246,0.5)' }}>
              ✦ Land Marketplace
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              ₹{PRICE_PER_PLOT} per plot · Own land to unlock premium profile themes
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tierInfo && (
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
                style={{
                  color: tierInfo.color,
                  borderColor: tierInfo.color + '60',
                  background: tierInfo.color + '18',
                  boxShadow: `0 0 12px ${tierInfo.color}40`,
                  animation: 'shimmer 2.4s ease-in-out infinite',
                }}
              >
                {tierInfo.emoji} {tierInfo.label}
              </motion.span>
            )}
            <span className="px-3 py-1.5 rounded-xl text-sm border"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0' }}>
              My Plots: <strong style={{ color: '#fcd34d' }}>{myPlotCount}</strong>
            </span>
            <div className="flex gap-0.5">
              <button type="button"
                onClick={() => setScale((s) => Math.min(MAX_ZOOM, s + 0.15))}
                className="w-8 h-8 rounded-lg border text-white flex items-center justify-center text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
                +
              </button>
              <button type="button"
                onClick={() => setScale((s) => Math.max(MIN_ZOOM, s - 0.15))}
                className="w-8 h-8 rounded-lg border text-white flex items-center justify-center text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
                −
              </button>
            </div>
          </div>
        </div>

        {/* ── My Estate Strip ────────────────────────────────── */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl border px-5 py-3 flex flex-wrap gap-5 items-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.10))',
              borderColor: 'rgba(139,92,246,0.3)',
              boxShadow: '0 0 24px rgba(139,92,246,0.12)',
            }}
          >
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">My Plots</p>
              <p className="font-mono text-xl font-bold text-yellow-300">{myPlotCount}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">My Cards</p>
              <p className="font-mono text-xl font-bold text-cyan-300">{myCardCount}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">House Type</p>
              <p className="font-mono text-sm font-bold text-violet-300">
                {myCardCount >= 10 ? '🌌 Cosmic Pyramid'
                  : myCardCount >= 5 ? '🚀 Floating Cube'
                  : myCardCount >= 3 ? '⛩️ Pagoda'
                  : myCardCount >= 1 ? '🔮 Crystal Tower'
                  : myPlotCount % 2 === 0 ? '🏡 Cottage' : '🏢 Villa'}
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">World Fill</p>
              <p className="font-mono text-sm font-bold text-emerald-300">
                {((totalOwned / totalCells) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Legend toggle */}
            <button type="button"
              onClick={() => setLegendOpen(v => !v)}
              className="ml-auto text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all"
              style={{
                color: legendOpen ? '#fcd34d' : '#94a3b8',
                borderColor: legendOpen ? 'rgba(252,211,77,0.4)' : 'rgba(255,255,255,0.12)',
                background: legendOpen ? 'rgba(252,211,77,0.08)' : 'rgba(255,255,255,0.04)',
              }}>
              {legendOpen ? '✕ Close' : '🏠 House Guide'}
            </button>
          </motion.div>
        )}

        {/* ── House Type Legend ──────────────────────────────── */}
        <AnimatePresence>
          {legendOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="rounded-2xl border px-5 py-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,12,41,0.95), rgba(36,36,62,0.95))',
                  borderColor: 'rgba(139,92,246,0.25)',
                  backdropFilter: 'blur(12px)',
                }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">House Designs — Unlocked by Cards</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {HOUSE_LEGEND.map((h) => (
                    <div key={h.name} className="flex items-center gap-2.5 p-2.5 rounded-xl border"
                      style={{ borderColor: h.color + '30', background: h.color + '0a' }}>
                      <span className="text-2xl">{h.emoji}</span>
                      <div>
                        <p className="text-white text-xs font-bold">{h.name}</p>
                        <p className="text-[10px]" style={{ color: h.color }}>{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-gray-600 italic">
                  House color reflects the owner's chosen profile theme. Colors change when the owner updates their theme.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mini Legend dots ───────────────────────────────── */}
        <div className="flex gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ background: '#1e293b', border: '1px solid #334155' }} />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(245,158,11,0.35)', border: '1px solid rgba(245,158,11,0.5)' }} />
            Owned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(245,158,11,0.9)', border: '1px solid rgba(245,158,11,0.9)' }} />
            Mine
          </span>
        </div>

        {/* ── 3-D Canvas ─────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl select-none"
          style={{
            height: 'min(75vmin, 580px)',
            minHeight: 400,
            boxShadow: '0 0 60px rgba(139,92,246,0.25), 0 0 120px rgba(6,182,212,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm"
              style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1040)' }}>
              <span className="animate-pulse">Loading world…</span>
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
        <p className="text-gray-600 text-xs mt-2 italic">
          🖱 Drag to rotate · Scroll to zoom · Click a plot for details
        </p>
      </div>

      {/* ── Plot detail modal ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedPlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedPlot(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-sm w-full shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #0f0c29, #1a1040)',
                border: '1px solid rgba(139,92,246,0.35)',
                boxShadow: '0 0 40px rgba(139,92,246,0.25)',
              }}
            >
              <h3 className="font-serif text-lg font-bold text-white mb-0.5">
                Plot #{selectedPlot.index}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Row {selectedPlot.row + 1}, Col {selectedPlot.col + 1}
              </p>

              {selectedPlot.ownerId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl"
                      style={{ border: '2px solid rgba(252,211,77,0.4)', background: 'rgba(15,12,41,0.8)', color: '#fcd34d' }}>
                      {selectedPlot.ownerAvatar
                        ? <img src={selectedPlot.ownerAvatar} alt="" className="w-full h-full object-cover" />
                        : selectedPlot.ownerName?.trim().charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Owned by</p>
                      <p className="font-serif font-bold text-white text-lg">{selectedPlot.ownerName}</p>
                      <p className="text-xs" style={{ color: '#a5b4fc' }}>
                        {selectedPlot.ownerCardCount >= 10 ? '🌌 Cosmic Pyramid'
                          : selectedPlot.ownerCardCount >= 5 ? '🚀 Floating Cube'
                          : selectedPlot.ownerCardCount >= 3 ? '⛩️ Pagoda'
                          : selectedPlot.ownerCardCount >= 1 ? '🔮 Crystal Tower'
                          : '🏡 Classic / 🏢 Villa'}
                        {'  ·  '}{selectedPlot.ownerCardCount} card{selectedPlot.ownerCardCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => { setSelectedPlot(null); navigate(`/profile?user=${selectedPlot.ownerId}`); }}
                    className="w-full py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={{
                      background: 'rgba(139,92,246,0.15)',
                      border: '1px solid rgba(139,92,246,0.4)',
                      color: '#c4b5fd',
                    }}>
                    Visit Profile →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Available for purchase</p>
                  <p className="font-serif text-2xl font-bold" style={{ color: '#fcd34d' }}>
                    ₹{PRICE_PER_PLOT}
                  </p>
                  {!isAuthenticated
                    ? <p className="text-gray-500 text-sm">Log in to purchase a plot.</p>
                    : (
                      <button type="button"
                        disabled={purchasing}
                        onClick={handlePurchase}
                        className="w-full py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                        style={{
                          background: 'rgba(252,211,77,0.12)',
                          border: '1px solid rgba(252,211,77,0.4)',
                          color: '#fcd34d',
                        }}>
                        {purchasing ? 'Purchasing…' : '✦ Purchase Plot (mock)'}
                      </button>
                    )}
                </div>
              )}

              <button type="button"
                onClick={() => setSelectedPlot(null)}
                className="mt-4 w-full py-2 rounded-xl text-gray-500 hover:text-white text-sm transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
