import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { plotsService } from '../services/plotsService';
import {
  clearLandWorldDecorSlot,
  getLandWorldState,
  getLandWorldDecorMap,
  getOrCreateLandWorldLayout,
  getVirtualLandWorldOwnership,
  moveLandWorldDecorSlot,
  purchaseVirtualLandWorldPlot,
  setLandWorldDecorSlot,
  saveLandWorldState,
} from '../services/landWorldService';
import { coerceDesignToUnlocks } from '../landWorld/unlockResolver';
import { createEnginePayload, ENGINE_TYPES, getEngineProfile } from '../landWorld/engineAdapter';
import ExteriorDesignPanel from '../components/landWorld/ExteriorDesignPanel';
import HouseManagementPanel from '../components/landWorld/HouseManagementPanel';
import LandWorldUnified3D from '../components/landWorld/LandWorldUnified3D';
import { getCurrentPlotPrice, MIN_PLOT_PRICE, MAX_PLOT_PRICE } from '../data/plotsData';
import { premiumMerchandise, dailyMerchandise } from '../data/merchandiseData';
import relicsData from '../data/relicsData';

function buildInventory(user) {
  if (!user) return [];
  const merchById = {};
  [...premiumMerchandise, ...dailyMerchandise].forEach((it) => {
    merchById[it.id] = it;
  });
  const relicById = {};
  relicsData.forEach((r) => {
    relicById[String(r.id)] = r;
  });

  const items = [];
  (user.ownedCards || []).forEach((cardId) => {
    items.push({
      key: `card:${cardId}`,
      name: `Verse Card ${cardId}`,
      type: 'Verse Card',
      image: '/images/ancient_book.png',
    });
  });
  (user.purchasedItems || []).forEach((itemId) => {
    const merch = merchById[itemId];
    items.push({
      key: `item:${itemId}`,
      name: merch?.title || `Collectible ${itemId}`,
      type: 'Purchased Item',
      image: merch?.images?.[0] || '/images/elegant_dress.png',
    });
  });
  (user.ownedRelics || []).forEach((rid) => {
    const relic = relicById[String(rid)];
    items.push({
      key: `relic:${rid}`,
      name: relic?.name || `Relic #${rid}`,
      type: 'Relic',
      image: relic?.image || '/images/scifi_weapon.png',
    });
  });

  const dedup = new Map();
  items.forEach((it) => dedup.set(it.key, it));
  return Array.from(dedup.values());
}

