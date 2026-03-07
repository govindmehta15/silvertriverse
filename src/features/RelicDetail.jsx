import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { relicService, authService } from '../services';
import { formatPrice, timeAgo } from '../data/relicsData';
import useCountdown from '../hooks/useCountdown';
import GoldButton from '../components/GoldButton';
import { SkeletonBanner } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

/* ─── Phase config ──────────────────────────────────────────── */
const PHASES = [
    { key: 'submission', label: 'Submission', icon: '📥', desc: 'Artifact submitted by verified source' },
    { key: 'authentication', label: 'Authentication', icon: '🔐', desc: 'Verified by film industry contributors' },
    { key: 'catalogue', label: 'Catalogue', icon: '📋', desc: 'Listed in Heritage Catalogue' },
    { key: 'review', label: 'Public Review', icon: '👁️', desc: 'Community discovery window' },
    { key: 'mandate', label: 'Mandate Registry', icon: '📝', desc: 'Collectors register auction intent' },
    { key: 'bidding', label: 'Auction Bidding', icon: '🔨', desc: 'Live competitive bidding' },
    { key: 'closed', label: 'Closure', icon: '🏆', desc: 'Artifact claimed by winner' },
];
const phaseIdx = (p) => PHASES.findIndex(x => x.key === p);

