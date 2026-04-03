import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { plotsService } from '../services/plotsService';
import { getData, setData } from '../utils/storageService';
import {
  MIN_PLOT_PRICE,
  MAX_PLOT_PRICE,
  COLS,
  ROWS,
  indexToRowCol,
  getCurrentPlotPrice,
} from '../data/plotsData';
import { mockUsers } from '../mock/mockUsers';
import Land3D from '../components/Land3D';

const CELL_PX = 12;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.5;

function getTierLabel(count) {
  if (count >= 10) return { label: 'Tycoon', color: '#f59e0b', emoji: '🏆' };
  if (count >= 5) return { label: 'Collector', color: '#06b6d4', emoji: '💎' };
  if (count >= 1) return { label: 'Landholder', color: '#22c55e', emoji: '🗺️' };
  return null;
}

// House type legend data
const HOUSE_LEGEND = [
  { emoji: '🏡', name: 'Classic Cottage', desc: 'Default', color: '#f59e0b' },
  { emoji: '🏢', name: 'Modern Villa', desc: 'Default (alt)', color: '#3b82f6' },
  { emoji: '🔮', name: 'Crystal Tower', desc: '1+ cards', color: '#06b6d4' },
  { emoji: '⛩️', name: 'Pagoda', desc: '3+ cards', color: '#ef4444' },
  { emoji: '🚀', name: 'Floating Cube', desc: '5+ cards', color: '#8b5cf6' },
  { emoji: '🌌', name: 'Cosmic Pyramid', desc: '10+ cards', color: '#f97316' },
];

const ITEM_IMAGE_MAP = {
  y1: '/images/bomber_jacket.png',
  y2: '/images/diamond_ring.png',
  y3: '/images/diamond_necklace.png',
  y4: '/images/scifi_weapon.png',
  y5: '/images/ancient_book.png',
  y6: '/images/scifi_weapon.png',
  y7: '/images/bomber_jacket.png',
  y8: '/images/scifi_weapon.png',
  y9: '/images/scifi_weapon.png',
  y10: '/images/scifi_weapon.png',
  o1: '/images/leather_jacket.png',
  o2: '/images/bomber_jacket.png',
  o3: '/images/elegant_dress.png',
  o4: '/images/leather_jacket.png',
  o5: '/images/elegant_dress.png',
  o6: '/images/leather_jacket.png',
  o7: '/images/bomber_jacket.png',
  o8: '/images/elegant_dress.png',
  o9: '/images/leather_jacket.png',
  o10: '/images/bomber_jacket.png',
};

const RELIC_IMAGE_MAP = {
  1: '/images/scifi_weapon.png',
  2: '/images/film_thriller.png',
  3: '/images/film_scifi.png',
  4: '/images/post_bts.png',
  5: '/images/post_casting.png',
};

function getPlotProgress(index) {
  const saved = getData(`land_plot_progress_${index}`);
  return saved || 0;
}

function calculateUserPowerPool(ownerUser) {
  if (!ownerUser) return { total: 0, available: 0, used: 0 };
  const tCards = (ownerUser.ownedCards?.length || 0) * 2;
  const tAssets = (ownerUser.purchasedItems?.length || 0) * 3;
  const tRelics = (ownerUser.ownedRelics?.length || 0) * 5;
  const total = tCards + tAssets + tRelics;

  // Calculate used power: sum of all plot progress for this user
  // (In a real app, you'd fetch this from the backend)
  const ownershipMap = getData('land_ownership') || {};
  let used = 0;
  Object.entries(ownershipMap).forEach(([idx, p]) => {
    if (p.ownerId === ownerUser.id) {
      used += getPlotProgress(idx);
    }
  });

  return { total, used, available: Math.max(0, total - used) };
}

