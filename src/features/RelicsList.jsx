import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { relicService } from '../services';
import { formatPrice } from '../data/relicsData';
import useCountdown from '../hooks/useCountdown';
import { SkeletonCard, SkeletonBanner } from '../components/Skeleton';

/* ─── Phase config ─────────────────────────────────────────── */
const PHASES = [
    { key: 'submission', label: 'Submitted', icon: '📥', color: 'gray' },
    { key: 'authentication', label: 'Verified', icon: '🔐', color: 'blue' },
    { key: 'catalogue', label: 'Catalogued', icon: '📋', color: 'purple' },
    { key: 'review', label: 'In Review', icon: '👁️', color: 'teal' },
    { key: 'mandate', label: 'Mandate', icon: '📝', color: 'gold' },
    { key: 'bidding', label: 'Bidding', icon: '🔨', color: 'green' },
    { key: 'closed', label: 'Closed', icon: '🏆', color: 'red' },
];

const phaseIndex = (p) => PHASES.findIndex(x => x.key === p);

/* ─── Tiny phase bar ───────────────────────────────────────── */
function PhasePipeline({ currentPhase }) {
    const current = phaseIndex(currentPhase);
    return (
        <div className="flex items-center gap-0.5 w-full">
            {PHASES.map((p, i) => (
                <div key={p.key} className="flex-1">
                    <div className={`h-1 rounded-full transition-all duration-500 ${i <= current ? (i === current ? 'bg-gold shadow-[0_0_6px_rgba(201,162,39,0.4)]' : 'bg-gold/40') : 'bg-navy-700/30'}`} />
                </div>
            ))}
        </div>
    );
}

