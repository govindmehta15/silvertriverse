import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { reelityService } from '../services/reelityService';
import { communityService } from '../services/communityService';
import { realityService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClubCard from '../components/ClubCard';
import Leaderboard from '../components/Leaderboard';
import useCountdown from '../hooks/useCountdown';
import { SkeletonCard } from '../components/Skeleton';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const APP_FEATURE_SPOTLIGHTS = [
    {
        id: 'spotlight-land',
        title: 'Metropolis Land',
        message: 'Own virtual plots in our massive 50x50 township.',
        icon: '🗺️',
        link: '/land',
        accent: 'from-emerald-600/20 to-teal-900/40',
        borderColor: 'border-emerald-500/30',
        stats: '2,500 Plots'
    },
    {
        id: 'spotlight-relics',
        title: 'Relics Arena',
        message: 'Bid on premium artifacts with live momentum.',
        icon: '🏺',
        link: '/relics',
        accent: 'from-gold/20 to-amber-900/40',
        borderColor: 'border-gold/30',
        stats: 'Live Bids'
    },
    {
        id: 'spotlight-ai',
        title: 'AI Avatars',
        message: 'Enter biometric AI command center for Writer, Producer, and more agents.',
        icon: '🤖',
        link: '/ai-avatars',
        accent: 'from-violet-600/20 to-indigo-900/40',
        borderColor: 'border-violet-500/30',
        stats: 'Future Access'
    },
];

const METAVERSE_ACTIVITIES = [
    { user: 'Govind', action: 'claimed Plot #142 in Metropolis', time: '2m ago', icon: '🏠', color: 'text-emerald-400' },
    { user: 'Aman', action: 'won "Scepter of Time" in auction', time: '5m ago', icon: '⚔️', color: 'text-gold' },
    { user: 'Sagar', action: 'reached Legend Tier in Rankings', time: '12m ago', icon: '🏆', color: 'text-blue-400' },
    { user: 'Deepak', action: 'allocated 250MW Power to Estate', time: '15m ago', icon: '⚡', color: 'text-yellow-400' },
    { user: 'Rohan', action: 'published "Neo-Noir" AI Story', time: '22m ago', icon: '🤖', color: 'text-purple-400' },
    { user: 'Priya', action: 'unlocked "Golden Gate" Prop', time: '28m ago', icon: '🎁', color: 'text-pink-400' },
    { user: 'Aditya', action: 'placed a ₹25,000 bid on Relic', time: '35m ago', icon: '💰', color: 'text-gold' },
    { user: 'Ishaan', action: 'visualized "Silver Villa" in 3D', time: '42m ago', icon: '🏡', color: 'text-teal-400' },
];

const METROPOLIS_STATS = [
    { label: 'Active Citizens', value: '1,421' },
    { label: 'Total Bids', value: '₹4.2M' },
    { label: 'AI Scripts Gen', value: '8,902' },
];
const FEED_HOT_TAGS = ['#NeonHorizon', '#LandWorld', '#RelicDrop', '#CreatorEconomy', '#AILab'];

export default function ReelityFeedPage() {
    const { isAuthenticated, user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [showPostForm, setShowPostForm] = useState(false);
    const [postCaption, setPostCaption] = useState('');
    const [commentText, setCommentText] = useState({});
    const [portalFx, setPortalFx] = useState(null);
    const [portalStepIndex, setPortalStepIndex] = useState(0);

    const { data: feedRes, isLoading } = useQuery({
        queryKey: ['reelityFeed'],
        queryFn: reelityService.getFeed,
        refetchInterval: 15000
    });

    const { data: commRes } = useQuery({
        queryKey: ['communities'],
        queryFn: communityService.getAllCommunities
    });

    // Battle data
    const { data: battleRes } = useQuery({
        queryKey: ['battles'],
        queryFn: realityService.getBattles,
        refetchInterval: 10000
    });
    const battle = battleRes?.success && battleRes.data.length > 0 ? battleRes.data[0] : null;
    const [votedFor, setVotedFor] = useState(null);
    const voteMutation = useMutation({
        mutationFn: (filmId) => realityService.castVote(battle.id, user?.id || 'mock-user-123', filmId),
        onSuccess: (data, filmId) => {
            setVotedFor(filmId);
            queryClient.invalidateQueries(['battles']);
            addToast(`Vote cast for ${battle.films.find(f => f.id === filmId)?.title}! +50 Points`, 'success');
        }
    });
    const timeLeft = useCountdown(battle?.endTime ?? 0);
    const hasVoted = votedFor !== null;

    const postMutation = useMutation({
        mutationFn: (postData) => reelityService.addPost(postData),
        onSuccess: () => {
            queryClient.invalidateQueries(['reelityFeed']);
            addToast('Post shared to Reelity! 🎬', 'success');
            setShowPostForm(false);
            setPostCaption('');
        }
    });

    const likeMutation = useMutation({
        mutationFn: ({ postId, userId }) => reelityService.toggleLike(postId, userId),
        onSuccess: () => queryClient.invalidateQueries(['reelityFeed'])
    });

    const commentMutation = useMutation({
        mutationFn: ({ postId, commentData }) => reelityService.addComment(postId, commentData),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries(['reelityFeed']);
            setCommentText(prev => ({ ...prev, [vars.postId]: '' }));
        }
    });

    const feed = feedRes?.data || [];
    const communities = commRes?.data || [];
    const trendingClubs = communities.slice(0, 3);

    const hoursAgo = (ts) => {
        const h = Math.floor((Date.now() - ts) / 3600000);
        if (h < 1) return 'Just now';
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const buildFeedWithClubsAndSpotlights = () => {
        const result = [];
        let clubIdx = 0;
        let spotlightIdx = 0;
        feed.forEach((f, i) => {
            result.push(f);
            if ((i + 1) % 3 === 0 && clubIdx < trendingClubs.length) {
                result.push({ type: 'club', data: trendingClubs[clubIdx] });
                clubIdx++;
            }
            if ((i + 1) % 2 === 0 && spotlightIdx < APP_FEATURE_SPOTLIGHTS.length) {
                result.push({ type: 'spotlight', data: APP_FEATURE_SPOTLIGHTS[spotlightIdx] });
                spotlightIdx++;
            }
        });
        return result;
    };
    const interleavedFeed = buildFeedWithClubsAndSpotlights();

    useEffect(() => {
        if (!portalFx?.link) return undefined;

        setPortalStepIndex(0);
        let stepIdx = 0;
        const steps = portalFx.steps || [];
        const interval = setInterval(() => {
            stepIdx += 1;
            if (stepIdx < steps.length) {
                setPortalStepIndex(stepIdx);
                return;
            }
            clearInterval(interval);
            setTimeout(() => {
                navigate(portalFx.link);
                setPortalFx(null);
                setPortalStepIndex(0);
            }, 280);
        }, 420);

        return () => clearInterval(interval);
    }, [portalFx, navigate]);

    const getPortalSteps = (spot) => {
        if (spot.link === '/land') {
            return [
                'Syncing land registry',
                'Calibrating skyline and terrain',
                'Preparing plot controls',
                'Entering Metropolis Land',
            ];
        }
        if (spot.link === '/relics') {
            return [
                'Scanning live relic auctions',
                'Connecting bid momentum stream',
                'Preparing vault insights',
                'Entering Relics Arena',
            ];
        }
        if (spot.link === '/ai-avatars') {
            return [
                'Scanning biometric signature',
                'Loading avatar command matrix',
                'Syncing writer and producer nodes',
                'Entering AI Avatars',
            ];
        }
        return [
            'Initializing destination',
            'Loading modules',
            'Syncing session',
            `Entering ${spot.title}`,
        ];
    };

    const triggerPortalTravel = (spot) => {
        setPortalFx({
            link: spot.link,
            title: spot.title,
            icon: spot.icon,
            steps: getPortalSteps(spot),
        });
    };

    if (isLoading) {
        return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Feed Column */}
                <div className="flex-1 space-y-4">
                    
                    {/* ── METROPOLIS PORTALS ────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {APP_FEATURE_SPOTLIGHTS.map(spot => (
                            <motion.button
                                key={spot.id}
                                whileHover={{ scale: 1.02, y: -4 }}
                                onClick={() => triggerPortalTravel(spot)}
                                className={`relative overflow-hidden group p-5 rounded-2xl border ${spot.borderColor} bg-gradient-to-br ${spot.accent} text-left transition-all`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-3xl filter drop-shadow-md">{spot.icon}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px] font-bold text-white uppercase tracking-widest">{spot.stats}</span>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{spot.title}</h3>
                                <p className="text-gray-300 text-[10px] leading-relaxed line-clamp-2">{spot.message}</p>
                                <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-gold text-xs">Enter →</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* New Post Bar */}
                    {isAuthenticated && (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setShowPostForm(true)}
                            className="w-full flex items-center gap-3 bg-navy-800/40 border border-navy-700/30 rounded-2xl p-4 hover:border-gold/30 transition-all backdrop-blur-md"
                        >
                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-gold/20" />
                            <span className="text-gray-400 text-sm italic font-serif">What's the latest in the SilverTriverse?</span>
                        </motion.button>
                    )}

                    {/* Main Feed */}
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                        {interleavedFeed.map((feedItem, i) => {
                            if (feedItem.type === 'club') {
                                return (
                                    <motion.div key={`club-${feedItem.data.id}`} variants={item}>
                                        <ClubCard community={feedItem.data} />
                                    </motion.div>
                                );
                            }

                            if (feedItem.type === 'spotlight') {
                                const spot = feedItem.data;
                                return (
                                    <motion.button
                                        key={spot.id}
                                        variants={item}
                                        whileHover={{ y: -3, scale: 1.01 }}
                                        onClick={() => triggerPortalTravel(spot)}
                                        className={`relative w-full overflow-hidden rounded-2xl border ${spot.borderColor} bg-gradient-to-br ${spot.accent} p-5 text-left`}
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{spot.icon}</span>
                                                <h4 className="text-base font-bold text-white">{spot.title}</h4>
                                            </div>
                                            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                                                {spot.stats}
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-gray-200">{spot.message}</p>
                                    </motion.button>
                                );
                            }

                            if (feedItem.type !== 'social') {
                                return (
                                    <motion.div
                                        key={feedItem.id}
                                        variants={item}
                                        className="overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-navy-900/70 to-violet-950/30 backdrop-blur-xl"
                                    >
                                        <div className="flex items-center gap-3 p-4 pb-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-xl">
                                                {feedItem.icon || '✨'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-white">{feedItem.title || 'Reelity Update'}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{hoursAgo(feedItem.timestamp)}</p>
                                            </div>
                                        </div>
                                        {feedItem.image && <img src={feedItem.image} alt="" className="aspect-video w-full object-cover opacity-80" />}
                                        <div className="p-4 pt-3">
                                            <p className="text-sm leading-relaxed text-gray-200">{feedItem.message || feedItem.caption}</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {FEED_HOT_TAGS.slice(i % FEED_HOT_TAGS.length, (i % FEED_HOT_TAGS.length) + 2).map((tag) => (
                                                    <span key={`${feedItem.id}-${tag}`} className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            {feedItem.link && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(feedItem.link)}
                                                    className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/20"
                                                >
                                                    Open
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            }

                            return (
                                <motion.div key={feedItem.id} variants={item} className="bg-navy-900/40 border border-navy-700/30 rounded-2xl overflow-hidden backdrop-blur-xl">
                                    <div className="flex items-center gap-3 p-4 pb-2">
                                        <img src={feedItem.authorAvatar} alt="" className="w-10 h-10 rounded-full border border-navy-600" />
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-semibold">{feedItem.authorName}</p>
                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{hoursAgo(feedItem.timestamp)}</p>
                                        </div>
                                        <span className="text-gold opacity-50">✦</span>
                                    </div>
                                    {feedItem.image && <img src={feedItem.image} alt="" className="w-full aspect-video object-cover opacity-90" />}
                                    <div className="p-4 pt-3">
                                        <p className="text-gray-200 text-sm leading-relaxed">{feedItem.caption}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {FEED_HOT_TAGS.slice(0, 2).map((tag) => (
                                                <span key={`${feedItem.id}-${tag}`} className="rounded-full border border-navy-600 bg-navy-800/70 px-2 py-0.5 text-[10px] text-gray-300">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-navy-700/50">
                                            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors">
                                                ❤️ {feedItem.likes?.length || 0}
                                            </button>
                                            <span className="text-gray-400 text-xs">💬 {feedItem.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* SIDEBAR */}
                <aside className="w-full lg:w-80 shrink-0 space-y-4">
                    
                    {/* ── GLOBAL RANKINGS ───────────────────────── */}
                    <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-navy-900 to-amber-950/40 p-5 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <span className="text-5xl text-gold">👑</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                                Top Rankings
                            </h2>
                            <Link to="/leaderboard" className="text-[9px] text-gold/60 underline uppercase font-bold hover:text-gold transition-colors">Details</Link>
                        </div>
                        <div className="space-y-4">
                            {[
                                { rank: 1, name: 'Sagar Developer', score: '12,450', avatar: '💻' },
                                { rank: 2, name: 'Govind Tycoon', score: '10,200', avatar: '🏛️' },
                                { rank: 3, name: 'Aman RelicHunter', score: '9,800', avatar: '🏺' }
                            ].map((ranker, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold w-4 ${ranker.rank === 1 ? 'text-gold' : 'text-gray-500'}`}>#{ranker.rank}</span>
                                    <div className="w-8 h-8 rounded-full bg-navy-800 border border-gold/20 flex items-center justify-center text-sm">{ranker.avatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-gray-200 truncate">{ranker.name}</p>
                                        <div className="w-full h-1 bg-navy-800 rounded-full mt-1">
                                            <div className="h-full bg-gold rounded-full" style={{ width: `${100 - idx * 20}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gold font-mono">{ranker.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── LIVE ACTIVITY FEED ────────────────────── */}
                    <div className="rounded-2xl border border-navy-700/50 bg-navy-900/60 p-5 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                Live Hub Activity
                            </h2>
                            <span className="text-[10px] text-gray-600 font-mono">ID: ST-04</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-navy-700">
                            {METAVERSE_ACTIVITIES.map((act, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-sm grow-0 shrink-0">
                                        {act.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-gray-300 leading-snug">
                                            <span className={`font-bold ${act.color}`}>{act.user}</span> {act.action}
                                        </p>
                                        <p className="text-[9px] text-gray-600 uppercase font-bold mt-0.5">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── HUB STATS ────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-2">
                        {METROPOLIS_STATS.map((stat, idx) => (
                            <div key={idx} className="bg-navy-950/40 border border-navy-800 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</span>
                                <span className="text-xs font-mono text-gold">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* Battle Arena */}
            {battle && (
                <section className="pt-6 border-t border-navy-600/30">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl font-bold text-gold uppercase tracking-wide">{battle.title}</h2>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 border border-red-500/30 rounded-lg text-red-400 font-mono text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>{timeLeft.formatted} LEFT</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {battle.films.map((film) => (
                            <motion.div key={film.id} whileHover={{ y: -5 }} className={`relative overflow-hidden rounded-2xl border ${votedFor === film.id ? 'border-gold bg-gold/5' : 'border-navy-600/40 bg-navy-800/60'}`}>
                                <div className="absolute inset-0">
                                    <img src={film.image} alt="" className="w-full h-full object-cover opacity-20" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${film.color} opacity-40`} />
                                </div>
                                <div className="relative p-6 flex flex-col h-56 justify-end">
                                    <h3 className="font-serif text-xl font-bold text-white mb-4">{film.title}</h3>
                                    <button onClick={() => !hasVoted && voteMutation.mutate(film.id)} disabled={hasVoted} className="w-full py-2 bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                                        {votedFor === film.id ? 'Voted' : 'Vote Now'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}


            {/* Modal */}
            {showPostForm && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h3 className="font-serif text-xl text-gold font-bold">New Post</h3>
                        <textarea value={postCaption} onChange={e => setPostCaption(e.target.value)} placeholder="What's happening? 🎬" rows={4} className="w-full bg-navy-800 border border-navy-600 rounded-lg p-3 text-sm text-white focus:outline-none" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowPostForm(false)} className="flex-1 py-2 bg-navy-800 text-gray-400 text-sm">Cancel</button>
                            <button onClick={() => { if (postCaption.trim()) postMutation.mutate({ authorId: user.id, authorName: user.name, authorAvatar: user.avatar, caption: postCaption, image: user.avatar }); }} className="flex-1 py-2 bg-gold text-navy-950 font-bold rounded-lg text-sm">Post to Reelity</button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {portalFx && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
                    >
                        <div className="relative w-72 h-72">
                            <motion.div
                                initial={{ scale: 0.45, rotate: 0, opacity: 0.2 }}
                                animate={{ scale: 1.2, rotate: 280, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.58, ease: 'easeOut' }}
                                className="absolute inset-0 rounded-full border-4 border-orange-300/80 shadow-[0_0_60px_rgba(251,146,60,0.8)]"
                            />
                            <motion.div
                                initial={{ scale: 0.35, rotate: 0, opacity: 0.1 }}
                                animate={{ scale: 1.06, rotate: -220, opacity: 0.95 }}
                                exit={{ scale: 1.35, opacity: 0 }}
                                transition={{ duration: 0.62, ease: 'easeOut' }}
                                className="absolute inset-4 rounded-full border-2 border-amber-300/80"
                            />
                            <motion.div
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.88 }}
                                exit={{ scale: 1.25, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-10 rounded-full bg-gradient-to-br from-orange-500/55 via-amber-300/45 to-transparent"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.35 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                            >
                                <span className="text-4xl">{portalFx.icon}</span>
                                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-amber-200">
                                    Opening Portal
                                </p>
                                <p className="text-sm font-semibold text-white">{portalFx.title}</p>
                                <p className="mt-2 text-[11px] text-amber-100/90">
                                    {portalFx.steps?.[portalStepIndex] || 'Initializing destination'}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5">
                                    {(portalFx.steps || []).map((step, idx) => (
                                        <span
                                            key={`${portalFx.link}-${step}`}
                                            className={`h-1.5 w-5 rounded-full ${idx <= portalStepIndex ? 'bg-amber-300' : 'bg-white/25'}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
