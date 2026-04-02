function NavButton({ label, onPressStart, onPressEnd }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-navy-600/60 bg-navy-950/90 px-3 py-2 text-xs font-semibold text-gray-100 shadow-md active:scale-[0.98]"
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      onTouchCancel={onPressEnd}
    >
      {label}
    </button>
  );
}

export default function NavigationPad({ onIntentChange, onResetPosition }) {
  const set = (patch) => onIntentChange((prev) => ({ ...prev, ...patch }));

  return (
    <div className="absolute bottom-4 right-4 z-20 rounded-xl border border-navy-600/50 bg-navy-950/85 p-3 backdrop-blur-md">
      <p className="mb-2 text-[11px] text-gray-400">Navigation</p>
      <div className="grid grid-cols-3 gap-2">
        <div />
        <NavButton
          label="Forward"
          onPressStart={() => set({ forward: 1 })}
          onPressEnd={() => set({ forward: 0 })}
        />
        <div />
        <NavButton
          label="Left"
          onPressStart={() => set({ right: -1 })}
          onPressEnd={() => set({ right: 0 })}
        />
        <NavButton
          label="Back"
          onPressStart={() => set({ forward: -1 })}
          onPressEnd={() => set({ forward: 0 })}
        />
        <NavButton
          label="Right"
          onPressStart={() => set({ right: 1 })}
          onPressEnd={() => set({ right: 0 })}
        />
      </div>
      <button
        type="button"
        onClick={onResetPosition}
        className="mt-2 w-full rounded-lg border border-navy-600/60 bg-navy-900/90 px-3 py-1.5 text-xs text-cyan-300 hover:text-cyan-200"
      >
        Reset position
      </button>
    </div>
  );
}
