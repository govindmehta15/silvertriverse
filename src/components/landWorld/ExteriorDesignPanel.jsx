import { Link } from 'react-router-dom';
import {
  resolveFacadeUnlocks,
  resolveDoorUnlocks,
  resolveWindowSlots,
  resolveYardProps,
} from '../../landWorld/unlockResolver';

export default function ExteriorDesignPanel({
  design,
  onChange,
  plotCount,
  cardCount,
  isOpen,
  onToggle,
  canEdit,
  onEnableEdit,
  onDisableEdit,
}) {
  const ctx = { plotCount, cardCount };
  const facades = resolveFacadeUnlocks(ctx);
  const doors = resolveDoorUnlocks(ctx);
  const windowSlots = resolveWindowSlots(ctx);
  const yardProps = resolveYardProps(ctx);

  const patch = (p) => onChange(p);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-4 z-20 rounded-xl border border-navy-600/50 bg-navy-950/90 px-4 py-2 text-sm font-medium text-gold shadow-lg backdrop-blur-md transition hover:bg-navy-900/95"
      >
        {isOpen ? 'Hide panel' : canEdit ? 'Design exterior' : 'View design options'}
      </button>

      {isOpen && (
        <aside className="absolute right-4 top-16 z-20 max-h-[min(78vh,560px)] w-[min(92vw,360px)] overflow-y-auto rounded-2xl border border-navy-600/40 bg-navy-950/95 p-4 text-sm text-gray-200 shadow-2xl backdrop-blur-xl">
          <h2 className="font-serif text-lg font-semibold text-gold">Home exterior</h2>
          <p className="mt-1 text-xs text-gray-500">
            Unlocks follow your Land plots and Collectible Unit cards.{' '}
            <Link to="/land" className="text-cyan-400 underline hover:text-cyan-300">
              Buy plots
            </Link>
          </p>
          <p className="mt-2 rounded-lg bg-navy-900/80 px-2 py-1.5 text-xs text-gray-400">
            Plots owned: <span className="text-white">{plotCount}</span> · Cards held:{' '}
            <span className="text-white">{cardCount}</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            {!canEdit ? (
              <button
                type="button"
                onClick={onEnableEdit}
                className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/20"
              >
                Enable edit access
              </button>
            ) : (
              <button
                type="button"
                onClick={onDisableEdit}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20"
              >
                Editing enabled (click to lock)
              </button>
            )}
            <span className="text-[11px] text-gray-500">
              {canEdit ? 'Changes are editable and saved.' : 'Read-only preview mode.'}
            </span>
          </div>

          <section className="mt-4 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Facade</label>
            <div className="flex flex-col gap-1.5">
              {facades.map((f) => (
                <label
                  key={f.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 ${
                    f.locked
                      ? 'border-navy-700/50 opacity-60'
                      : design.facadeId === f.id
                        ? 'border-gold/50 bg-gold/10'
                        : 'border-navy-600/40 hover:border-navy-500/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="facade"
                    value={f.id}
                    checked={design.facadeId === f.id}
                    disabled={f.locked || !canEdit}
                    onChange={() => patch({ facadeId: f.id })}
                    className="accent-gold"
                  />
                  <span className="flex-1">{f.label}</span>
                  {f.locked && f.lockReason && (
                    <span className="text-[10px] text-gray-500">{f.lockReason}</span>
                  )}
                </label>
              ))}
            </div>
          </section>

          <section className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-500">Walls</label>
              <input
                type="color"
                value={design.wallColor}
                disabled={!canEdit}
                onChange={(e) => patch({ wallColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer rounded border border-navy-600 bg-navy-900"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Roof</label>
              <input
                type="color"
                value={design.roofColor}
                disabled={!canEdit}
                onChange={(e) => patch({ roofColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer rounded border border-navy-600 bg-navy-900"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Trim</label>
              <input
                type="color"
                value={design.trimColor}
                disabled={!canEdit}
                onChange={(e) => patch({ trimColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer rounded border border-navy-600 bg-navy-900"
              />
            </div>
          </section>

          <section className="mt-4 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Door</label>
            <div className="flex flex-col gap-1.5">
              {doors.map((d) => (
                <label
                  key={d.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 ${
                    d.locked ? 'border-navy-700/50 opacity-60' : 'border-navy-600/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="door"
                    value={d.id}
                    checked={design.doorStyle === d.id}
                    disabled={d.locked || !canEdit}
                    onChange={() => patch({ doorStyle: d.id })}
                    className="accent-gold"
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="mt-4 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Windows</label>
            {windowSlots.map((s) => (
              <label
                key={s.key}
                className={`flex items-center gap-2 ${s.locked ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!design.windows[s.key]}
                  disabled={s.locked || !canEdit}
                  onChange={(e) =>
                    patch({
                      windows: { ...design.windows, [s.key]: e.target.checked },
                    })
                  }
                  className="accent-gold"
                />
                <span>{s.label}</span>
                {s.locked && <span className="text-[10px] text-gray-500">({s.minCards}+ cards)</span>}
              </label>
            ))}
          </section>

          <section className="mt-4 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Yard props</label>
            {yardProps.map((p) => (
              <label
                key={p.key}
                className={`flex items-center gap-2 ${p.locked ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!design.yardProps[p.key]}
                  disabled={p.locked || !canEdit}
                  onChange={(e) =>
                    patch({
                      yardProps: { ...design.yardProps, [p.key]: e.target.checked },
                    })
                  }
                  className="accent-gold"
                />
                <span>{p.label}</span>
                {p.locked && <span className="text-[10px] text-gray-500">({p.minCards}+ cards)</span>}
              </label>
            ))}
          </section>
        </aside>
      )}
    </>
  );
}
