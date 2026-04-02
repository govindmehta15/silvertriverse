import { useMemo } from 'react';

const SLOT_LABELS = ['Front Slot', 'Left Slot', 'Right Slot', 'Tower Ring Slot'];
const HOUSE_LEGEND = [
  { id: 'cottage', emoji: '🏡', name: 'Classic Cottage', desc: 'Default', color: '#f59e0b', minCards: 0 },
  { id: 'modern', emoji: '🏢', name: 'Modern Villa', desc: 'Default (alt)', color: '#3b82f6', minCards: 0 },
  { id: 'tower', emoji: '🔮', name: 'Crystal Tower', desc: '1+ cards', color: '#06b6d4', minCards: 1 },
  { id: 'pagoda', emoji: '⛩️', name: 'Pagoda', desc: '3+ cards', color: '#ef4444', minCards: 3 },
  { id: 'floating', emoji: '🚀', name: 'Floating Cube', desc: '5+ cards', color: '#8b5cf6', minCards: 5 },
  { id: 'cosmic', emoji: '🌌', name: 'Cosmic Pyramid', desc: '10+ cards', color: '#f97316', minCards: 10 },
];

function getCurrentHouseLabel(myPlotCount, myCardCount) {
  if (myCardCount >= 10) return '🌌 Cosmic Pyramid';
  if (myCardCount >= 5) return '🚀 Floating Cube';
  if (myCardCount >= 3) return '⛩️ Pagoda';
  if (myCardCount >= 1) return '🔮 Crystal Tower';
  return myPlotCount % 2 === 0 ? '🏡 Classic Cottage' : '🏢 Modern Villa';
}

export default function HouseManagementPanel({
  isOpen,
  plotIndex,
  slots,
  inventory,
  myPlotCount,
  myCardCount,
  worldFillPercent,
  onSetSlot,
  onReorderSlot,
  onClose,
}) {
  const safeSlots = useMemo(() => {
    if (!Array.isArray(slots)) return [null, null, null, null];
    return [slots[0] || null, slots[1] || null, slots[2] || null, slots[3] || null];
  }, [slots]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-2xl border p-5 text-sm text-gray-200 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15,12,41,0.98), rgba(26,16,64,0.96), rgba(36,36,62,0.95))',
          borderColor: 'rgba(139,92,246,0.35)',
          boxShadow: '0 0 40px rgba(139,92,246,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl font-bold tracking-wide text-white">
              ✦ House & Tower Management
            </h3>
            <p className="text-xs text-gray-400">Plot #{plotIndex} · Equip collectibles (non-destructive)</p>
          </div>
          <button
            type="button"
            className="rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              color: '#fcd34d',
              borderColor: 'rgba(252,211,77,0.4)',
              background: 'rgba(252,211,77,0.08)',
            }}
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        <div className="mb-4 rounded-2xl border px-5 py-3" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.10))',
          borderColor: 'rgba(139,92,246,0.3)',
        }}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">My Plots</p>
              <p className="font-mono text-base font-bold text-yellow-300">{myPlotCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">My Cards</p>
              <p className="font-mono text-base font-bold text-cyan-300">{myCardCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">House Type</p>
              <p className="font-mono text-xs font-bold text-violet-300">{getCurrentHouseLabel(myPlotCount, myCardCount)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">World Fill</p>
              <p className="font-mono text-base font-bold text-emerald-300">{worldFillPercent}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Editing Plot</p>
              <p className="font-mono text-base font-bold text-amber-200">#{plotIndex}</p>
            </div>
          </div>
        </div>

        <div
          className="mb-4 rounded-2xl border p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(15,12,41,0.95), rgba(36,36,62,0.95))',
            borderColor: 'rgba(139,92,246,0.25)',
          }}
        >
          <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            House Designs - Unlocked by Cards
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {HOUSE_LEGEND.map((h) => {
              const unlocked = myCardCount >= h.minCards;
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-2.5 rounded-xl border p-2.5"
                  style={{
                    borderColor: unlocked ? `${h.color}55` : 'rgba(148,163,184,0.25)',
                    background: unlocked ? `${h.color}12` : 'rgba(148,163,184,0.06)',
                    opacity: unlocked ? 1 : 0.6,
                  }}
                >
                  <span className="text-2xl">{h.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{h.name}</p>
                    <p className="text-[10px]" style={{ color: h.color }}>{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] italic text-gray-500">
            House color reflects owner progression. Equip collectibles below to decorate walls and tower ring.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="rounded-2xl border p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(15,12,41,0.95), rgba(36,36,62,0.95))',
              borderColor: 'rgba(139,92,246,0.25)',
            }}
          >
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Collectible Placement Slots
            </h4>
            <div className="space-y-3">
              {SLOT_LABELS.map((label, slotIdx) => (
                <div
                  key={label}
                  className="rounded-xl border p-2.5"
                  style={{
                    borderColor: 'rgba(139,92,246,0.25)',
                    background: 'rgba(139,92,246,0.06)',
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-white">{label}</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded border px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                        style={{
                          color: '#c4b5fd',
                          borderColor: 'rgba(139,92,246,0.4)',
                          background: 'rgba(139,92,246,0.12)',
                        }}
                        disabled={slotIdx === 0}
                        onClick={() => onReorderSlot(slotIdx, slotIdx - 1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="rounded border px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                        style={{
                          color: '#c4b5fd',
                          borderColor: 'rgba(139,92,246,0.4)',
                          background: 'rgba(139,92,246,0.12)',
                        }}
                        disabled={slotIdx === SLOT_LABELS.length - 1}
                        onClick={() => onReorderSlot(slotIdx, slotIdx + 1)}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                  <select
                    value={safeSlots[slotIdx] || ''}
                    onChange={(e) => onSetSlot(slotIdx, e.target.value || null)}
                    className="w-full rounded-lg border px-2 py-1.5 text-sm text-white"
                    style={{
                      borderColor: 'rgba(255,255,255,0.18)',
                      background: 'rgba(15,12,41,0.7)',
                    }}
                  >
                    <option value="">Empty</option>
                    {inventory.map((it) => (
                      <option key={it.key} value={it.key}>
                        {it.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(15,12,41,0.95), rgba(36,36,62,0.95))',
              borderColor: 'rgba(139,92,246,0.25)',
            }}
          >
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Your Collectibles
            </h4>
            <div className="grid max-h-[320px] grid-cols-2 gap-2 overflow-auto pr-1">
              {inventory.length === 0 ? (
                <p className="col-span-2 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-gray-400">
                  No collectibles found in your inventory yet.
                </p>
              ) : (
                inventory.map((it) => (
                  <div
                    key={it.key}
                    className="rounded-xl border p-2"
                    style={{
                      borderColor: 'rgba(6,182,212,0.3)',
                      background: 'rgba(6,182,212,0.08)',
                    }}
                  >
                    <img src={it.image} alt={it.name} className="h-16 w-full rounded-md object-cover" />
                    <p className="mt-1 truncate text-xs font-bold text-white">{it.name}</p>
                    <p className="text-[10px] uppercase tracking-wide text-cyan-300">{it.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