export default function LandMarketplacePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ownershipMap, setOwnershipMap] = useState({});
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [scale, setScale] = useState(0.85);
  const [legendOpen, setLegendOpen] = useState(false);
  const [showMoreCards, setShowMoreCards] = useState(false);
  const [searchVal, setSearchVal] = useState('');

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
    const ownerId = owner?.ownerId;
    const ownerUser = owner ? usersById[ownerId] : null;

    // Collect wall item images
    const wallItems = [];
    if (ownerUser) {
      for (const i of (ownerUser.purchasedItems || [])) {
        if (ITEM_IMAGE_MAP[i]) wallItems.push(ITEM_IMAGE_MAP[i]);
        if (wallItems.length >= 3) break;
      }
      if (wallItems.length < 3) {
        for (const r of (ownerUser.ownedRelics || [])) {
          if (RELIC_IMAGE_MAP[r]) wallItems.push(RELIC_IMAGE_MAP[r]);
          if (wallItems.length >= 3) break;
        }
      }
    }

    setSelectedPlot({
      index, row, col,
      ownerId: ownerId ?? null,
      ownerName: owner?.ownerName ?? null,
      ownerAvatar: ownerUser?.avatar ?? null,
      ownerCardCount: ownerUser?.ownedCards?.length ?? 0,
      wallItems: [...new Set(wallItems)].slice(0, 3),
      progress: getPlotProgress(index)
    });
  };

  const handleAllocatePower = (index, amount) => {
    if (powerPool.available < amount) return;
    const current = getPlotProgress(index);
    if (current >= 100) return;

    const newProgress = Math.min(100, current + amount);
    setData(`land_plot_progress_${index}`, newProgress);

    // Update local state for immediate feedback
    setSelectedPlot(prev => prev && prev.index === index ? { ...prev, progress: newProgress } : prev);
    setOwnershipMap({ ...ownershipMap }); // Trigger re-memo
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) return;
    setPurchasing(true);
    const res = await plotsService.purchasePlot(user.id, user.name, selectedPlot.index);
    setPurchasing(false);
    if (res.success) { loadOwnership(); setSelectedPlot(null); }
  };

  const myPlots = Object.values(ownershipMap).filter((p) => p.ownerId === user?.id);
  const myPlotCount = myPlots.length;

  const powerPool = useMemo(() => calculateUserPowerPool(user), [user, ownershipMap]);

  const myCardCount = user ? (usersById[user.id]?.ownedCards?.length ?? 0) : 0;
  const shouldShowViewMore = myCardCount > 5;
  const visiblePurchasedItems = (user?.purchasedItems || []).slice(0, 3);
  const visibleCardIds = showMoreCards
    ? (user?.ownedCards || []).slice(0, 8)
    : (user?.ownedCards || []).slice(0, 3);
  const tierInfo = getTierLabel(myPlotCount);
  const totalOwned = Object.keys(ownershipMap).length;
  const totalCells = COLS * ROWS;
  const currentPlotPrice = getCurrentPlotPrice(totalOwned, totalCells);

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
              Dynamic pricing ₹{MIN_PLOT_PRICE}-₹{MAX_PLOT_PRICE} · Current ₹{currentPlotPrice}
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

        {/* ── Power Pool Dashboard ─────────────────────────── */}
        {isAuthenticated && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-indigo-950 border border-navy-700/50 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                ⚡
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Global Power Pool</p>
                <p className="text-lg font-bold text-white leading-none">
                  {powerPool.available}<span className="text-xs text-gray-400 font-normal"> / {powerPool.total}% Available</span>
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Allocated</p>
                <p className="text-xs font-medium text-gray-300">{powerPool.used}%</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Reserves</p>
                <p className="text-xs font-medium text-cyan-400">{powerPool.available}%</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Search & Jump ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Find Plot # (e.g. 42)..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-navy-900/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-gold/40 placeholder:text-gray-600"
            />
            <button
              onClick={() => { if (searchVal) handlePlotClick(parseInt(searchVal)); }}
              className="absolute right-2 top-1.5 px-3 py-1 bg-gold/10 text-gold text-xs font-bold rounded-lg border border-gold/20"
            >
              Go
            </button>
          </div>

          {isAuthenticated && myPlotCount > 0 && (
            <button
              onClick={() => {
                const firstMine = Object.entries(ownershipMap).find(([, v]) => v.ownerId === user.id);
                if (firstMine) handlePlotClick(parseInt(firstMine[0]));
              }}
              className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-900/20 text-cyan-300 text-sm font-medium hover:bg-cyan-900/30 transition-all flex items-center gap-2"
            >
              🚀 Jump to My Plot
            </button>
          )}
        </div>

        {/* ── My Estate Strip ────────────────────────────────── */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl border px-5 py-3"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.10))',
              borderColor: 'rgba(139,92,246,0.3)',
              boxShadow: '0 0 24px rgba(139,92,246,0.12)',
            }}
          >
            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-wrap items-center gap-5">
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
                </div>

                {/* Right side: text on top + collectibles below */}
                <div className="lg:min-w-[360px]">
                  <p className="mb-2 text-[10px] text-right text-gray-500 uppercase tracking-widest">
                    Collectible units with utility power
                  </p>
                  <div className="flex justify-end -space-x-5">
                    {visiblePurchasedItems.map((id, i) => (
                      <div key={id} className="relative w-20 h-20 rounded-full border border-navy-600 bg-navy-900 overflow-hidden shadow-lg group" style={{ zIndex: 10 - i }}>
                        <img src={ITEM_IMAGE_MAP[id] || '/images/scifi_weapon.png'} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-gold">+10%</span>
                        </div>
                      </div>
                    ))}
                    {visibleCardIds.map((id, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-full border border-cyan-600/50 bg-navy-900 overflow-hidden shadow-lg group" style={{ zIndex: 5 - i }}>
                        <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-navy-900 flex items-center justify-center text-[15px] text-cyan-400 font-serif">
                          C
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-cyan-400">+5%</span>
                        </div>
                      </div>
                    ))}
                    {(!visiblePurchasedItems.length && !visibleCardIds.length) && (
                      <div className="w-16 h-16 rounded-full border border-dashed border-gray-700 flex items-center justify-center text-sm text-gray-600">
                        +
                      </div>
                    )}
                  </div>
                  {shouldShowViewMore && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowMoreCards((v) => !v)}
                        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/20"
                      >
                        {showMoreCards ? 'View Less' : `View More (+${myCardCount - 3})`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* House guide moved to left side below */}
              <button type="button"
                onClick={() => setLegendOpen(v => !v)}
                className="w-fit text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  color: legendOpen ? '#fcd34d' : '#94a3b8',
                  borderColor: legendOpen ? 'rgba(252,211,77,0.4)' : 'rgba(255,255,255,0.12)',
                  background: legendOpen ? 'rgba(252,211,77,0.08)' : 'rgba(255,255,255,0.04)',
                }}>
                {legendOpen ? '✕ Close' : '🏠 House Guide'}
              </button>
            </div>
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
                <div className="mt-4 pt-4 border-t border-navy-700/50">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Redefined Utility Power</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[9px] text-gray-400">
                    <div className="p-2 rounded-lg bg-navy-900/40 border border-navy-600">
                      <p className="text-cyan-400 font-bold text-xs">+2%</p>
                      <p>Per Card</p>
                    </div>
                    <div className="p-2 rounded-lg bg-navy-900/40 border border-navy-600">
                      <p className="text-gold font-bold text-xs">+3%</p>
                      <p>Per Asset</p>
                    </div>
                    <div className="p-2 rounded-lg bg-navy-900/40 border border-navy-600">
                      <p className="text-violet-400 font-bold text-xs">+5%</p>
                      <p>Per Relic</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] text-gray-600 italic">
                    Points are pooled. You can manually allocate them to any of your plots to speed up construction.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-navy-700/50">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Estate Power Management</p>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-900/10 border border-cyan-500/20 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400">Available Power Pool</p>
                      <p className="text-xl font-bold text-cyan-400">{powerPool.available}%</p>
                    </div>
                    {powerPool.available > 0 && myPlotCount > 0 ? (
                      <button
                        onClick={() => {
                          const myPlotIndices = Object.entries(ownershipMap)
                            .filter(([, v]) => v.ownerId === user?.id)
                            .map(([k]) => parseInt(k));

                          // Distribute up to 10% to each plot if possible
                          let remaining = powerPool.available;
                          myPlotIndices.forEach(idx => {
                            if (remaining <= 0) return;
                            const current = getPlotProgress(idx);
                            const toAdd = Math.min(10, remaining, 100 - current);
                            if (toAdd > 0) {
                              const newP = Math.min(100, current + toAdd);
                              setData(`land_plot_progress_${idx}`, newP);
                              remaining -= toAdd;
                            }
                          });
                          loadOwnership(); // Reload to refresh power pool
                        }}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-900/20 transition-all"
                      >
                        ⚡ Bulk Allocate Power
                      </button>
                    ) : (
                      <p className="text-[10px] text-gray-500 italic">No power to allocate yet.</p>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-600 mb-4 px-1">
                    Points are pooled from your collection. Bulk allocation distributes your reserves across all your plots automatically.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-navy-700/50">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Your Collection (Utility Power)</p>
                  <div className="flex flex-wrap gap-2">
                    {isAuthenticated && user?.purchasedItems?.length > 0 ? (
                      user.purchasedItems.slice(0, 10).map((id, i) => (
                        <div key={id} className="w-10 h-10 rounded-lg border border-navy-600 bg-navy-900/40 overflow-hidden shadow-sm" title={id}>
                          <img src={ITEM_IMAGE_MAP[id] || '/images/scifi_weapon.png'} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-gray-600 italic">No collectible cards or assets yet.</p>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-[10px] text-gray-600 italic">
                  House color reflects the owner's chosen profile theme. Collectibles (cards & assets) are displayed as high-tech frames on the outer walls of your buildings.
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
          className="relative overflow-hidden rounded-2xl select-none bg-navy-950"
          style={{
            height: 'min(75vmin, 580px)',
            minHeight: 400,
            boxShadow: '0 0 60px rgba(139,92,246,0.25), 0 0 120px rgba(6,182,212,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <Suspense fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-xl text-white z-10 transition-opacity duration-1000">
              <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Metropolis Initializing...</p>
              <p className="text-[10px] text-slate-500 mt-2">Streaming 50x50 Metropolitan Grid</p>
            </div>
          }>
            <Land3D
              ownershipMap={ownershipMap}
              user={user}
              onPlotClick={handlePlotClick}
              selectedPlotIndex={selectedPlot?.index}
            />
          </Suspense>
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

                  <div className="pt-2 px-1 rounded-xl border border-navy-700 bg-navy-900/40">
                    <div className="flex justify-between items-center px-2 mb-2">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Construction Progress</p>
                      <p className="text-[11px] font-bold" style={{ color: selectedPlot.progress >= 100 ? '#4ade80' : '#60a5fa' }}>
                        {selectedPlot.progress}%
                      </p>
                    </div>
                    <div className="h-1.5 mx-2 mb-3 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${selectedPlot.progress}%`,
                          background: selectedPlot.progress >= 100
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #2563eb, #60a5fa)',
                          boxShadow: '0 0 8px rgba(96,165,250,0.5)'
                        }}
                      />
                    </div>

                    {/* Manual Allocation Logic */}
                    {selectedPlot.ownerId === user?.id && selectedPlot.progress < 100 && (
                      <div className="flex flex-col gap-2 mx-2 mb-4">
                        {powerPool.available > 0 ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAllocatePower(selectedPlot.index, 5)}
                              disabled={powerPool.available < 5}
                              className="flex-1 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 hover:bg-cyan-600/30 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Allocate 5% Power
                            </button>
                            <button
                              onClick={() => handleAllocatePower(selectedPlot.index, 10)}
                              disabled={powerPool.available < 10}
                              className="flex-1 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 hover:bg-indigo-600/30 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Allocate 10% Power
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSelectedPlot(null); navigate('/collectibles'); }}
                            className="w-full py-2 rounded-lg bg-red-600/10 border border-red-500/30 text-[10px] font-bold text-red-300 hover:bg-red-600/20 transition-all"
                          >
                            ⚠ Need Power! Collect more cards →
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-2">Wall Collectibles</p>
                    <div className="flex gap-2 p-2 pt-0">
                      {selectedPlot.wallItems.map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-navy-600 bg-black/40">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {selectedPlot.wallItems.length === 0 && (
                        <div className="w-full h-12 flex items-center justify-center border border-dashed border-gray-800 text-[10px] text-gray-600 rounded-lg">
                          No items equipped
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPlot.ownerId !== user?.id && (
                    <button type="button"
                      onClick={() => { setSelectedPlot(null); navigate(`/profile/${selectedPlot.ownerId}`); }}
                      className="w-full py-2.5 rounded-xl font-medium text-sm transition-all"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#c4b5fd',
                      }}>
                      Visit Profile →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Available for purchase</p>
                  <p className="font-serif text-2xl font-bold" style={{ color: '#fcd34d' }}>
                    ₹{currentPlotPrice}
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
