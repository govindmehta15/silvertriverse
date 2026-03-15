/**
 * Profile themes. default = free for all; premium = only for winners/sponsors.
 * Each theme: cover, coverOverlay, coverBlend, pageBackground, accent/card/badge/button classes, optional transitionPreset.
 */

export const DEFAULT_THEME_ID = 'default';

const DEFAULT_PAGE_BG = 'linear-gradient(180deg, #0a0e1a 0%, #0f1419 30%, #0d1117 100%)';
const DEFAULT_COVER_BLEND = 'linear-gradient(to bottom, transparent 0%, transparent 50%, #0a0e1a 100%)';

export const PROFILE_THEMES = [
  {
    id: 'default',
    name: 'Classic',
    premium: false,
    cover: 'linear-gradient(135deg, #0a0e1a 0%, #1a2332 40%, #0d2b3e 70%, #0a0e1a 100%)',
    coverOverlay: 'rgba(0,0,0,0.35)',
    coverBlend: DEFAULT_COVER_BLEND,
    pageBackground: DEFAULT_PAGE_BG,
    transitionPreset: 'smooth',
    accent: 'gold',
    accentClass: 'text-gold border-gold/30 bg-gold/10',
    cardClass: 'bg-navy-800/50 border-navy-600/50',
    badgeClass: 'bg-gold/10 border-gold/30 text-gold',
    buttonClass: 'bg-gold/20 border-gold/40 text-gold hover:bg-gold/30',
  },
  {
    id: 'gold-luxe',
    name: 'Gold Luxe',
    premium: true,
    cover: 'linear-gradient(165deg, #1a1510 0%, #2d2416 25%, #3d2e1a 50%, #2d2416 75%, #0d0a06 100%)',
    coverOverlay: 'rgba(201,162,39,0.1)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(13,10,6,0.6) 70%, #0d0a06 100%)',
    pageBackground: 'linear-gradient(180deg, #0d0a06 0%, #1a1510 25%, #15120c 60%, #0d0a06 100%)',
    transitionPreset: 'smooth',
    accent: 'gold',
    accentClass: 'text-amber-200 border-amber-400/40 bg-amber-950/40',
    cardClass: 'bg-zinc-900/90 border-amber-500/25 shadow-[0_0_35px_rgba(201,162,39,0.1)]',
    badgeClass: 'bg-amber-900/60 border-amber-400/50 text-amber-200',
    buttonClass: 'bg-amber-600/30 border-amber-400/50 text-amber-200 hover:bg-amber-600/50',
  },
  {
    id: 'emerald-sovereign',
    name: 'Emerald Sovereign',
    premium: true,
    cover: 'linear-gradient(165deg, #031a12 0%, #052a1c 30%, #0d3d2a 50%, #052a1c 80%, #021510 100%)',
    coverOverlay: 'rgba(16,185,129,0.08)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(2,21,16,0.7) 70%, #021510 100%)',
    pageBackground: 'linear-gradient(180deg, #021510 0%, #052018 30%, #031a12 70%, #021510 100%)',
    transitionPreset: 'smooth',
    accent: 'emerald',
    accentClass: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40',
    cardClass: 'bg-slate-900/90 border-emerald-500/25 shadow-[0_0_35px_rgba(16,185,129,0.1)]',
    badgeClass: 'bg-emerald-900/60 border-emerald-400/50 text-emerald-300',
    buttonClass: 'bg-emerald-600/30 border-emerald-400/50 text-emerald-300 hover:bg-emerald-600/50',
  },
  {
    id: 'violet-crown',
    name: 'Violet Crown',
    premium: true,
    cover: 'linear-gradient(165deg, #120818 0%, #1e0f2e 30%, #2d1b45 50%, #1e0f2e 80%, #0d0612 100%)',
    coverOverlay: 'rgba(139,92,246,0.08)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(13,6,18,0.7) 70%, #0d0612 100%)',
    pageBackground: 'linear-gradient(180deg, #0d0612 0%, #150a1f 35%, #120818 70%, #0d0612 100%)',
    transitionPreset: 'smooth',
    accent: 'violet',
    accentClass: 'text-violet-300 border-violet-500/40 bg-violet-950/40',
    cardClass: 'bg-slate-900/90 border-violet-500/25 shadow-[0_0_35px_rgba(139,92,246,0.1)]',
    badgeClass: 'bg-violet-900/60 border-violet-400/50 text-violet-300',
    buttonClass: 'bg-violet-600/30 border-violet-400/50 text-violet-300 hover:bg-violet-600/50',
  },
  {
    id: 'crimson-legacy',
    name: 'Crimson Legacy',
    premium: true,
    cover: 'linear-gradient(165deg, #1a0608 0%, #2e0c0c 30%, #4a1515 50%, #2e0c0c 80%, #0f0404 100%)',
    coverOverlay: 'rgba(220,38,38,0.08)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(15,4,4,0.75) 70%, #0f0404 100%)',
    pageBackground: 'linear-gradient(180deg, #0f0404 0%, #1a0808 35%, #150606 70%, #0f0404 100%)',
    transitionPreset: 'smooth',
    accent: 'red',
    accentClass: 'text-red-300 border-red-500/40 bg-red-950/40',
    cardClass: 'bg-zinc-900/90 border-red-500/25 shadow-[0_0_35px_rgba(220,38,38,0.08)]',
    badgeClass: 'bg-red-900/60 border-red-400/50 text-red-300',
    buttonClass: 'bg-red-600/30 border-red-400/50 text-red-300 hover:bg-red-600/50',
  },
  {
    id: 'azure-horizon',
    name: 'Azure Horizon',
    premium: true,
    cover: 'linear-gradient(165deg, #041218 0%, #0a2438 30%, #0e3d52 50%, #0a2438 80%, #031015 100%)',
    coverOverlay: 'rgba(6,182,212,0.08)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(3,16,21,0.75) 70%, #031015 100%)',
    pageBackground: 'linear-gradient(180deg, #031015 0%, #06101a 35%, #051218 70%, #031015 100%)',
    transitionPreset: 'smooth',
    accent: 'cyan',
    accentClass: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40',
    cardClass: 'bg-slate-900/90 border-cyan-500/25 shadow-[0_0_35px_rgba(6,182,212,0.1)]',
    badgeClass: 'bg-cyan-900/60 border-cyan-400/50 text-cyan-300',
    buttonClass: 'bg-cyan-600/30 border-cyan-400/50 text-cyan-300 hover:bg-cyan-600/50',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    premium: true,
    cover: 'linear-gradient(165deg, #050505 0%, #0f0f0f 30%, #1a1a1a 50%, #0f0f0f 80%, #000000 100%)',
    coverOverlay: 'rgba(255,255,255,0.025)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 70%, #000000 100%)',
    pageBackground: 'linear-gradient(180deg, #000000 0%, #0a0a0a 30%, #050505 70%, #000000 100%)',
    transitionPreset: 'subtle',
    accent: 'slate',
    accentClass: 'text-slate-300 border-slate-500/40 bg-slate-800/40',
    cardClass: 'bg-zinc-950/95 border-slate-600/35 shadow-[0_0_25px_rgba(255,255,255,0.04)]',
    badgeClass: 'bg-slate-800/70 border-slate-500/50 text-slate-300',
    buttonClass: 'bg-slate-700/50 border-slate-500/50 text-slate-200 hover:bg-slate-700/70',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    premium: true,
    cover: 'linear-gradient(165deg, #1a0f0d 0%, #2d1814 30%, #3d221c 50%, #2d1814 80%, #120a08 100%)',
    coverOverlay: 'rgba(251,113,133,0.07)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(18,10,8,0.75) 70%, #120a08 100%)',
    pageBackground: 'linear-gradient(180deg, #120a08 0%, #1a1210 35%, #15100e 70%, #120a08 100%)',
    transitionPreset: 'smooth',
    accent: 'rose',
    accentClass: 'text-rose-300 border-rose-400/40 bg-rose-950/40',
    cardClass: 'bg-zinc-900/90 border-rose-400/25 shadow-[0_0_35px_rgba(251,113,133,0.08)]',
    badgeClass: 'bg-rose-900/60 border-rose-400/50 text-rose-300',
    buttonClass: 'bg-rose-600/30 border-rose-400/50 text-rose-300 hover:bg-rose-600/50',
  },
  {
    id: 'silver-screen',
    name: 'Silver Screen',
    premium: true,
    cover: 'linear-gradient(165deg, #0c0c0e 0%, #18181c 30%, #242428 50%, #18181c 80%, #08080a 100%)',
    coverOverlay: 'rgba(203,213,225,0.05)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(8,8,10,0.8) 70%, #08080a 100%)',
    pageBackground: 'linear-gradient(180deg, #08080a 0%, #0f0f12 35%, #0c0c0e 70%, #08080a 100%)',
    transitionPreset: 'smooth',
    accent: 'slate',
    accentClass: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
    cardClass: 'bg-slate-900/90 border-slate-500/35 shadow-[0_0_30px_rgba(203,213,225,0.06)]',
    badgeClass: 'bg-slate-700/60 border-slate-400/50 text-slate-200',
    buttonClass: 'bg-slate-600/35 border-slate-400/50 text-slate-200 hover:bg-slate-600/55',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    premium: true,
    cover: 'linear-gradient(165deg, #1a0d05 0%, #2e1808 30%, #4a2810 50%, #2e1808 80%, #0f0803 100%)',
    coverOverlay: 'rgba(249,115,22,0.07)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(15,8,3,0.75) 70%, #0f0803 100%)',
    pageBackground: 'linear-gradient(180deg, #0f0803 0%, #1a1008 35%, #151008 70%, #0f0803 100%)',
    transitionPreset: 'smooth',
    accent: 'orange',
    accentClass: 'text-orange-300 border-orange-500/40 bg-orange-950/40',
    cardClass: 'bg-zinc-900/90 border-orange-500/25 shadow-[0_0_35px_rgba(249,115,22,0.09)]',
    badgeClass: 'bg-orange-900/60 border-orange-400/50 text-orange-300',
    buttonClass: 'bg-orange-600/30 border-orange-400/50 text-orange-300 hover:bg-orange-600/50',
  },
  {
    id: 'noir',
    name: 'Noir',
    premium: true,
    cover: 'linear-gradient(165deg, #000000 0%, #0a0a0a 25%, #141414 50%, #0a0a0a 75%, #000000 100%)',
    coverOverlay: 'rgba(255,255,255,0.04)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 70%, #000000 100%)',
    pageBackground: 'linear-gradient(180deg, #000000 0%, #050505 25%, #0a0a0a 50%, #000000 100%)',
    transitionPreset: 'subtle',
    accent: 'neutral',
    accentClass: 'text-white border-white/25 bg-white/10',
    cardClass: 'bg-black/70 border-white/15 shadow-[0_0_25px_rgba(255,255,255,0.03)]',
    badgeClass: 'bg-white/15 border-white/25 text-white',
    buttonClass: 'bg-white/15 border-white/35 text-white hover:bg-white/25',
  },
  {
    id: 'jade',
    name: 'Jade',
    premium: true,
    cover: 'linear-gradient(165deg, #031a14 0%, #062e22 30%, #0a4232 50%, #062e22 80%, #021510 100%)',
    coverOverlay: 'rgba(34,197,94,0.06)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(2,21,16,0.75) 70%, #021510 100%)',
    pageBackground: 'linear-gradient(180deg, #021510 0%, #052018 35%, #031a14 70%, #021510 100%)',
    transitionPreset: 'smooth',
    accent: 'green',
    accentClass: 'text-green-300 border-green-500/40 bg-green-950/40',
    cardClass: 'bg-slate-900/90 border-green-500/25 shadow-[0_0_35px_rgba(34,197,94,0.08)]',
    badgeClass: 'bg-green-900/60 border-green-400/50 text-green-300',
    buttonClass: 'bg-green-600/30 border-green-400/50 text-green-300 hover:bg-green-600/50',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    premium: true,
    cover: 'linear-gradient(165deg, #04121a 0%, #0a2438 30%, #0f3550 50%, #0a2438 80%, #030d12 100%)',
    coverOverlay: 'rgba(59,130,246,0.07)',
    coverBlend: 'linear-gradient(to bottom, transparent 0%, rgba(3,13,18,0.75) 70%, #030d12 100%)',
    pageBackground: 'linear-gradient(180deg, #030d12 0%, #05141a 35%, #041218 70%, #030d12 100%)',
    transitionPreset: 'smooth',
    accent: 'blue',
    accentClass: 'text-blue-300 border-blue-500/40 bg-blue-950/40',
    cardClass: 'bg-slate-900/90 border-blue-500/25 shadow-[0_0_35px_rgba(59,130,246,0.1)]',
    badgeClass: 'bg-blue-900/60 border-blue-400/50 text-blue-300',
    buttonClass: 'bg-blue-600/30 border-blue-400/50 text-blue-300 hover:bg-blue-600/50',
  },
];

const THEME_MAP = Object.fromEntries(PROFILE_THEMES.map((t) => [t.id, t]));

/** Fallback page background when theme has none (e.g. legacy). */
export const FALLBACK_PAGE_BACKGROUND = DEFAULT_PAGE_BG;
/** Fallback cover blend when theme has none. */
export const FALLBACK_COVER_BLEND = DEFAULT_COVER_BLEND;

/** IDs of premium themes (for allocation on plot purchase). */
export const PREMIUM_THEME_IDS = PROFILE_THEMES.filter((t) => t.premium).map((t) => t.id);

export function getThemeById(id) {
  return THEME_MAP[id] || THEME_MAP[DEFAULT_THEME_ID];
}

export function getDefaultTheme() {
  return THEME_MAP[DEFAULT_THEME_ID];
}

/** Pick a premium theme for a user by their owned-plot count (1st plot = first theme, 2nd = second, etc.). */
export function getPremiumThemeForPlotCount(ownedCount) {
  if (ownedCount < 1 || PREMIUM_THEME_IDS.length === 0) return null;
  return PREMIUM_THEME_IDS[(ownedCount - 1) % PREMIUM_THEME_IDS.length];
}
