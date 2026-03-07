import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reelityService } from '../services/reelityService';
import { communityService } from '../services/communityService';
import { realityService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StoryBar from '../components/StoryBar';
import ClubCard from '../components/ClubCard';
import Leaderboard from '../components/Leaderboard';
import useCountdown from '../hooks/useCountdown';
import { SkeletonCard } from '../components/Skeleton';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ReelityPage() {
    const { isAuthenticated, user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // New post form
    const [showPostForm, setShowPostForm] = useState(false);
    const [postCaption, setPostCaption] = useState('');
    const [commentText, setCommentText] = useState({});

    // Fetch data
    const { data: storiesRes, isLoading: storiesLoading } = useQuery({
        queryKey: ['reelityStories'],
        queryFn: reelityService.getStories,
        refetchInterval: 60000
    });

    const { data: feedRes, isLoading: feedLoading } = useQuery({
        queryKey: ['reelityFeed'],
        queryFn: reelityService.getFeed,
        refetchInterval: 15000
    });

    const { data: commRes } = useQuery({
        queryKey: ['communities'],
        queryFn: communityService.getAllCommunities
    });

    // Battle data (preserved from old Reality page)
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
            const filmName = battle.films.find(f => f.id === filmId)?.title;
            addToast(`Vote cast for ${filmName}! +50 Points`, 'success');
        }
    });
    const timeLeft = useCountdown(battle?.endTime ?? 0);
    const hasVoted = votedFor !== null;

    // Post mutation
    const postMutation = useMutation({
        mutationFn: (postData) => reelityService.addPost(postData),
        onSuccess: () => {
            queryClient.invalidateQueries(['reelityFeed']);
            addToast('Post shared to Reelity! 🎬', 'success');
            setShowPostForm(false);
            setPostCaption('');
        }
    });

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: ({ postId, userId }) => reelityService.toggleLike(postId, userId),
        onSuccess: () => queryClient.invalidateQueries(['reelityFeed'])
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: ({ postId, commentData }) => reelityService.addComment(postId, commentData),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries(['reelityFeed']);
            setCommentText(prev => ({ ...prev, [vars.postId]: '' }));
        }
    });

    const stories = storiesRes?.data || [];
    const feed = feedRes?.data || [];
    const communities = commRes?.data || [];
    const trendingClubs = communities.slice(0, 3);

    const hoursAgo = (ts) => {
        const h = Math.floor((Date.now() - ts) / 3600000);
        if (h < 1) return 'Just now';
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    // Interleave clubs into feed
    const buildFeedWithClubs = () => {
        const result = [];
        let clubIdx = 0;
        feed.forEach((item, i) => {
            result.push(item);
            if ((i + 1) % 3 === 0 && clubIdx < trendingClubs.length) {
                result.push({ type: 'club', data: trendingClubs[clubIdx] });
                clubIdx++;
            }
        });
        return result;
    };

    const interleavedFeed = buildFeedWithClubs();

    if (feedLoading) {
        return (
            <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
        );
    }

    return (
        <div className="pb-24 lg:pb-8">
            {/* Hero */}
            <div className="relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-teal-950/20 to-transparent" />
                <div className="relative px-4 pt-8 pb-4 text-center max-w-3xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-serif text-3xl md:text-4xl font-bold text-white tracking-widest uppercase mb-1"
                        style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                    >
                        Reelity
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-400 text-xs tracking-widest uppercase">
                        Social · Cultural · Commerce
                    </motion.p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 space-y-6">
                {/* Stories */}
                <section>
                    <StoryBar stories={stories} />
                </section>

                {/* New Post Button */}
                {isAuthenticated && (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setShowPostForm(true)}
                        className="w-full flex items-center gap-3 bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 hover:border-gold/30 transition-colors"
                    >
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-gold/20" />
                        <span className="text-gray-400 text-sm">Share something with the community...</span>
                    </motion.button>
                )}

                {/* Feed */}
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {interleavedFeed.map((feedItem, i) => {
                        // Club card
                        if (feedItem.type === 'club') {
                            return (
                                <motion.div key={`club-${feedItem.data.id}`} variants={item}>
                                    <div className="mb-1">
                                        <span className="text-[10px] text-gold uppercase tracking-widest font-bold">Trending Club</span>
                                    </div>
                                    <ClubCard community={feedItem.data} />
                                </motion.div>
                            );
                        }

                        // Cultural event
                        if (feedItem.type === 'cultural') {
                            return (
                                <motion.div key={feedItem.id} variants={item} className="bg-gradient-to-r from-purple-900/30 to-navy-900/60 border border-purple-500/20 rounded-xl p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{feedItem.icon}</span>
                                        <div>
                                            <h4 className="text-white text-sm font-bold">{feedItem.title}</h4>
                                            <p className="text-gray-300 text-xs mt-1">{feedItem.message}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-[10px] mt-3">{hoursAgo(feedItem.timestamp)}</p>
                                </motion.div>
                            );
                        }

                        // Commerce event
                        if (feedItem.type === 'commerce') {
                            return (
                                <motion.div key={feedItem.id} variants={item} className="bg-gradient-to-r from-gold/10 to-navy-900/60 border border-gold/20 rounded-xl p-5 cursor-pointer hover:border-gold/40 transition-colors" onClick={() => feedItem.link && navigate(feedItem.link)}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{feedItem.icon}</span>
                                        <div>
                                            <h4 className="text-gold text-sm font-bold">{feedItem.title}</h4>
                                            <p className="text-gray-300 text-xs mt-1">{feedItem.message}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-[10px] mt-3">{hoursAgo(feedItem.timestamp)}</p>
                                </motion.div>
                            );
                        }

                        // Social post
                        return (
                            <motion.div key={feedItem.id} variants={item} className="bg-navy-900/60 border border-navy-700/50 rounded-xl overflow-hidden">
                                {/* Author Header */}
                                <div className="flex items-center gap-3 p-4 pb-2">
                                    <img src={feedItem.authorAvatar} alt="" className="w-10 h-10 rounded-full border border-navy-600" />
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-semibold">{feedItem.authorName}</p>
                                        <p className="text-gray-500 text-[10px]">{hoursAgo(feedItem.timestamp)}</p>
                                    </div>
                                </div>

                                {/* Tags */}
                                {feedItem.tags && feedItem.tags.length > 0 && (
                                    <div className="px-4 pb-2 flex gap-2 flex-wrap">
                                        {feedItem.tags.map((tag, ti) => (
                                            <span key={ti} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tag.tagType === 'friend' ? 'bg-teal-900/40 text-teal-400 border border-teal-500/20' : 'bg-pink-900/40 text-pink-400 border border-pink-500/20'}`}>
                                                {tag.tagType === 'friend' ? '👫' : '⭐'} {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Image */}
                                {feedItem.image && (
                                    <img src={feedItem.image} alt="" className="w-full aspect-video object-cover" />
                                )}

                                {/* Caption */}
                                <div className="p-4 pt-3 space-y-3">
                                    <p className="text-gray-200 text-sm">{feedItem.caption}</p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => user && likeMutation.mutate({ postId: feedItem.id, userId: user.id })}
                                            className={`flex items-center gap-1.5 text-xs transition-colors ${feedItem.likes?.includes(user?.id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                                        >
                                            <span>{feedItem.likes?.includes(user?.id) ? '❤️' : '🤍'}</span>
                                            <span>{feedItem.likes?.length || 0}</span>
                                        </button>
                                        <span className="text-gray-400 text-xs flex items-center gap-1.5">
                                            💬 {feedItem.comments?.length || 0}
                                        </span>
                                    </div>

                                    {/* Comments */}
                                    {feedItem.comments && feedItem.comments.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-navy-700/50">
                                            {feedItem.comments.slice(0, 2).map(c => (
                                                <div key={c.id} className="flex gap-2">
                                                    <span className="text-white text-xs font-semibold shrink-0">{c.authorName}</span>
                                                    <span className="text-gray-300 text-xs">{c.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Comment */}
                                    {isAuthenticated && (
                                        <div className="flex gap-2 pt-1">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={commentText[feedItem.id] || ''}
                                                onChange={e => setCommentText(prev => ({ ...prev, [feedItem.id]: e.target.value }))}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && commentText[feedItem.id]?.trim()) {
                                                        commentMutation.mutate({
                                                            postId: feedItem.id,
                                                            commentData: { authorId: user.id, authorName: user.name, text: commentText[feedItem.id] }
                                                        });
                                                    }
                                                }}
                                                className="flex-1 bg-navy-800 border border-navy-700 text-xs text-white placeholder-gray-500 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold/40"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Battle Section (preserved) */}
                {battle && (
                    <section className="pt-8 border-t border-navy-600/30">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl font-bold text-gold uppercase tracking-wide">
                                {battle.title}
                            </h2>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 border border-red-500/30 rounded-lg text-red-400 mt-2 md:mt-0 font-mono flex-shrink-0">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span>{timeLeft.formatted} LEFT</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-navy-900 border-2 border-gold/40 items-center justify-center text-gold font-bold font-serif shadow-[0_0_20px_rgba(201,162,39,0.3)]">
                                VS
                            </div>
                            {battle.films.map((film) => (
                                <motion.div
                                    key={film.id}
                                    whileHover={{ y: -5 }}
                                    className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${votedFor === film.id ? 'border-gold shadow-glow-gold bg-gold/5' : 'border-navy-600/40 bg-navy-800/60'} ${hasVoted && votedFor !== film.id ? 'opacity-50 grayscale-[50%]' : ''}`}
                                >
                                    <div className="absolute inset-0">
                                        <img src={film.image} alt={film.title} className="w-full h-full object-cover opacity-30" />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${film.color}`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent" />
                                    </div>
                                    <div className="relative p-6 flex flex-col h-full min-h-[250px]">
                                        {votedFor === film.id && (
                                            <div className="absolute top-4 right-4 bg-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">✓ Your Pick</div>
                                        )}
                                        <div className="mt-auto">
                                            <p className="text-gray-300 text-xs uppercase tracking-widest mb-1">{film.director}</p>
                                            <h3 className="font-serif text-2xl font-bold text-white mb-4 leading-tight">{film.title}</h3>
                                            <button
                                                onClick={() => !hasVoted && voteMutation.mutate(film.id)}
                                                disabled={hasVoted}
                                                className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${hasVoted ? (votedFor === film.id ? 'bg-gold text-navy-900' : 'bg-navy-700 text-gray-500') : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'}`}
                                            >
                                                {hasVoted ? (votedFor === film.id ? 'Voted' : 'Voting Closed') : 'Vote Now'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {/* Vote Progress */}
                        {(() => {
                            const v = { f1: battle.films[0].votes, f2: battle.films[1].votes };
                            const total = v.f1 + Math.max(0, v.f2);
                            const p1 = total > 0 ? Math.round((v.f1 / total) * 100) : 50;
                            const p2 = 100 - p1;
                            return (
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-cyan-400">{p1}%</span>
                                        <span className="text-gray-400 text-xs tracking-widest uppercase">{total.toLocaleString()} Total Votes</span>
                                        <span className="text-pink-400">{p2}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden flex border border-navy-600/30">
                                        <motion.div initial={{ width: '50%' }} animate={{ width: `${p1}%` }} transition={{ type: 'spring', bounce: 0.2 }} className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                        <motion.div initial={{ width: '50%' }} animate={{ width: `${p2}%` }} transition={{ type: 'spring', bounce: 0.2 }} className="h-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                                    </div>
                                </div>
                            );
                        })()}
                    </section>
                )}

                {/* Leaderboard */}
                <section className="pt-8 border-t border-navy-600/30">
                    <Leaderboard />
                </section>
            </div>

            {/* Post Form Modal */}
            <AnimatePresence>
                {showPostForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowPostForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-md space-y-4"
                        >
                            <h3 className="font-serif text-xl text-gold font-bold">New Post</h3>
                            <div className="flex items-center gap-3">
                                <img src={user?.avatar} alt="" className="w-10 h-10 rounded-full border border-gold/20" />
                                <div>
                                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                                    <p className="text-gold/80 text-[10px] capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <textarea
                                value={postCaption}
                                onChange={e => setPostCaption(e.target.value)}
                                placeholder="What's happening in your creative world? 🎬"
                                rows={4}
                                className="w-full bg-navy-800 border border-navy-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none resize-none"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowPostForm(false)} className="flex-1 py-2.5 rounded-lg bg-navy-800 text-gray-400 text-sm font-medium hover:bg-navy-700 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!postCaption.trim()) return;
                                        postMutation.mutate({
                                            authorId: user.id,
                                            authorName: user.name,
                                            authorAvatar: user.avatar,
                                            caption: postCaption,
                                            image: user.avatar
                                        });
                                    }}
                                    disabled={postMutation.isPending || !postCaption.trim()}
                                    className="flex-1 py-2.5 rounded-lg bg-gold text-navy-950 text-sm font-bold hover:bg-gold/90 transition-colors disabled:opacity-50"
                                >
                                    {postMutation.isPending ? 'Posting...' : 'Post to Reelity'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
