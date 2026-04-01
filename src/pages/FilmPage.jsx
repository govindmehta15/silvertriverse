import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    COLLECTIBLE_UNITS_PHASES,
    formatPrice,
    formatLargePrice,
    getCollectibleUnit,
    isValidCollectibleCategory,
} from '../data/collectibleUnitsData';
import useCountdown from '../hooks/useCountdown';
import GoldButton from '../components/GoldButton';
import { useToast } from '../context/ToastContext';

/* ─── Sparkline ────────────────────────────────────────────── */
function Sparkline({ data, positive }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const w = 200, h = 60;

    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`);
    const pathData = `M ${pts.join(' L ')}`;
    const areaData = `${pathData} L ${w},${h} L 0,${h} Z`;

    return (
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="shrink-0 drop-shadow-lg" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={positive ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'} />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <motion.path
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                fill="url(#sparkFill)" d={areaData}
            />
            <motion.path
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
                fill="none" stroke={positive ? '#4ade80' : '#f87171'} strokeWidth="2.5" d={pathData}
                filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round"
            />
            {data.map((v, i) => (
                <motion.circle
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 + (i * 0.05) }}
                    cx={(i / (data.length - 1)) * w}
                    cy={h - ((v - min) / range) * h}
                    r="2.5"
                    fill={positive ? '#22c55e' : '#ef4444'}
                    stroke="#0a0f1e"
                    strokeWidth="1.5"
                />
            ))}
        </svg>
    );
}

/* ─── Phase Pipeline ───────────────────────────────────────── */
function PhasePipeline({ currentPhase, phaseHistory }) {
    const currentIdx = COLLECTIBLE_UNITS_PHASES.findIndex(p => p.key === currentPhase);
    return (
        <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-navy-700/30 rounded-full" />
            <div className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-gold to-gold/60 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (currentIdx / (COLLECTIBLE_UNITS_PHASES.length - 1)) * 100)}%`, maxWidth: 'calc(100% - 2rem)' }} />

            <div className="relative flex justify-between">
                {COLLECTIBLE_UNITS_PHASES.map((p, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const entry = phaseHistory?.find(h => h.phase === p.key);
                    return (
                        <div key={p.key} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / COLLECTIBLE_UNITS_PHASES.length}%` }}>
                            <motion.div animate={active ? { scale: [1, 1.15, 1] } : {}} transition={active ? { duration: 2, repeat: Infinity } : {}}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${active ? 'bg-gold/20 border-gold text-gold shadow-[0_0_15px_rgba(201,162,39,0.3)]' : done ? 'bg-gold/10 border-gold/40 text-gold/70' : 'bg-navy-800/50 border-navy-700/30 text-gray-600'}`}>
                                {p.icon}
                            </motion.div>
                            <span className={`text-[7px] md:text-[8px] text-center leading-tight uppercase tracking-wider font-bold ${active ? 'text-gold' : done ? 'text-gold/50' : 'text-gray-600'}`}>{p.label}</span>
                            {entry && <span className="text-[7px] text-gray-600 text-center hidden md:block">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Collectible coin card (Large metallic style) ────────────── */
function CollectibleCoinCard({ coin, onAction }) {
    const rarityStyles = {
        standard: 'from-gray-400 via-gray-200 to-gray-400 border-gray-400/30',
        limited: 'from-cyan-400 via-silver to-cyan-400 border-cyan-400/30',
        collectors: 'from-purple-400 via-gold to-purple-400 border-purple-400/30',
    };

    const isBid = coin.rarity === 'collectors';

    return (
        <motion.div whileHover={{ y: -4 }}
            className="flex flex-col items-center cursor-pointer group w-full relative">

            {/* Coin Graphic */}
            <div className="relative w-full aspect-square max-w-[100px] sm:max-w-[120px] mb-3 mx-auto">
                {/* Outer metallic rim */}
                <div className={`absolute inset-0 rounded-full p-[3px] bg-gradient-to-br ${rarityStyles[coin.rarity] || rarityStyles.standard} shadow-[0_4px_15px_rgba(0,0,0,0.5)]`}>
                    {/* Inner recessed area */}
                    <div className="w-full h-full rounded-full bg-navy-900 overflow-hidden relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] border border-black pb-1">
                        {/* Inner metallic ring border (simulated) */}
                        <div className="absolute inset-1 rounded-full border-2 border-white/10 pointer-events-none z-10" />

                        {/* Coin image with metallic overlay */}
                        <img src={coin.image} alt={coin.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" style={{ filter: 'grayscale(30%) contrast(120%)' }} />

                        {/* Metallic sheen overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Coin Details */}
            <div className="text-center px-1 w-full">
                <h3 className="text-white text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase mb-0.5 truncate" title={coin.name}>{coin.name}</h3>
                <p className="text-gray-400 text-[9px] font-mono mb-2">Quantity: {coin.edition}</p>

                {/* Make Bid / Buy Button */}
                <button onClick={() => onAction(coin)} className="w-full py-2 bg-gradient-to-b from-navy-800 to-navy-950 border border-navy-600 rounded-md text-white/90 text-[9px] sm:text-[10px] font-bold tracking-wider hover:border-gold/50 hover:text-white transition-colors mb-1 shadow-[inset_0_1px_rgba(255,255,255,0.1)] relative z-20 pointer-events-auto">
                    {isBid ? 'MAKE BID' : 'BUY NOW'}
                </button>

                {/* Price */}
                <p className="text-gray-300 font-mono text-[10px] sm:text-xs mt-1">{formatPrice(coin.price)}</p>
            </div>
        </motion.div>
    );
}

function TokenPurchase({ unit, onBuy }) {
    const [amount, setAmount] = useState(1);
    const { addToast } = useToast();

    const handleBuy = () => {
        if (amount > unit.tokensAvailable) {
            addToast('Not enough tokens available.', 'error');
            return;
        }
        addToast(`Successfully purchased ${amount} units of ${unit.title}!`, 'success');
        onBuy(amount);
        setAmount(1);
    };

    return (
        <div className="rounded-xl border border-navy-700/30 p-5 mt-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
            <h2 className="font-serif text-xl text-white tracking-widest text-center mb-6">{unit.title}</h2>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative">
                <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-navy-600/50 to-transparent -translate-x-1/2" />
                <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Total Limit</p>
                    <p className="font-mono text-xl sm:text-2xl text-white tracking-wider">{unit.totalTokens.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Tokens Sold</p>
                    <p className="font-mono text-xl sm:text-2xl text-white tracking-wider">{unit.tokensSold.toLocaleString()}</p>
                </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-6 bg-navy-900 border border-navy-700/50 rounded-lg p-2 max-w-[200px] mx-auto">
                <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-8 h-8 rounded flex items-center justify-center bg-navy-800 text-gray-400 hover:text-white">-</button>
                <div className="flex-1 text-center">
                    <span className="text-[10px] text-gray-500 uppercase block leading-none mb-1">Qty</span>
                    <span className="font-mono text-lg font-bold text-white leading-none">{amount}</span>
                </div>
                <button onClick={() => setAmount(Math.min(unit.tokensAvailable, amount + 1))} className="w-8 h-8 rounded flex items-center justify-center bg-navy-800 text-gray-400 hover:text-white">+</button>
            </div>

            {/* Main Action */}
            <div className="flex flex-col items-center border-t border-navy-700/30 pt-6">
                <button onClick={handleBuy} disabled={unit.tokensAvailable === 0} className="relative group mb-3 w-3/4 max-w-[250px]">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-500" />
                    <div className="relative w-full px-6 py-3 bg-gradient-to-b from-navy-800 to-navy-900 border border-gold/40 rounded-lg shadow-[inset_0_1px_rgba(255,255,255,0.1)]">
                        <span className="font-serif text-white tracking-[0.2em] text-sm font-bold text-center block">
                            {unit.tokensAvailable === 0 ? 'SOLD OUT' : `BUY ${amount} UNITS`}
                        </span>
                    </div>
                </button>
                <p className="text-gray-300 text-xs font-mono">Total: {formatPrice(amount * unit.tokenPrice)}</p>
            </div>

            {/* Benefits border */}
            <div className="mt-6 pt-4 border-t border-navy-700/30">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">Holder Benefits</p>
                <ul className="space-y-1.5">
                    {unit.benefits?.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-300">
                            <span className="text-green-400 mt-0.5">✓</span> {b}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/* ─── Masterpiece Section ──────────────────────────────────── */
function MasterpieceSection({ mp }) {
    const { formatted, isUrgent } = useCountdown(mp.endTime);
    const [bidInput, setBidInput] = useState('');
    const { addToast } = useToast();

    const handleBid = () => {
        const amount = Number(bidInput);
        if (!amount || amount <= mp.currentBid) {
            addToast('Bid must be higher than current bid', 'error');
            return;
        }
        addToast(`Bid of ${formatPrice(amount)} placed! ⚡`, 'success');
        setBidInput('');
    };

    if (!mp) return null;

    return (
        <div className="rounded-xl border border-gold/20 overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(201,162,39,0.04) 0%, rgba(10,15,30,0.95) 100%)' }}>
            <div className="relative aspect-video overflow-hidden">
                <img src={mp.image} alt={mp.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <div className="absolute top-3 left-3">
                    <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 backdrop-blur-sm">✦ ULTRA RARE · 1 of 1</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-serif text-xl text-white font-bold">{mp.title}</h3>
                    <p className="text-gray-400 text-[10px] mt-1 line-clamp-2">{mp.description}</p>
                </div>
            </div>
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Current Bid</p>
                        <p className="text-gold font-serif font-bold text-xl">{formatPrice(mp.currentBid)}</p>
                        <p className="text-gray-600 text-[9px]">{mp.totalBids} bids placed</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Time Left</p>
                        <motion.p animate={isUrgent ? { scale: [1, 1.05, 1] } : {}} transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
                            className={`font-mono text-lg font-bold ${isUrgent ? 'text-red-400' : 'text-gold'}`}>
                            {formatted}
                        </motion.p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="number" value={bidInput} onChange={e => setBidInput(e.target.value)}
                        placeholder={`Min: ${formatPrice(mp.currentBid + 1000)}`}
                        className="flex-1 px-3 py-2 bg-navy-800/50 border border-gold/10 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold/30 text-xs" />
                    <GoldButton onClick={handleBid} size="sm">BID NOW</GoldButton>
                </div>
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════ */
/*                     MAIN DETAIL PAGE                         */
/* ═════════════════════════════════════════════════════════════ */
export default function FilmPage() {
    const { category, id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [unit, setUnit] = useState(null);

    useEffect(() => {
        if (!category || !isValidCollectibleCategory(category)) {
            setUnit(null);
            return;
        }
        const base = getCollectibleUnit(category, id);
        setUnit(base ? { ...base } : null);
    }, [category, id]);

    if (!unit) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Collectible not found.</p>
            </div>
        );
    }

    const categorySubtitle =
        category === 'film' ? 'Film Collectible Units' : category === 'sports' ? 'Sports Collectible Units' : 'Brand Collectible Units';

    const metaRows =
        category === 'sports' && unit.context
            ? [
                  { label: 'League / Series', value: unit.context.league },
                  { label: 'Team / Franchise', value: unit.context.team },
                  { label: 'Sport', value: unit.context.sport },
                  { label: 'Season', value: unit.context.season },
              ]
            : category === 'brand' && unit.context
              ? [
                    { label: 'Sector', value: unit.context.sector },
                    { label: 'House / Company', value: unit.context.company },
                    { label: 'Campaign', value: unit.context.campaign },
                    { label: 'Window', value: unit.context.window },
                ]
              : [
                    { label: 'Director', value: unit.director },
                    { label: 'Studio', value: unit.studio },
                    { label: 'Genre', value: unit.genre },
                    { label: 'Release', value: unit.releaseDate },
                ];

    const budgetLabel = category === 'film' ? 'Production Budget' : category === 'sports' ? 'Event & Ops Budget' : 'Launch & Program Budget';
    const revenueNote =
        category === 'film'
            ? 'Net profit distributed to token holders upon exit phase completion.'
            : 'Net proceeds allocated per series rules at exit / settlement.';

    const isPositive = unit.priceChange >= 0;

    const handleBuyTokens = (amount) => {
        setUnit(prev => {
            // slightly increase token price for visual effect
            const priceIncrease = amount * (Math.random() * 0.05 + 0.02);
            const newPrice = prev.tokenPrice + priceIncrease;

            // push new price to history, cap history to keep it tidy
            let newHistory = [...prev.tokenPriceHistory, newPrice];
            if (newHistory.length > 25) newHistory = newHistory.slice(newHistory.length - 25);

            // extra backing boosts projected revenue
            const addedRev = amount * prev.tokenPrice * (Math.random() * 2 + 1);

            return {
                ...prev,
                tokensSold: prev.tokensSold + amount,
                tokensAvailable: prev.tokensAvailable - amount,
                tokenPrice: newPrice,
                tokenPriceHistory: newHistory,
                projectedRevenue: prev.projectedRevenue + addedRev,
                priceChange: parseFloat((prev.priceChange + 0.1).toFixed(2))
            };
        });
    };

    const handleCoinAction = (coin) => {
        if (coin.rarity === 'collectors') {
            addToast(`Bid of ${formatPrice(coin.price)} placed for ${coin.name}! ⚡`, 'success');
        } else {
            // Actual purchase
            const existingCoins = JSON.parse(localStorage.getItem('user_coins') || '[]');
            const newCoinRecord = {
                ...coin,
                date: Date.now()
            };
            existingCoins.push(newCoinRecord);
            localStorage.setItem('user_coins', JSON.stringify(existingCoins));
            addToast(`Successfully purchased ${coin.name}! It's now on your Digital Shelf. 🪙`, 'success');
        }
    };

    return (
        <div className="min-h-screen pb-8 relative">
            <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate('/collectible-units')}
                className="fixed top-4 left-4 lg:left-[17rem] z-50 w-10 h-10 rounded-full bg-navy-900/80 backdrop-blur-md border border-gold/15 flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/40 transition-all shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>

            {/* ═══ HERO ═══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <div className="aspect-[16/9] max-h-[50vh] overflow-hidden">
                    <img src={unit.banner} alt={unit.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-navy-950/20" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <h1 className="font-serif text-3xl md:text-5xl font-bold text-white uppercase tracking-widest text-shadow-lg shadow-black mt-8">
                        {unit.title}
                    </h1>
                    <p className="text-gold/80 text-xs md:text-sm mt-2 uppercase tracking-[0.2em] font-medium">{categorySubtitle}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </motion.div>

            {/* ═══ TOKEN METRICS BAR ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="px-4 md:px-6 py-4 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Token Price', value: formatPrice(unit.tokenPrice), sub: `${isPositive ? '+' : ''}${unit.priceChange}%`, subColor: isPositive ? 'text-green-400' : 'text-red-400' },
                        { label: 'Market Cap', value: formatLargePrice(unit.marketCap), sub: `${unit.totalTokens.toLocaleString()} tokens` },
                        { label: 'Proj. Revenue', value: formatLargePrice(unit.projectedRevenue), sub: `Budget: ${formatLargePrice(unit.productionBudget)}`, subColor: 'text-gray-400' },
                        { label: 'Est. Return (ROI)', value: unit.currentROI, sub: unit.phase === 'exit' ? 'Finalized' : 'Projected', subColor: unit.currentROI.startsWith('+') ? 'text-green-400' : 'text-yellow-400' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-lg border border-navy-700/20 p-3" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                            <p className="text-gray-500 text-[9px] uppercase tracking-wider">{s.label}</p>
                            <p className={`font-mono font-bold text-sm mt-1 ${s.subColor && s.label === 'Est. Return (ROI)' ? s.subColor : 'text-white'}`}>{s.value}</p>
                            {s.sub && <p className={`text-[9px] mt-0.5 ${s.label !== 'Est. Return (ROI)' ? s.subColor : 'text-gray-500'}`}>{s.sub}</p>}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ═══ PRICE CHART ═══ */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="px-4 md:px-6 mb-6 max-w-4xl mx-auto">
                <div className="rounded-xl border border-navy-700/20 p-4" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-xs uppercase tracking-wider">Token Price History</h3>
                        <span className={`font-mono text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPrice(unit.tokenPrice)}
                        </span>
                    </div>
                    <Sparkline data={unit.tokenPriceHistory} positive={isPositive} />
                </div>
            </motion.div>

            {/* ═══ LIFECYCLE PIPELINE ═══ */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="px-4 md:px-6 mb-8 max-w-4xl mx-auto">
                <PhasePipeline currentPhase={unit.phase} phaseHistory={unit.phaseHistory} />
            </motion.div>

            {/* ═══ CONTENT GRID ═══ */}
            <div className="px-4 md:px-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LEFT: Film Details & Token Purchase */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">

                    <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                        <h2 className="font-serif text-lg text-gold font-bold mb-3 flex items-center gap-2">
                            <span className="text-gold/40">📜</span> About
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">{unit.description}</p>

                        <div className="space-y-2 pt-4 border-t border-navy-700/30">
                            {metaRows.map((row, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{row.label}</span>
                                    <span className="text-gray-200 font-medium">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TokenPurchase unit={unit} onBuy={handleBuyTokens} />

                    {/* Performance & P&L breakdown */}
                    <div className="rounded-xl border border-navy-700/30 p-5" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                        <h2 className="font-serif text-lg text-gold font-bold mb-4 flex items-center gap-2">
                            <span className="text-gold/40">📊</span> P&L Projections
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{budgetLabel}</p>
                                    <p className="font-mono text-sm text-white">{formatLargePrice(unit.productionBudget)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Proj. Revenue</p>
                                    <p className="font-mono text-sm text-green-400">{formatLargePrice(unit.projectedRevenue)}</p>
                                </div>
                            </div>
                            <div className="h-2 flex rounded-full overflow-hidden bg-navy-800">
                                <div className="h-full bg-red-500/80" style={{ width: `${(unit.productionBudget / (unit.productionBudget + unit.projectedRevenue)) * 100}%` }} title="Budget" />
                                <div className="h-full bg-green-500/80" style={{ width: `${(unit.projectedRevenue / (unit.productionBudget + unit.projectedRevenue)) * 100}%` }} title="Revenue" />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center">{revenueNote}</p>
                        </div>
                    </div>

                </motion.div>

                {/* RIGHT: Silver Coins & Masterpiece */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-6">

                    {/* Collectible Coins */}
                    <div className="rounded-xl border border-navy-700/30 p-5 mt-6" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(10,15,30,0.8) 100%)' }}>
                        <h2 className="font-serif text-lg text-gold font-bold mb-4 flex items-center gap-2">
                            <span className="text-gold/40">🪙</span> {category === 'film' ? 'Collectible Coins' : 'Themed Collectibles'}
                        </h2>
                        <p className="text-[11px] text-gray-400 mb-6">
                            {category === 'film'
                                ? 'Bid on exclusive themed collectible coins. Ships to your registered address.'
                                : 'Bid on exclusive themed collectibles. Ships to your registered address where applicable.'}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {unit.silverCoins.map((coin) => (
                                <CollectibleCoinCard key={coin.id} coin={coin} onAction={handleCoinAction} />
                            ))}
                        </div>
                    </div>

                    {/* Masterpiece */}
                    {unit.masterpiece && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gold/50 text-sm">✦</span>
                                <h2 className="font-serif text-lg text-gold font-bold">Ultra-Rare Masterpiece</h2>
                            </div>
                            <MasterpieceSection mp={unit.masterpiece} />
                        </div>
                    )}

                </motion.div>
            </div>
        </div>
    );
}
