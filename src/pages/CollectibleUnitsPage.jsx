import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    collectibleUnitsFilms,
    COLLECTIBLE_UNITS_PHASES,
    formatPrice,
    formatLargePrice,
    sportsCollectibleUnits,
    brandCollectibleUnits,
} from '../data/collectibleUnitsData';
import useCountdown from '../hooks/useCountdown';

/* ─── Mini sparkline ───────────────────────────────────────── */
function Sparkline({ data, positive }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const w = 80, h = 28;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
        <svg width={w} height={h} className="shrink-0">
            <polyline fill="none" stroke={positive ? '#22c55e' : '#ef4444'} strokeWidth="1.5" points={pts} />
        </svg>
    );
}

/* ─── Masterpiece card ─────────────────────────────────────── */
function MasterpieceCard({ mp, parentTitle, onClick }) {
    const { formatted, isUrgent } = useCountdown(mp.endTime);
    return (
        <motion.div whileHover={{ y: -4 }} onClick={onClick}
            className="cursor-pointer overflow-hidden rounded-xl border border-gold/20 hover:border-gold/40 transition-all"
            style={{ background: 'linear-gradient(180deg, rgba(201,162,39,0.04) 0%, rgba(10,15,30,0.95) 100%)', boxShadow: '0 8px 30px rgba(201,162,39,0.06)' }}>
            <div className="relative aspect-[16/9] overflow-hidden">
                <img src={mp.image} alt={mp.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">✦ ULTRA RARE</span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[8px] font-mono px-2 py-1 rounded-full border backdrop-blur-sm ${isUrgent ? 'bg-red-900/60 border-red-500/30 text-red-300 animate-pulse' : 'bg-navy-900/70 border-gold/20 text-gold'}`}>{formatted}</span>
                </div>
            </div>
            <div className="p-3.5">
                <p className="text-gray-500 text-[9px] uppercase tracking-wider">{parentTitle}</p>
                <h3 className="font-serif text-sm font-bold text-white mt-0.5">{mp.title}</h3>
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <p className="text-gray-600 text-[9px]">Current Bid</p>
                        <p className="text-gold font-serif font-bold text-lg">{formatPrice(mp.currentBid)}</p>
                    </div>
                    <span className="text-gray-600 text-[9px]">{mp.totalBids} bids</span>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── FILTERS ──────────────────────────────────────────────── */
const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'trading', label: '📈 Trading' },
    { value: 'bidding', label: '🔨 Bidding Open' },
    { value: 'entry', label: '🎬 New Entry' },
    { value: 'exit', label: '🎯 Settled' },
    { value: 'gainers', label: '🟢 Gainers' },
];

/* ═══════════════════════════════════════════════════════════ */
/*              Collectible Units — film token index          */
/* ═══════════════════════════════════════════════════════════ */
const CATEGORY_TABS = [
    { key: 'film', label: 'Film' },
    { key: 'sports', label: 'Sports' },
    { key: 'brand', label: 'Brands' },
];

export default function CollectibleUnitsPage() {
    const [unitCategory, setUnitCategory] = useState('film');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    const activeList = useMemo(() => {
        switch (unitCategory) {
            case 'sports':
                return sportsCollectibleUnits;
            case 'brand':
                return brandCollectibleUnits;
            default:
                return collectibleUnitsFilms;
        }
    }, [unitCategory]);

    const filtered = useMemo(() => {
        let items = [...activeList];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter((f) => {
                if (f.title.toLowerCase().includes(q) || f.genre?.toLowerCase().includes(q)) return true;
                if (f.context && typeof f.context === 'object') {
                    return Object.values(f.context).some((v) => String(v).toLowerCase().includes(q));
                }
                return false;
            });
        }
        if (filter === 'trading') items = items.filter(f => f.phase === 'trading');
        else if (filter === 'bidding') items = items.filter(f => f.phase === 'bidding');
        else if (filter === 'entry') items = items.filter(f => f.phase === 'entry');
        else if (filter === 'exit') items = items.filter(f => f.phase === 'exit' || f.phase === 'closing' || f.phase === 'settlement');
        else if (filter === 'gainers') items = items.filter(f => f.priceChange > 0).sort((a, b) => b.priceChange - a.priceChange);
        return items;
    }, [activeList, searchQuery, filter]);

    const masterpieces = useMemo(
        () =>
            activeList
                .filter((f) => f.masterpiece)
                .map((f) => ({
                    ...f.masterpiece,
                    parentTitle: f.title,
                    parentId: f.id,
                    category: unitCategory,
                })),
        [activeList, unitCategory]
    );
    const totalMarketCap = activeList.reduce((s, f) => s + f.marketCap, 0);
    const totalTokensSold = activeList.reduce((s, f) => s + f.tokensSold, 0);
    const totalTokens = activeList.reduce((s, f) => s + f.totalTokens, 0);
    const avgChange =
        activeList.length > 0
            ? (activeList.reduce((s, f) => s + f.priceChange, 0) / activeList.length).toFixed(2)
            : '0.00';

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
    const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

    return (
        <div className="min-h-screen pb-4 relative">

            {/* ═══ HERO BANNER ═══ */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/film_scifi.png" alt="" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/80 to-navy-950" />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-transparent to-navy-950/80" />
                </div>
                <div className="relative px-4 pt-10 pb-10 max-w-4xl mx-auto text-center">
                    <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="font-serif text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold via-yellow-200 to-gold uppercase tracking-[0.12em]">
                        Collectible Units
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                        className="text-gray-400 text-sm tracking-[0.2em] uppercase mt-1">
                        Sports, film & more — tokenize · invest · earn
                    </motion.p>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                        <span className="text-gold/30 text-xs">✦</span>
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                    </div>
                    {/* Mini phase steps */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="mt-4 flex items-center justify-center gap-1 flex-wrap">
                        {COLLECTIBLE_UNITS_PHASES.map((p, i) => (
                            <div key={p.key} className="flex items-center">
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-navy-800/40 border border-navy-700/20">
                                    <span className="text-[9px]">{p.icon}</span>
                                    <span className="text-[7px] text-gray-500 uppercase tracking-wider hidden sm:inline">{p.label}</span>
                                </div>
                                {i < COLLECTIBLE_UNITS_PHASES.length - 1 && <span className="text-gold/15 text-[9px] mx-0.5">→</span>}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Category tabs: Film / Sports / Brands */}
            <div className="px-4 max-w-4xl mx-auto mb-6 flex flex-wrap gap-2 justify-center">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setUnitCategory(tab.key)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                            unitCategory === tab.key
                                ? 'bg-gold/15 text-gold border-gold/40 shadow-[0_0_20px_rgba(201,162,39,0.12)]'
                                : 'text-gray-400 border-navy-600/50 hover:border-gold/25 hover:text-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ INDEX OVERVIEW ═══ */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="px-4 -mt-4 mb-6 max-w-4xl mx-auto">
                <div className="rounded-xl border border-navy-700/30 p-5 relative overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(10,15,30,0.95) 100%)' }}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-500 text-[9px] uppercase tracking-wider">Collectible Units Index</p>
                            <p className={`text-2xl font-bold font-mono ${Number(avgChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Number(avgChange) >= 0 ? '+' : ''}{avgChange}%
                            </p>
                            <p className="text-gray-600 text-[9px]">Avg. Today</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[9px] uppercase tracking-wider">Market Cap</p>
                            <p className="text-gold font-mono font-bold text-lg">{formatLargePrice(totalMarketCap)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[9px] uppercase tracking-wider">Tokens Sold</p>
                            <p className="text-white font-mono font-bold text-lg">{totalTokensSold.toLocaleString('en-IN')}</p>
                            <p className="text-gray-600 text-[9px]">of {totalTokens.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[9px] uppercase tracking-wider">Listings</p>
                            <p className="text-white font-mono font-bold text-lg">{activeList.length}</p>
                            <p className="text-gray-600 text-[9px]">{activeList.filter(f => f.phase === 'bidding').length} accepting bids</p>
                        </div>
                    </div>
                    {/* Animated chart line */}
                    <div className="h-8 rounded-lg overflow-hidden bg-navy-800/30 relative mt-4">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeOut' }}
                                fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5"
                                points="0,25 10,22 20,20 30,18 40,19 50,15 60,13 70,14 80,10 90,8 100,6" />
                        </svg>
                    </div>
                </div>
            </motion.div>

            {/* ═══ SEARCH + FILTERS ═══ */}
            <div className="px-4 mb-5 space-y-3 max-w-4xl mx-auto">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input type="text" placeholder="Search titles, sport, league, brand…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-navy-800/50 border border-navy-600/30 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold/30 transition-all" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 flex-1">
                        {FILTERS.map(f => (
                            <button key={f.value} onClick={() => setFilter(f.value)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${filter === f.value ? 'bg-gold/15 text-gold border-gold/30' : 'text-gray-400 border-navy-700/30 hover:border-gold/20'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ INDEX VIEW — Trading rows ═══ */}
            <motion.div variants={container} initial="hidden" animate="show" className="px-4 max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-2 px-3 py-2 text-[9px] text-gray-500 uppercase tracking-wider font-mono border-b border-navy-700/20">
                    <span className="w-10">Asset</span>
                    <span className="flex-1 ml-2">Title</span>
                    <span className="w-16 text-right">₹ Token</span>
                    <span className="w-14 text-right">Change</span>
                    <span className="w-20 text-right hidden sm:block">Sold / Total</span>
                </div>
                {filtered.map(film => {
                    const pct = Math.round((film.tokensSold / film.totalTokens) * 100);
                    const isPos = film.priceChange >= 0;
                    return (
                        <motion.div key={`${unitCategory}-${film.id}`} variants={item}
                            onClick={() => navigate(`/collectible-units/${unitCategory}/${film.id}`)}
                            className="flex items-center gap-2 px-3 py-3.5 border-b border-navy-700/10 cursor-pointer hover:bg-navy-800/20 transition-colors group">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-navy-700/20">
                                <img src={film.banner} alt={film.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 ml-1">
                                <h3 className="text-sm font-bold text-white truncate group-hover:text-gold transition-colors">{film.title}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[8px] text-gray-500 uppercase">{film.genre}</span>
                                    <span className={`text-[7px] uppercase font-mono px-1 py-px rounded border ${film.phase === 'bidding' ? 'text-yellow-300 border-yellow-500/20 bg-yellow-500/10' : film.phase === 'exit' ? 'text-green-300 border-green-500/20 bg-green-500/10' : film.phase === 'entry' ? 'text-blue-300 border-blue-500/20 bg-blue-500/10' : 'text-gold/50 border-gold/10 bg-gold/5'}`}>{film.phase}</span>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Sparkline data={film.tokenPriceHistory} positive={isPos} />
                            </div>
                            <div className="w-16 text-right">
                                <p className="text-white font-mono font-bold text-sm">{formatPrice(film.tokenPrice)}</p>
                                <p className="text-gray-600 text-[8px]">/token</p>
                            </div>
                            <div className="w-14 text-right">
                                <span className={`font-mono text-sm font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPos ? '+' : ''}{film.priceChange}%
                                </span>
                            </div>
                            <div className="w-20 text-right hidden sm:block">
                                <p className="text-gray-300 text-[10px] font-mono">{film.tokensSold.toLocaleString()}</p>
                                <div className="w-full h-1 bg-navy-700/30 rounded-full mt-0.5">
                                    <div className="h-full bg-gold/40 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ═══ ULTRA-RARE MASTERPIECES ═══ */}
            {masterpieces.length > 0 && (
                <div className="px-4 max-w-4xl mx-auto mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-gold/50 text-sm">✦</span>
                        <h2 className="font-serif text-xl text-gold font-bold uppercase tracking-wider">Ultra-Rare Masterpieces</h2>
                    </div>
                    <p className="text-gray-500 text-xs mb-4">1-of-1 hand-crafted collectibles — film, sports, and brand vault drops with physical delivery where noted.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {masterpieces.map(mp => (
                            <MasterpieceCard key={`${mp.category}-${mp.id}`} mp={mp} parentTitle={mp.parentTitle} onClick={() => navigate(`/collectible-units/${mp.category}/${mp.parentId}`)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