/* ─── Relic Card ────────────────────────────────────────────── */
function RelicCard({ relic, onClick }) {
    const { formatted, isUrgent, isExpired } = useCountdown(relic.endTime);
    const phase = PHASES.find(p => p.key === relic.phase) || PHASES[0];
    const isLive = relic.phase === 'bidding' && !isExpired;
    const isClosed = relic.phase === 'closed' || isExpired;

    return (
        <motion.div whileHover={{ y: -6 }} onClick={onClick} className="relative cursor-pointer group">
            <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${relic.rarity === 'legendary' ? 'border-gold/20 hover:border-gold/50' : 'border-navy-600/25 hover:border-teal-500/30'}`}
                style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.95) 100%)', boxShadow: relic.rarity === 'legendary' ? '0 8px 30px rgba(201,162,39,0.06)' : '0 8px 30px rgba(0,0,0,0.25)' }}>

                {relic.rarity === 'legendary' && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent z-10" />}

                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                    <img src={relic.image} alt={relic.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

                    {/* Rarity — top left */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border backdrop-blur-sm ${relic.rarity === 'legendary' ? 'text-gold bg-gold/10 border-gold/30' : 'text-cyan-300 bg-cyan-900/30 border-cyan-500/20'}`}>{relic.rarity}</span>
                    </div>

                    {/* Timer — top right */}
                    {isLive && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border backdrop-blur-sm text-[8px] font-mono ${isUrgent ? 'bg-red-900/60 border-red-500/30 text-red-300 animate-pulse' : 'bg-navy-900/70 border-gold/20 text-gold'}`}>{formatted}</div>
                        </div>
                    )}

                    {/* Total Pieces */}
                    {relic.totalPiecesExist && (
                        <div className="absolute bottom-2 right-2 z-10">
                            <span className="text-[7px] text-gold/50 font-mono bg-navy-950/80 px-1.5 py-0.5 rounded border border-gold/10">{relic.totalPiecesExist} exist</span>
                        </div>
                    )}

                    {isClosed && (
                        <div className="absolute inset-0 bg-navy-950/60 flex items-center justify-center z-10">
                            <span className="text-gold font-serif font-bold text-sm uppercase tracking-wider">Claimed</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                    <h3 className="font-serif text-xs font-bold text-white uppercase tracking-wider truncate">{relic.title}</h3>
                    <PhasePipeline currentPhase={relic.phase} />
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{phase.icon} {phase.label}</span>
                        {isLive && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-[8px] font-mono">LIVE</span></div>}
                    </div>
                    <div>
                        <p className="text-gray-600 text-[9px] uppercase tracking-wider">{relic.phase === 'bidding' || relic.phase === 'closed' ? (isClosed ? 'Final Price' : 'Current Bid') : 'Base Price'}</p>
                        <p className="text-gold font-serif font-bold text-base">{formatPrice(relic.phase === 'bidding' || relic.phase === 'closed' ? relic.currentPrice : relic.basePrice)}</p>
                        <p className="text-gray-700 text-[8px]">{relic.bids?.length || 0} bids · {relic.mandateCount} mandates</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── FILTERS ──────────────────────────────────────────────── */
const FILTERS = [
    { value: 'all', label: 'All Relics' },
    { value: 'bidding', label: '🔨 Live Auctions' },
    { value: 'mandate', label: '📝 Mandates' },
    { value: 'review', label: '👁️ In Review' },
    { value: 'closed', label: '🏆 Claimed' },
    { value: 'legendary', label: '⭐ Legendary' },
];

/* ─── Main Page ────────────────────────────────────────────── */
export default function RelicsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery({
        queryKey: ['relics'],
        queryFn: relicService.getRelics,
    });

    const relicsData = response?.success ? (response.data || []) : [];

    const filtered = useMemo(() => {
        let items = [...relicsData];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(r => r.title.toLowerCase().includes(q) || r.film?.toLowerCase().includes(q));
        }
        if (filter === 'bidding') items = items.filter(r => r.phase === 'bidding' && r.status === 'active');
        else if (filter === 'mandate') items = items.filter(r => r.phase === 'mandate');
        else if (filter === 'review') items = items.filter(r => r.phase === 'review' || r.phase === 'catalogue');
        else if (filter === 'closed') items = items.filter(r => r.phase === 'closed' || r.status === 'ended');
        else if (filter === 'legendary') items = items.filter(r => r.rarity === 'legendary');
        return items;
    }, [searchQuery, filter, relicsData]);

    const liveCount = relicsData.filter(r => r.phase === 'bidding' && r.status === 'active').length;
    // Featured relic for hero
    const featuredRelic = relicsData.find(r => r.rarity === 'legendary' && r.phase === 'bidding') || relicsData[0];

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    if (isLoading) {
        return (
            <div className="p-4 space-y-6">
                <SkeletonBanner duration={2} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-4 relative">

            {/* ═══ HERO BANNER ═══ */}
            <div className="relative overflow-hidden">
                {/* Background image */}
                {featuredRelic && (
                    <div className="absolute inset-0">
                        <img src={featuredRelic.image} alt="" className="w-full h-full object-cover opacity-30" />
                        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/80 to-navy-950" />
                        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-transparent to-navy-950/90" />
                    </div>
                )}

                <div className="relative px-4 pt-10 pb-10 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

                        {/* Left: Text content */}
                        <div className="flex-1 text-center md:text-left">
                            {/* Crown ornament + title */}
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <svg className="w-7 h-7 text-gold/50" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
                                </svg>
                            </motion.div>

                            <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="font-serif text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold via-yellow-200 to-gold uppercase tracking-[0.12em]"
                                style={{ textShadow: '0 0 40px rgba(201,162,39,0.15)' }}>
                                Relics
                            </motion.h1>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                                className="text-gray-400 text-sm tracking-[0.25em] uppercase mt-1">
                                Heritage Marketplace
                            </motion.p>

                            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                                <span className="text-gold/30 text-xs">✦</span>
                                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                            </div>

                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="text-gray-500 text-xs mt-3 max-w-md mx-auto md:mx-0">
                                Verified artifacts from the film industry heritage. Each piece authenticated through our rigorous 6-step lifecycle.
                            </motion.p>

                            {/* Lifecycle steps */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="mt-4 flex items-center justify-center md:justify-start gap-1 flex-wrap">
                                {PHASES.slice(0, 6).map((p, i) => (
                                    <div key={p.key} className="flex items-center">
                                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-navy-800/40 border border-navy-700/20">
                                            <span className="text-[9px]">{p.icon}</span>
                                            <span className="text-[7px] text-gray-500 uppercase tracking-wider hidden sm:inline">{p.label}</span>
                                        </div>
                                        {i < 5 && <span className="text-gold/15 text-[9px] mx-0.5">→</span>}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right: Featured Relic preview */}
                        {featuredRelic && (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => navigate(`/relics/${featuredRelic.id}`)}
                                className="w-52 md:w-64 shrink-0 cursor-pointer group hidden md:block"
                            >
                                <div className="relative rounded-xl overflow-hidden border border-gold/20 group-hover:border-gold/40 transition-all"
                                    style={{ boxShadow: '0 15px 50px rgba(201,162,39,0.1), 0 5px 20px rgba(0,0,0,0.4)' }}>
                                    <img src={featuredRelic.image} alt={featuredRelic.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <span className="text-[8px] bg-gold/15 text-gold px-2 py-0.5 rounded-full border border-gold/30 uppercase font-bold tracking-wider">Featured</span>
                                        <h3 className="font-serif text-sm text-white font-bold mt-1.5 uppercase tracking-wider">{featuredRelic.title}</h3>
                                        <p className="text-gold font-serif font-bold text-lg">{formatPrice(featuredRelic.currentPrice)}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ SEARCH + FILTERS ═══ */}
            <div className="px-4 mb-5 space-y-3 max-w-4xl mx-auto">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input type="text" placeholder="Search heritage artifacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-navy-800/50 border border-navy-600/30 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold/30 transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {FILTERS.map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium transition-all border ${filter === f.value ? 'bg-gold/15 text-gold border-gold/30' : 'text-gray-400 border-navy-700/30 hover:border-gold/20'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Live indicator */}
            <div className="px-4 mb-4 max-w-4xl mx-auto flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-xs text-gray-500">{liveCount} Live · {filtered.length} shown</span>
            </div>

            {/* ═══ GRID ═══ */}
            <AnimatePresence mode="wait">
                <motion.div key={filter + searchQuery} variants={container} initial="hidden" animate="show"
                    className="px-4 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20">
                            <span className="text-4xl block mb-3">🏛️</span>
                            <p className="text-gray-400 text-sm">No artifacts match your search.</p>
                        </motion.div>
                    ) : (
                        filtered.map(relic => (
                            <motion.div key={relic.id} variants={item}>
                                <RelicCard relic={relic} onClick={() => navigate(`/relics/${relic.id}`)} />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