export default function LandWorldPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [panelOpen, setPanelOpen] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [design, setDesign] = useState(() => getLandWorldState(user?.id ?? ''));
  const [layout, setLayout] = useState(null);
  const [ownershipMap, setOwnershipMap] = useState({});
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [decorByPlot, setDecorByPlot] = useState({});
  const [managementPlot, setManagementPlot] = useState(null);

  const plotCount = useMemo(() => {
    if (!user?.id) return 0;
    return Object.values(ownershipMap).filter((o) => o?.ownerId === user.id).length;
  }, [ownershipMap, user?.id]);
  const worldFillPercent = useMemo(() => {
    const total = layout?.activePlotIndices?.length || 0;
    if (!total) return '0.0';
    return ((Object.keys(ownershipMap).length / total) * 100).toFixed(1);
  }, [layout, ownershipMap]);
  const worldTotalPlots = layout?.activePlotIndices?.length || 1;
  const worldOwnedPlots = Object.keys(ownershipMap).length;
  const currentWorldPlotPrice = getCurrentPlotPrice(worldOwnedPlots, worldTotalPlots);

  const cardCount = user?.ownedCards?.length ?? 0;
  const collectibleInventory = useMemo(() => buildInventory(user), [user]);
  const decorTextureByKey = useMemo(
    () => Object.fromEntries(collectibleInventory.map((it) => [it.key, it.image])),
    [collectibleInventory]
  );

  const engineProfile = useMemo(
    () => getEngineProfile(ENGINE_TYPES.WEB_R3F),
    []
  );

  useEffect(() => {
    if (!user?.id) return;
    setLayout(getOrCreateLandWorldLayout(user.id));
    setDecorByPlot(getLandWorldDecorMap(user.id));
  }, [user?.id]);

  const reloadOwnership = useCallback(() => {
    if (!layout) return;
    const realOwnership = plotsService.getOwnershipMapSync() || {};
    const virtualOwnership = user?.id ? getVirtualLandWorldOwnership(user.id) : {};
    const merged = {};
    for (const slot of layout.activePlotIndices || []) {
      const sourceIndex = layout.slotToSourceIndex?.[slot];
      if (sourceIndex !== null && sourceIndex !== undefined && realOwnership[sourceIndex]) {
        merged[slot] = realOwnership[sourceIndex];
      } else if (virtualOwnership[slot]) {
        merged[slot] = virtualOwnership[slot];
      }
    }
    setOwnershipMap(merged);
  }, [layout, user?.id]);

  useEffect(() => {
    reloadOwnership();
  }, [reloadOwnership]);

  useEffect(() => {
    if (!user?.id) return;
    const raw = getLandWorldState(user.id);
    setDesign(coerceDesignToUnlocks(raw, { plotCount, cardCount }));
  }, [user?.id, plotCount, cardCount]);

  const unlockCtx = useMemo(
    () => ({ plotCount, cardCount }),
    [plotCount, cardCount]
  );

  const applyDesign = useCallback(
    (patch) => {
      if (!user?.id) return;
      const next = { ...design, ...patch };
      const coerced = coerceDesignToUnlocks(next, unlockCtx);
      setDesign(coerced);
      saveLandWorldState(user.id, coerced);
    },
    [design, user?.id, unlockCtx]
  );

  const handlePlotClick = useCallback((index) => {
    const cols = layout?.cols || 1;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const owner = ownershipMap[index];
    const sourceIndex = layout?.slotToSourceIndex?.[index];
    setSelectedPlot({
      index,
      row,
      col,
      sourceIndex,
      isVirtual: sourceIndex === null || sourceIndex === undefined,
      ownerId: owner?.ownerId ?? null,
      ownerName: owner?.ownerName ?? null,
    });
  }, [ownershipMap, layout]);

  const handlePurchasePlot = useCallback(async () => {
    if (!user?.id || !selectedPlot || selectedPlot.ownerId) return;
    setPurchasing(true);
    try {
      const res = selectedPlot.isVirtual
        ? purchaseVirtualLandWorldPlot(user.id, user.name, selectedPlot.index)
        : await plotsService.purchasePlot(user.id, user.name, selectedPlot.sourceIndex);
      if (res?.success) {
        reloadOwnership();
        setSelectedPlot(null);
      }
    } finally {
      setPurchasing(false);
    }
  }, [selectedPlot, user?.id, user?.name, reloadOwnership]);

  const handleSetDecorSlot = useCallback((slotIndex, collectibleKey) => {
    if (!user?.id || managementPlot === null || managementPlot === undefined) return;
    const ownsPlot = ownershipMap[managementPlot]?.ownerId === user.id;
    if (!ownsPlot) return;
    const next = collectibleKey
      ? setLandWorldDecorSlot(user.id, managementPlot, slotIndex, collectibleKey)
      : clearLandWorldDecorSlot(user.id, managementPlot, slotIndex);
    setDecorByPlot(next || {});
  }, [user?.id, managementPlot, ownershipMap]);

  const handleReorderDecorSlot = useCallback((fromIndex, toIndex) => {
    if (!user?.id || managementPlot === null || managementPlot === undefined) return;
    const ownsPlot = ownershipMap[managementPlot]?.ownerId === user.id;
    if (!ownsPlot) return;
    const next = moveLandWorldDecorSlot(user.id, managementPlot, fromIndex, toIndex);
    setDecorByPlot(next || {});
  }, [user?.id, managementPlot, ownershipMap]);

  useEffect(() => {
    if (!user?.id) return;
    createEnginePayload({
      userId: user.id,
      design,
      spawn: getLandWorldState(user.id).spawn,
      unlocks: unlockCtx,
    });
  }, [user?.id, design, unlockCtx]);

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-400">Sign in to enter your yard.</p>
        <Link to="/reelity" className="mt-4 text-cyan-400 underline">
          Back to Reelity
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-72px)] min-h-[520px] w-full overflow-hidden bg-navy-950 md:h-[calc(100vh-0px)]">
      <div className="absolute left-4 top-4 z-10 max-w-md rounded-xl border border-navy-600/40 bg-navy-950/85 px-4 py-3 text-left shadow-lg backdrop-blur-md">
        <h1 className="font-serif text-xl font-bold text-gold">Land World</h1>
        <p className="mt-1 text-xs text-gray-400">
          Private yard with Land grid styling and Land-style houses. The classic Land marketplace is unchanged —{' '}
          <Link to="/land" className="text-cyan-400 underline hover:text-cyan-300">
            open Land grid
          </Link>
          .
        </p>
        <p className="mt-1 text-[11px] text-gray-500">
          Engine profile: {engineProfile.label} (Unity/Unreal bridge-ready payload).
        </p>
        <p className="mt-1 text-[11px] text-gray-500">
          One unified mode: free roam camera with no center lock. Drag/scroll/pinch to move anywhere.
        </p>
        <p className="mt-1 text-[11px] text-gray-500">
          Plot pricing: ₹{MIN_PLOT_PRICE} to ₹{MAX_PLOT_PRICE} based on land fill · Current ₹{currentWorldPlotPrice}
        </p>
      </div>
      <div className="absolute inset-0 p-2 pt-32 md:p-4 md:pt-32">
        <div
          className="relative h-full w-full overflow-hidden rounded-2xl border border-violet-500/30 bg-navy-950"
          style={{ boxShadow: '0 0 48px rgba(139,92,246,0.22)' }}
        >
          <Suspense fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-xl text-white z-10 transition-opacity duration-1000">
                <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400">Streamining Grid...</p>
                <p className="text-[10px] text-slate-500 mt-2">Initializing Unified 50x50 Yard</p>
            </div>
          }>
            <LandWorldUnified3D
              ownershipMap={ownershipMap}
              user={user}
              onPlotClick={handlePlotClick}
              selectedPlotIndex={selectedPlot?.index}
              layout={layout}
              decorByPlot={decorByPlot}
              decorTextureByKey={decorTextureByKey}
            />
          </Suspense>
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-xs text-white/90 backdrop-blur-sm">
            Desktop: drag rotate + scroll zoom + click land · Mobile: drag + pinch + tap land
          </div>
        </div>
      </div>

      <ExteriorDesignPanel
        design={design}
        onChange={applyDesign}
        plotCount={plotCount}
        cardCount={cardCount}
        isOpen={panelOpen}
        onToggle={() => setPanelOpen((o) => !o)}
        canEdit={canEdit}
        onEnableEdit={() => setCanEdit(true)}
        onDisableEdit={() => setCanEdit(false)}
      />

      {selectedPlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPlot(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-violet-500/35 bg-[#130f2a] p-5 text-sm text-gray-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg font-bold text-white">Plot #{selectedPlot.index}</h3>
            <p className="mb-3 text-xs text-gray-400">
              Row {selectedPlot.row + 1}, Col {selectedPlot.col + 1}
              {selectedPlot.isVirtual ? ' · Expanded Land' : ''}
            </p>
            {selectedPlot.ownerId ? (
              <>
                <p className="text-gray-300">Owned by <span className="font-semibold text-white">{selectedPlot.ownerName}</span></p>
                {selectedPlot.ownerId === user?.id && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCanEdit(true);
                        setPanelOpen(true);
                        setSelectedPlot(null);
                      }}
                      className="mt-3 w-full rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 text-gold"
                    >
                      Edit My Home Exterior
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManagementPlot(selectedPlot.index);
                        setSelectedPlot(null);
                      }}
                      className="mt-2 w-full rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-violet-200"
                    >
                      House & Tower Management
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${selectedPlot.ownerId}`)}
                  className="mt-3 w-full rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-cyan-200"
                >
                  Visit Profile
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-300">Available for purchase</p>
                <p className="mt-1 text-xl font-bold text-gold">₹{currentWorldPlotPrice}</p>
                <button
                  type="button"
                  onClick={handlePurchasePlot}
                  disabled={purchasing}
                  className="mt-3 w-full rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-gold disabled:opacity-50"
                >
                  {purchasing ? 'Purchasing...' : 'Purchase Plot'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedPlot(null)}
              className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <HouseManagementPanel
        isOpen={managementPlot !== null}
        plotIndex={managementPlot ?? -1}
        slots={managementPlot !== null ? decorByPlot[String(managementPlot)] : [null, null, null, null]}
        inventory={collectibleInventory}
        myPlotCount={plotCount}
        myCardCount={cardCount}
        worldFillPercent={worldFillPercent}
        onSetSlot={handleSetDecorSlot}
        onReorderSlot={handleReorderDecorSlot}
        onClose={() => setManagementPlot(null)}
      />
    </div>
  );
}