export default function RelicDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const [bidInput, setBidInput] = useState('');
    const [justPlaced, setJustPlaced] = useState(false);
    const bidsRef = useRef(null);

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['relic', Number(id)],
        queryFn: () => relicService.getRelicById(Number(id)),
        refetchInterval: 5000,
    });

    const relic = response?.success ? response.data : null;

    const placeBidMutation = useMutation({
        mutationFn: async (amount) => {
            const userRes = await authService.getCurrentUser();
            if (!userRes.success) throw new Error('You must be logged in to bid.');
            const res = await relicService.placeBid(Number(id), userRes.data.id, amount);
            if (!res.success) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['relic', Number(id)]);
            setBidInput('');
            setJustPlaced(true);
            setTimeout(() => setJustPlaced(false), 2000);
            addToast('Bid placed successfully! ⚡', 'success');
        },
        onError: (error) => addToast(error.message, 'error')
    });

    const { formatted, isUrgent, isWarning, isExpired } = useCountdown(relic?.endTime ?? 0);

    const handlePlaceBid = () => {
        if (!relic || isExpired) return;
        const amount = Number(bidInput);
        if (!amount) return;
        placeBidMutation.mutate(amount);
    };

    if (isLoading) {
        return <div className="min-h-screen p-4 space-y-4"><SkeletonBanner duration={1.5} /></div>;
    }

    if (isError || !relic) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400">{isError ? 'Error loading artifact' : 'Artifact not found.'}</p>
            </div>
        );
    }

    const nextBid = relic.currentPrice + (relic.minimumIncrement || Math.ceil(relic.currentPrice * 0.05));
    const currentPhaseIdx = phaseIdx(relic.phase);
    const isLiveBidding = relic.phase === 'bidding' && !isExpired;
    const isClosed = relic.phase === 'closed' || isExpired;

    return (
        <div className="min-h-screen pb-8 relative">

            {/* Floating particles */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: 2, height: 2,
                            background: `rgba(201,162,39,${0.2 + Math.random() * 0.3})`,
                            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                        }}
                        animate={{ y: [0, -100], opacity: [0, 0.6, 0] }}
                        transition={{ duration: 7 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4 }}
                    />
                ))}
            </div>

            {/* ═══ BACK BUTTON ═══ */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/relics')}
                className="fixed top-4 left-4 lg:left-[17rem] z-50 w-10 h-10 rounded-full bg-navy-900/80 backdrop-blur-md border border-gold/15 flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/40 transition-all shadow-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>

            {/* ═══ HERO IMAGE ═══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <div className="aspect-[4/3] md:aspect-[16/9] max-h-[55vh] overflow-hidden">
                    <img src={relic.image} alt={relic.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-navy-950/10" />
                </div>

                {/* Rarity + title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border mb-3 ${relic.rarity === 'legendary' ? 'text-gold bg-gold/10 border-gold/30' : 'text-cyan-300 bg-cyan-900/30 border-cyan-500/20'}`}>
                        {relic.rarity}
                    </span>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-white uppercase tracking-wider">{relic.title}</h1>
                    {relic.film && <p className="text-gold/50 text-sm mt-1 tracking-wider">From: {relic.film}</p>}
                </div>

                {/* Gold shimmer line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </motion.div>

            {/* ═══ TIMER BAR ═══ */}
            {isLiveBidding && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`px-6 py-4 text-center border-b ${isUrgent ? 'border-red-500/30 bg-red-950/10' : isWarning ? 'border-yellow-600/20 bg-yellow-950/5' : 'border-gold/10'}`}
                >
                    <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">Time Remaining</p>
                    <motion.p
                        className={`font-mono text-3xl md:text-4xl font-bold mt-1 ${isUrgent ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gold'}`}
                        animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                        transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
                    >
                        {formatted}
                    </motion.p>
                    <p className="text-gray-600 text-[10px] mt-1">{isUrgent ? '⚡ Ending any moment!' : 'Auction ends when timer reaches zero'}</p>
                </motion.div>
            )}

            {isClosed && (
                <div className="px-6 py-4 text-center border-b border-gold/15 bg-gold/5">
                    <p className="text-gold font-serif font-bold text-lg uppercase tracking-wider">🏆 Auction Closed</p>
                    <p className="text-gray-400 text-xs mt-1">
                        Won by {relic.bids?.[0]?.name || 'Unknown'} for {formatPrice(relic.currentPrice)}
                    </p>
                </div>
            )}

            {/* ═══ LIFECYCLE PIPELINE ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 md:px-6 mt-6 mb-8 max-w-3xl mx-auto"
            >
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gold/50" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
                    </svg>
                    <span className="text-gold/50 text-[10px] font-mono tracking-[0.3em] uppercase">Heritage Lifecycle</span>
                </div>

                <div className="relative">
                    {/* Progress bar background */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-navy-700/30 rounded-full" />
                    <div
                        className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-gold to-gold/60 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (currentPhaseIdx / (PHASES.length - 1)) * 100)}%`, maxWidth: 'calc(100% - 2rem)' }}
                    />

                    {/* Phase dots */}
                    <div className="relative flex justify-between">
                        {PHASES.map((p, i) => {
                            const done = i <= currentPhaseIdx;
                            const active = i === currentPhaseIdx;
                            const historyEntry = relic.phaseHistory?.find(h => h.phase === p.key);

                            return (
                                <div key={p.key} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / PHASES.length}%` }}>
                                    <motion.div
                                        animate={active ? { scale: [1, 1.2, 1] } : {}}
                                        transition={active ? { duration: 2, repeat: Infinity } : {}}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${active
                                            ? 'bg-gold/20 border-gold text-gold shadow-[0_0_15px_rgba(201,162,39,0.3)]'
                                            : done
                                                ? 'bg-gold/10 border-gold/40 text-gold/70'
                                                : 'bg-navy-800/50 border-navy-700/30 text-gray-600'
                                            }`}
                                    >
                                        {p.icon}
                                    </motion.div>
                                    <span className={`text-[7px] md:text-[8px] text-center leading-tight uppercase tracking-wider font-bold ${active ? 'text-gold' : done ? 'text-gold/50' : 'text-gray-600'}`}>
                                        {p.label}
                                    </span>
                                    {historyEntry && (
                                        <span className="text-[7px] text-gray-600 text-center leading-tight hidden md:block">
                                            {new Date(historyEntry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* ═══ CONTENT GRID ═══ */}
            <div className="px-4 md:px-6 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── LEFT: Description + Provenance + Bid Card ── */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-5">

                    {/* Description */}
                    <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                        <h2 className="font-serif text-lg text-gold font-bold mb-3 flex items-center gap-2">
                            <span className="text-gold/40">📜</span> Description
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{relic.description}</p>
                    </div>

                    {/* Features */}
                    {relic.features?.length > 0 && (
                        <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                            <h2 className="font-serif text-lg text-gold font-bold mb-3 flex items-center gap-2">
                                <span className="text-gold/40">✦</span> Artifact Features
                            </h2>
                            <ul className="space-y-2">
                                {relic.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-gold/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-400 text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Provenance */}
                    <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                        <h2 className="font-serif text-lg text-gold font-bold mb-3 flex items-center gap-2">
                            <span className="text-gold/40">🔐</span> Provenance
                        </h2>
                        <div className="space-y-2.5">
                            {relic.film && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">Film Origin</span>
                                        <span className="text-gold/80 text-xs font-medium italic">{relic.film}</span>
                                    </div>
                                    <div className="h-px bg-navy-700/20" />
                                </>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-xs">Submitted By</span>
                                <span className="text-cyan-300 text-xs font-medium">{relic.submittedBy || '—'}</span>
                            </div>
                            <div className="h-px bg-navy-700/20" />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-xs">Verified By</span>
                                <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    {relic.verifiedBy || '—'}
                                </span>
                            </div>
                            <div className="h-px bg-navy-700/20" />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-xs">Community Rating</span>
                                <span className="text-gold text-xs font-medium">⭐ {relic.reviewScore || '—'}</span>
                            </div>
                            <div className="h-px bg-navy-700/20" />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-xs">Mandate Registrations</span>
                                <span className="text-gold text-xs font-bold">{relic.mandateCount || 0} collectors</span>
                            </div>
                            {relic.totalPiecesExist && (
                                <>
                                    <div className="h-px bg-navy-700/20" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">Total Pieces in Existence</span>
                                        <span className="text-gold/70 text-xs font-bold">{relic.totalPiecesExist}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bid card — only for bidding phase */}
                    {isLiveBidding && (
                        <div className="rounded-xl border border-gold/15 p-5 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(201,162,39,0.03) 0%, rgba(10,15,30,0.9) 100%)' }}>
                            {/* Success flash */}
                            <AnimatePresence>
                                {justPlaced && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-green-500/10 border-2 border-green-500/30 rounded-xl pointer-events-none z-10"
                                    />
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gold/40">🔨</span>
                                <h2 className="font-serif text-lg text-gold font-bold">Place Bid</h2>
                            </div>

                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Current Bid</p>
                            <motion.p
                                key={relic.currentPrice}
                                initial={{ scale: 1.1, color: '#4ade80' }}
                                animate={{ scale: 1, color: '#C9A227' }}
                                transition={{ duration: 0.5 }}
                                className="text-gold font-serif font-bold text-3xl mb-1"
                            >
                                {formatPrice(relic.currentPrice)}
                            </motion.p>
                            <p className="text-gray-600 text-[10px] mb-4">{relic.bids?.length || 0} total bids</p>

                            <label className="block text-gray-500 text-[10px] uppercase tracking-wider mb-2">Your Bid Amount</label>
                            <input
                                type="number"
                                value={bidInput}
                                onChange={e => setBidInput(e.target.value)}
                                placeholder={`Min: ${formatPrice(nextBid)}`}
                                className="w-full px-4 py-3 bg-navy-800/50 border border-gold/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold/30 transition-all mb-4"
                            />

                            <GoldButton className="w-full text-center justify-center" size="lg" onClick={handlePlaceBid}>
                                PLACE BID {formatPrice(nextBid)}
                            </GoldButton>
                            <p className="text-gray-600 text-[9px] text-center mt-2">
                                {formatPrice(relic.minimumIncrement || Math.ceil(relic.currentPrice * 0.05))} minimum increment
                            </p>
                        </div>
                    )}

                    {/* Pre-auction info cards */}
                    {!isLiveBidding && !isClosed && (
                        <div className="rounded-xl border border-navy-700/30 p-5 text-center" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                            <span className="text-3xl block mb-2">{PHASES[currentPhaseIdx]?.icon}</span>
                            <h3 className="font-serif text-lg text-gold font-bold mb-1">{PHASES[currentPhaseIdx]?.label}</h3>
                            <p className="text-gray-400 text-xs">{PHASES[currentPhaseIdx]?.desc}</p>
                            <div className="mt-4 pt-4 border-t border-navy-700/20">
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Base Price</p>
                                <p className="text-gold/70 font-serif font-bold text-2xl">{formatPrice(relic.basePrice)}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* ── RIGHT: Bids + History ── */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-5">

                    {/* Latest Bids */}
                    {(relic.bids?.length > 0) && (
                        <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-lg text-gold font-bold flex items-center gap-2">
                                    <span className="text-gold/40">💰</span> Latest Bids
                                </h2>
                                {isLiveBidding && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                    </span>
                                )}
                            </div>

                            <div ref={bidsRef} className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scroll">
                                <AnimatePresence initial={false}>
                                    {relic.bids.slice(0, 12).map((bid, index) => (
                                        <motion.div
                                            key={bid.id}
                                            layout
                                            initial={{ opacity: 0, x: 30, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${bid.isNew
                                                ? 'bg-gold/8 border-gold/25 shadow-[0_0_15px_rgba(201,162,39,0.08)]'
                                                : 'bg-navy-800/30 border-navy-700/15 hover:border-gold/15'
                                                } ${bid.name === 'You' ? 'ring-1 ring-gold/30' : ''} ${index === 0 ? 'border-gold/20' : ''}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-800 to-navy-700 flex items-center justify-center text-lg shrink-0">
                                                {bid.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium truncate ${index === 0 ? 'text-gold' : bid.name === 'You' ? 'text-gold' : 'text-gray-200'}`}>
                                                        {bid.name}
                                                    </p>
                                                    {index === 0 && <span className="text-[8px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-full font-bold">HIGHEST</span>}
                                                </div>
                                                <p className="text-gold font-bold text-sm">{formatPrice(bid.amount)}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-600 shrink-0">{timeAgo(bid.time)}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Phase History */}
                    {relic.phaseHistory?.length > 0 && (
                        <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                            <h2 className="font-serif text-lg text-gold font-bold mb-4 flex items-center gap-2">
                                <span className="text-gold/40">📖</span> Artifact Journey
                            </h2>
                            <div className="space-y-0 relative">
                                {/* Vertical line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-gold/15 to-transparent" />

                                {relic.phaseHistory.map((entry, i) => {
                                    const phaseConf = PHASES.find(p => p.key === entry.phase);
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="flex gap-3 py-2.5 relative"
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10 ${i <= currentPhaseIdx ? 'bg-gold/15 border border-gold/30' : 'bg-navy-800/50 border border-navy-700/30'}`}>
                                                {phaseConf?.icon || '•'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${i <= currentPhaseIdx ? 'text-gold/80' : 'text-gray-600'}`}>
                                                    {phaseConf?.label || entry.phase}
                                                </p>
                                                <p className="text-gray-500 text-[10px] mt-0.5">{entry.note}</p>
                                                <p className="text-gray-700 text-[9px] mt-0.5">
                                                    {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
