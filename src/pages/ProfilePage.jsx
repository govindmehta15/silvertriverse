import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { mockUsers } from '../mock/mockUsers';
import StatsCard from '../components/StatsCard';
import RoleGuard from '../components/RoleGuard';
import { getData, setData } from '../utils/storageService';
import { dispatchNotification, NotificationTypes } from '../utils/notificationDispatcher';
import { premiumMerchandise, dailyMerchandise } from '../data/merchandiseData';
import { getThemeById, DEFAULT_THEME_ID, PROFILE_THEMES, FALLBACK_PAGE_BACKGROUND, FALLBACK_COVER_BLEND } from '../data/profileThemes';

const userProfileFallback = {
    club: 'Cinema Club 47',
    tags: 23,
    roles: ['Film Enthusiast', 'Collector']
};

const getPrestigeRank = (user) => {
    if (!user) return { name: 'Unranked', color: 'text-gray-500', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };

    const relicsPts = (user.ownedRelics?.length || 0) * 100;
    const cardsPts = (user.ownedCards?.length || 0) * 50;
    const merchPts = (user.purchasedItems?.length || 0) * 150;
    const totalScore = (user.participationScore || 0) + relicsPts + cardsPts + merchPts;

    if (totalScore >= 3000) return { name: 'Legendary', color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500/40', shadow: 'shadow-glow-rare' };
    if (totalScore >= 1500) return { name: 'Gold', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/40', shadow: 'shadow-glow-gold' };
    if (totalScore >= 500) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-700/50', border: 'border-gray-400/50', shadow: '' };
    return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700/50', shadow: '' };
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
};

export default function ProfilePage() {
    const { user, updateRole } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('Shelf');
    const [orders, setOrders] = useState([]);
    const [coins, setCoins] = useState([]);
    const [bellRung, setBellRung] = useState(false);

    // Determine if we're viewing another user's profile
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const viewingUserId = searchParams.get('user');

    const allUsers = useMemo(() => {
        const saved = getData('users');
        return (saved && saved.length > 0) ? saved : mockUsers;
    }, []);

    const viewedUser = useMemo(() => {
        return viewingUserId ? allUsers.find(u => u.id === viewingUserId) : null;
    }, [viewingUserId, allUsers]);

    const profileUser = viewedUser || user;
    const isOwnProfile = !viewedUser || viewedUser.id === user?.id;

    // Theme: eligibility (sponsor = owns ≥1 plot, winner = isWinner)
    const ownershipList = getData('silvertriverse_plots_ownership') || [];
    const ownedPlotsCount = ownershipList.filter((r) => r.ownerId === profileUser?.id).length;
    const isSponsor = ownedPlotsCount >= 1;
    const canUsePremium = isSponsor || !!profileUser?.isWinner;
    const storedThemeId = getData(`silvertriverse_profile_theme_${profileUser?.id}`) || DEFAULT_THEME_ID;
    const themeForStored = getThemeById(storedThemeId);
    const effectiveThemeId = themeForStored.premium && !canUsePremium ? DEFAULT_THEME_ID : storedThemeId;
    const activeTheme = getThemeById(effectiveThemeId);

    const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
    const [, setThemeRefresh] = useState(0);
    const setProfileTheme = (themeId) => {
        if (!user?.id) return;
        setData(`silvertriverse_profile_theme_${user.id}`, themeId);
        setThemeRefresh((n) => n + 1);
        setThemeSelectorOpen(false);
    };

    const handleRingBell = () => {
        if (!user || !viewedUser || bellRung) return;
        dispatchNotification(
            viewedUser.id,
            NotificationTypes.NEW_FOLLOWER,
            `${user.name} wants to collaborate with you! 🔔`
        );
        addToast(`Collaboration request sent to ${viewedUser.name}!`, 'success');
        setBellRung(true);
    };

    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        setOrders(storedOrders);
        const storedCoins = JSON.parse(localStorage.getItem('user_coins') || '[]');
        setCoins(storedCoins);
    }, []);

    const stats = [
        { label: 'Followers', value: profileUser?.followers || 0, icon: '👥' },
        { label: 'Participation Level', value: profileUser?.participationScore || 0, icon: '⭐' },
        { label: 'Relics Owned', value: profileUser?.ownedRelics?.length || 0, icon: '🏛️' },
        { label: 'Purchases (Orders)', value: isOwnProfile ? (orders.length || 0) : '—', icon: '🛍️' },
    ];

    const displayRoles = profileUser?.role === 'creator' ? ['Creator', 'Director'] : profileUser?.role === 'professional' ? ['Professional', 'Studio Exec'] : ['Fan', 'Collector'];

    const prestige = getPrestigeRank(profileUser);

    // Derived Data
    const userPosts = useMemo(() => {
        if (!profileUser || !profileUser.id) return [];
        const groups = getData('communities_v2') || [];
        let posts = [];
        groups.forEach(g => {
            (g.posts || []).forEach(p => {
                if (p.authorId === profileUser.id) {
                    posts.push({ ...p, groupName: g.name });
                }
            });
        });
        return posts.sort((a, b) => b.timestamp - a.timestamp);
    }, [profileUser]);

    // Shelf items aggregation
    const { premiumItems, dailyItems, otherItems, totalCollectibles } = useMemo(() => {
        if (!profileUser || !profileUser.id) return { premiumItems: [], dailyItems: [], otherItems: [], totalCollectibles: 0 };
        const premium = [];
        const daily = [];
        const other = [];
        let total = 0;

        // If viewing own profile and have live orders, prioritize orders. Otherwise fallback to mock purchasedItems.
        if (isOwnProfile && orders.length > 0) {
            orders.forEach(order => {
                order.items.forEach(item => {
                    total++;
                    if (item.type === 'Premium') {
                        premium.push(item);
                    } else {
                        daily.push(item);
                    }
                });
            });
        } else if (profileUser.purchasedItems) {
            profileUser.purchasedItems.forEach(itemId => {
                total++;
                const yMatch = premiumMerchandise.find(m => m.id === itemId);
                const oMatch = dailyMerchandise.find(m => m.id === itemId);
                if (yMatch) {
                    premium.push({ name: yMatch.title, image: yMatch.images[0], serialNumber: yMatch.serialNumber, digitalTwinId: yMatch.digitalTwinId, type: 'Premium' });
                } else if (oMatch) {
                    daily.push({ name: oMatch.title, image: oMatch.images[0], type: 'Daily' });
                }
            });
        }

        // Relics 
        (profileUser.ownedRelics || []).forEach(rId => {
            total++;
            other.push({ type: 'Relic', name: `Relic #${rId}`, image: '/images/scifi_weapon.png' });
        });

        // Collectible Coins (from localStorage if own profile, else mock it if available on user)
        if (isOwnProfile) {
            coins.forEach((coin) => {
                total++;
                other.push({ type: 'Collectible Coin', name: coin.name, image: coin.image });
            });
        } else if (profileUser.coins) {
            profileUser.coins.forEach((coin) => {
                total++;
                other.push({ type: 'Collectible Coin', name: coin.name, image: coin.image });
            });
        }

        // Verse Cards
        (profileUser.ownedCards || []).forEach(cId => {
            total++;
            other.push({ type: 'Verse Card', name: `Card ${cId}`, image: '/images/ancient_book.png' });
        });

        return { premiumItems: premium, dailyItems: daily, otherItems: other, totalCollectibles: total };
    }, [profileUser, orders, coins, isOwnProfile]);

    const activityHistory = useMemo(() => {
        const history = [];
        userPosts.forEach(p => {
            history.push({ id: p.id, action: `Posted in ${p.groupName}`, target: p.content.substring(0, 30) + '...', date: p.timestamp });
        });

        if (isOwnProfile) {
            orders.forEach(o => {
                history.push({ id: o.orderId, action: `Purchased Merchandise`, target: `${o.items.length} items`, date: new Date(o.date).getTime() });
            });
            coins.forEach(c => {
                history.push({ id: `coin-${c.id}-${c.date}`, action: `Acquired Collectible Coin`, target: c.name, date: c.date });
            });

            // Render placed bids globally found from localStorage
            const bids = getData('user_bids') || [];
            bids.forEach(b => {
                history.push({ id: b.id, action: `Placed Bid`, target: `${b.relicName} (₹${b.amount.toLocaleString('en-IN')})`, date: b.timestamp });
            });
        }

        return history.sort((a, b) => b.date - a.date);
    }, [userPosts, orders, coins, isOwnProfile]);

    const [coverScroll, setCoverScroll] = useState(0);
    useEffect(() => {
        const onScroll = () => setCoverScroll(Math.min(window.scrollY, 120));
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const { login } = useAuth();
    const overlayOpacity = 1 - (coverScroll / 120) * 0.4;

    if (!profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center bg-navy-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-luxury p-8 max-w-sm w-full border border-navy-700 shadow-2xl"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-800 to-navy-700 mx-auto flex items-center justify-center text-3xl mb-6 shadow-glow-rare border border-gold/20">
                        👤
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-white mb-2 tracking-wide">GUEST PROFILE</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">Access the Film Cultural Universe by selecting a profile below.</p>

                    <div className="space-y-3">
                        {mockUsers.map(u => (
                            <button
                                key={u.id}
                                onClick={() => login(u.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-navy-800/80 border border-navy-700/50 rounded-xl hover:border-gold/30 hover:bg-navy-800 transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-full border border-gold/10 group-hover:border-gold/30 flex items-center justify-center text-lg bg-navy-900 transition-colors">{u.avatar}</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-200 group-hover:text-gold transition-colors">{u.name}</p>
                                    <p className="text-[10px] text-gold uppercase tracking-widest opacity-80">{u.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <Link
                        to="/"
                        className="block mt-8 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    const pageBg = activeTheme.pageBackground || FALLBACK_PAGE_BACKGROUND;
    const coverBlend = activeTheme.coverBlend || FALLBACK_COVER_BLEND;
    const transitionPreset = activeTheme.transitionPreset || 'smooth';
    const hoverTransition = transitionPreset === 'spring'
        ? { type: 'spring', stiffness: 400, damping: 25 }
        : transitionPreset === 'subtle'
            ? { type: 'tween', duration: 0.15 }
            : { type: 'tween', duration: 0.2 };

    return (
        <div className="min-h-screen pb-4 transition-colors duration-300" style={{ background: pageBg }}>
            {/* Cover + Avatar */}
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={hoverTransition}
                    className="h-48 md:h-64 overflow-hidden"
                    style={{ background: activeTheme.cover }}
                >
                    <img src='/images/profile_cover.png' alt="Cover" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 transition-opacity duration-200" style={{ background: coverBlend }} />
                    <div
                        className="absolute inset-0 transition-opacity duration-200"
                        style={{
                            backgroundColor: activeTheme.coverOverlay,
                            opacity: overlayOpacity,
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="absolute bottom-0 left-6 translate-y-1/2"
                >
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-navy-900 shadow-glow-gold relative group">
                        <img src={profileUser?.avatar || '/images/profile_avatar.png'} alt={profileUser?.name} className="w-full h-full object-cover" />

                        <RoleGuard allowedRoles={['creator', 'professional']}>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-navy-900 flex items-center justify-center shadow-lg" title="Verified status">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        </RoleGuard>
                    </div>
                </motion.div>
            </div>

            {/* Profile Info */}
            <div className="px-6 mt-16">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-3">
                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">{profileUser?.name}</h1>

                        {/* Collaboration Bell — visible when viewing another user */}
                        {!isOwnProfile && (
                            <motion.button
                                whileHover={{ rotate: [0, -15, 15, -10, 10, 0] }}
                                transition={{ duration: 0.6 }}
                                onClick={handleRingBell}
                                disabled={bellRung}
                                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${bellRung
                                    ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                    : 'bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20'
                                    }`}
                            >
                                <span className="text-lg">{bellRung ? '✓' : '🔔'}</span>
                                {bellRung ? 'Request Sent' : 'Ring for Collaboration'}
                            </motion.button>
                        )}

                        {/* Interactive Role Switcher — only for own profile or simulation purposes */}
                        {isOwnProfile && (
                            <div className="relative ml-auto">
                                <select
                                    value={profileUser?.role || 'fan'}
                                    onChange={(e) => updateRole(e.target.value)}
                                    className="appearance-none bg-navy-800 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider py-1.5 pl-3 pr-8 rounded-full outline-none focus:ring-1 focus:ring-gold/50 cursor-pointer shadow-glow-gold"
                                >
                                    <option value="fan">Fan level</option>
                                    <option value="creator">Creator level</option>
                                    <option value="professional">Pro level</option>
                                </select>
                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        {profileUser?.role === 'professional' ? 'Horizon Studios' : userProfileFallback.club}
                    </p>
                    {profileUser?.bioLink && (
                        <a href={`https://${profileUser.bioLink}`} target="_blank" rel="noopener noreferrer" className="text-teal-400 text-xs font-bold hover:underline flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            {profileUser.bioLink}
                        </a>
                    )}
                    {profileUser?.bio && (
                        <p className="text-gray-300 text-sm mt-3 max-w-xl leading-relaxed">
                            {profileUser?.bio}
                        </p>
                    )}
                    <div className="mt-5 flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={hoverTransition}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${activeTheme.badgeClass}`}
                        >
                            {profileUser?.totalPosts || 0} CONTRIBUTIONS
                        </motion.div>
                        <div className="flex-1 max-w-[200px] h-1.5 bg-navy-900 rounded-full overflow-hidden border border-navy-700/50">
                            <div className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full" style={{ width: `${profileUser?.rankProgress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gold font-bold">{profileUser?.rankProgress || 0}% to next tier</span>
                    </div>
                    {/* Prestige Rank + Landholder badge */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 }}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${prestige.bg} ${prestige.border} ${prestige.shadow}`}
                        >
                            <span className="text-sm">🏆</span>
                            <span className={`text-sm font-bold uppercase tracking-widest ${prestige.color}`}>
                                {prestige.name} Rank
                            </span>
                        </motion.div>
                        {isSponsor && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${activeTheme.badgeClass}`}
                            >
                                🗺️ Landholder
                            </motion.span>
                        )}
                        {isOwnProfile && (
                            <button
                                type="button"
                                onClick={() => setThemeSelectorOpen(true)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${activeTheme.buttonClass}`}
                            >
                                Theme: {activeTheme.name}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Role Tags */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-2 mt-5"
                >
                    {displayRoles.map((role) => (
                        <span
                            key={role}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 hover:opacity-90 ${activeTheme.cardClass}`}
                        >
                            {role}
                        </span>
                    ))}
                </motion.div>

                {/* Collector Identity Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, ...hoverTransition }}
                    whileHover={{ scale: 1.01 }}
                    className={`mt-8 p-6 md:p-8 rounded-xl relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-between ${activeTheme.cardClass} hover:shadow-lg transition-shadow duration-200`}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex-1 space-y-2 z-10 w-full text-center md:text-left">
                        <p className="text-gold/80 text-[10px] uppercase tracking-widest font-bold">Collector Identity Card</p>
                        <h3 className="text-2xl font-serif text-white tracking-wide">ID: {profileUser?.id || 'Unknown'}</h3>
                        <p className="text-zinc-400 text-sm">Authenticated Member of the Film Cultural Universe</p>
                    </div>

                    <div className="flex gap-4 md:gap-8 bg-zinc-900/80 p-5 rounded-lg border border-zinc-800 backdrop-blur-md z-10 w-full md:w-auto justify-center">
                        <div className="text-center">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 block">Collectibles</p>
                            <p className="font-mono text-xl text-white block">{totalCollectibles}</p>
                        </div>
                        <div className="w-px bg-zinc-800" />
                        <div className="text-center">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 block">Prestige Rank</p>
                            <p className={`font-mono text-xl font-bold block ${prestige.color}`}>{prestige.name}</p>
                        </div>
                        <div className="w-px bg-zinc-800" />
                        <div className="text-center">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 block">Participation</p>
                            <p className="font-mono text-xl text-gold block">{profileUser?.participationScore || 0}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 border-b border-navy-700 flex gap-6"
                >
                    {['Shelf', 'Posts', 'Activity History'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${activeTab === tab ? activeTheme.accentClass : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="profileTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-80" />
                            )}
                        </button>
                    ))}
                </motion.div>

                <div className="mt-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Shelf' && (
                            <motion.div
                                key="shelf"
                                variants={container}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                {/* Premium Collection */}
                                <div>
                                    <h3 className="text-gold font-serif text-2xl mb-6 flex items-center gap-3">
                                        <span className="text-xl">✧</span> Premium Collection <span className="text-zinc-500 font-sans text-xs uppercase tracking-widest">/ SILVERTRIVERSE</span>
                                    </h3>
                                    {premiumItems.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800 text-sm uppercase tracking-widest">No premium artifacts acquired.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {premiumItems.map((item, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={hoverTransition}
                                                    className={`flex flex-col sm:flex-row gap-6 p-4 rounded-xl relative overflow-hidden group ${activeTheme.cardClass}`}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gold/5 pointer-events-none opacity-50" />
                                                    <div className="w-full sm:w-1/3 aspect-square bg-zinc-950 rounded-lg p-4 flex items-center justify-center shrink-0 border border-zinc-800 relative z-10">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 py-2 flex flex-col justify-center relative z-10">
                                                        <h4 className="font-serif text-lg text-white mb-2 line-clamp-1">{item.name}</h4>

                                                        <div className="grid grid-cols-2 gap-y-4 mb-4">
                                                            <div>
                                                                <p className="text-zinc-500 text-[9px] uppercase tracking-widest mb-1">Serial Number</p>
                                                                <p className="font-mono text-gold text-xs">{item.serialNumber}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-zinc-500 text-[9px] uppercase tracking-widest mb-1">Authenticity ID</p>
                                                                <p className="font-mono text-cyan-400 text-xs line-clamp-1 pr-2">{item.digitalTwinId}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto flex gap-3">
                                                            <button className="flex-1 py-2 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold/10 transition-colors">
                                                                View Booklet
                                                            </button>
                                                            <div className="w-10 h-10 border border-gold bg-gold/10 text-gold flex items-center justify-center shadow-[0_0_10px_rgba(201,162,39,0.2)] rounded-sm shrink-0" title="Prestige Badge">
                                                                ♛
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Daily Collection */}
                                <div>
                                    <h3 className="text-white font-serif text-xl mb-6 flex items-center gap-3">
                                        <span className="text-lg text-blue-500">※</span> Daily Wear <span className="text-zinc-500 font-sans text-xs uppercase tracking-widest">/ OURS</span>
                                    </h3>
                                    {dailyItems.length === 0 ? (
                                        <p className={`text-gray-500 text-center py-8 rounded-xl border border-dashed text-sm uppercase tracking-widest ${activeTheme.cardClass}`}>No daily items acquired.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {dailyItems.map((item, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={hoverTransition}
                                                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${activeTheme.cardClass}`}
                                                >
                                                    <div className="w-16 h-16 rounded-md p-1 shrink-0 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain filter mix-blend-multiply drop-shadow-sm" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">{item.name}</h4>
                                                        <button className="text-blue-400 text-[10px] uppercase font-bold tracking-wider hover:text-white">View Story</button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Virtual Items */}
                                <div>
                                    <h3 className="text-white font-serif text-xl mb-6">Virtual Inventory</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {otherItems.length === 0 ? (
                                            <p className={`col-span-full text-gray-500 text-center py-8 rounded-xl border border-dashed text-sm uppercase tracking-widest ${activeTheme.cardClass}`}>Shelf is empty.</p>
                                        ) : (
                                            otherItems.map((shelfItem, index) => (
                                                <motion.div
                                                    key={index}
                                                    variants={item}
                                                    whileHover={{ scale: 1.02, zIndex: 10 }}
                                                    transition={hoverTransition}
                                                    className={`group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer aspect-square flex flex-col items-center justify-center p-2 ${activeTheme.cardClass}`}
                                                >
                                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-navy-900/80 text-teal-400 border border-teal-500/40 z-10">
                                                        {shelfItem.type}
                                                    </div>
                                                    <img src={shelfItem.image} alt={shelfItem.name} className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    {/* Gradient overlay for text visibility */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 to-transparent pt-12 pb-3 px-3">
                                                        <p className="text-white font-bold text-xs truncate drop-shadow-md">{shelfItem.name}</p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Posts' && (
                            <motion.div
                                key="posts"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {userPosts.length === 0 ? (
                                    <p className={`text-gray-500 text-center py-12 rounded-xl border border-dashed ${activeTheme.cardClass}`}>No community posts yet.</p>
                                ) : (
                                    userPosts.map(post => (
                                        <motion.div
                                            key={post.id}
                                            whileHover={{ scale: 1.01 }}
                                            transition={hoverTransition}
                                            className={`p-4 rounded-xl border ${activeTheme.cardClass}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">{post.groupName}</span>
                                                <span className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.content}</p>
                                            <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                                <span>💬 {post.comments?.length || 0} Replies</span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'Activity History' && (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                whileHover={{ scale: 1.005 }}
                                transition={hoverTransition}
                                className={`rounded-xl border p-6 transition-shadow duration-200 ${activeTheme.cardClass}`}
                            >
                                {activityHistory.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6">No recent activity.</p>
                                ) : (
                                    <div className="relative border-l border-navy-600 ml-3 space-y-6">
                                        {activityHistory.map((act, i) => (
                                            <div key={i} className="pl-6 relative">
                                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold shadow-glow-gold" />
                                                <p className="text-sm text-gray-300 font-medium">{act.action}</p>
                                                <p className="text-sm text-gray-500 my-0.5">{act.target}</p>
                                                <p className="text-xs text-gray-600">{new Date(act.date).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Theme selector modal (own profile only) */}
            <AnimatePresence>
                {themeSelectorOpen && isOwnProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setThemeSelectorOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-navy-900 border border-navy-600 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
                        >
                            <h3 className="font-serif text-lg font-bold text-white mb-1">Profile theme</h3>
                            <p className="text-gray-500 text-sm mb-4">Choose a theme. Premium themes require owning a plot or winner status.</p>
                            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                                {PROFILE_THEMES.map((t) => {
                                    const disabled = t.premium && !canUsePremium;
                                    const isActive = effectiveThemeId === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            disabled={disabled}
                                            title={disabled ? 'Own a plot or win to unlock' : undefined}
                                            onClick={() => !disabled && setProfileTheme(t.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between ${disabled
                                                ? 'border-navy-700 bg-navy-800/50 text-gray-500 cursor-not-allowed'
                                                : isActive
                                                    ? `${activeTheme.buttonClass} border-current`
                                                    : 'border-navy-600 bg-navy-800/80 text-gray-200 hover:border-gold/30'
                                                }`}
                                        >
                                            <span className="font-medium">{t.name}</span>
                                            {t.premium && <span className="text-xs opacity-80">{disabled ? '🔒' : '✨'}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => setThemeSelectorOpen(false)}
                                className="mt-4 w-full py-2 rounded-lg border border-navy-600 text-gray-400 hover:text-white"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
