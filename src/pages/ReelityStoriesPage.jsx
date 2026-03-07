import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reelityService } from '../services/reelityService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StoryViewer from '../components/StoryViewer';
import { SkeletonCard } from '../components/Skeleton';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const circleAnim = { hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } } };

export default function ReelityStoriesPage() {
    const { isAuthenticated, user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [viewingStory, setViewingStory] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCaption, setNewCaption] = useState('');

    const { data: storiesRes, isLoading } = useQuery({
        queryKey: ['reelityStories'],
        queryFn: reelityService.getStories,
        refetchInterval: 30000
    });

    const addStoryMutation = useMutation({
        mutationFn: (storyData) => reelityService.addStory(storyData),
        onSuccess: () => {
            queryClient.invalidateQueries(['reelityStories']);
            addToast('Chronicle transmission complete ✦', 'success');
            setShowAddForm(false);
            setNewCaption('');
        }
    });

    const stories = storiesRes?.data || [];

    if (isLoading) {
        return <div className="space-y-4"><SkeletonCard /></div>;
    }

    const hoursLeft = (ts) => {
        const remaining = 24 - Math.floor((Date.now() - ts) / 3600000);
        if (remaining <= 0) return 'EXPIRED';
        return `${remaining}h`;
    };

    const hoursAgo = (ts) => {
        const h = Math.floor((Date.now() - ts) / 3600000);
        return h < 1 ? 'LIVE' : `${h}h ago`;
    };

    // Group by user for viewer
    const grouped = {};
    stories.forEach(s => {
        if (!grouped[s.userId]) grouped[s.userId] = [];
        grouped[s.userId].push(s);
    });

    return (
        <div className="space-y-10 relative min-h-screen">

            {/* ═══ SCI-FI BACKGROUND ELEMENTS ═══ */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={`p-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: 1 + Math.random() * 2,
                            height: 1 + Math.random() * 2,
                            background: i % 3 === 0
                                ? 'rgba(6,182,212,0.5)'
                                : i % 3 === 1
                                    ? 'rgba(201,162,39,0.4)'
                                    : 'rgba(168,85,247,0.4)',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100 - Math.random() * 150],
                            opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 5 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
                    />
                ))}
                {/* Horizontal scan lines */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`sl-${i}`}
                        className="absolute left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.08), transparent)', top: `${25 + i * 25}%` }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            {/* ═══ HEADER ═══ */}
            <section className="relative text-center pt-2">
                <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Sci-fi hexagonal icon */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="w-14 h-14 border border-cyan-500/20 rounded-full flex items-center justify-center"
                            >
                                <div className="w-10 h-10 border border-gold/20 rounded-full flex items-center justify-center">
                                    <span className="text-gold text-sm">◈</span>
                                </div>
                            </motion.div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        </div>
                    </div>

                    <h1 className="font-serif text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-gold to-purple-400 uppercase tracking-[0.15em]">
                        The Chronicles
                    </h1>

                    <div className="flex items-center justify-center gap-4 mt-3">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                        <motion.span
                            className="text-cyan-400/60 text-[10px] font-mono tracking-widest"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ▸ ACTIVE SIGNAL ◂
                        </motion.span>
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                    </div>

                    <p className="text-gray-500 text-[10px] mt-3 tracking-[0.25em] uppercase">
                        Transmissions decay in 24 cycles
                    </p>
                </motion.div>
            </section>

            {/* ═══ ROUND CIRCLE STORIES ═══ */}
            <section>
                <div className="flex items-center gap-2 mb-5 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400/60 text-[10px] font-mono tracking-widest uppercase">Transmissions</span>
                </div>

                <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap justify-center gap-6 md:gap-8">

                    {/* Add Story Circle */}
                    {isAuthenticated && (
                        <motion.div variants={circleAnim} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setShowAddForm(true)}>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-20 h-20 md:w-24 md:h-24"
                            >
                                {/* Outer dashed ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30"
                                />
                                {/* Inner circle */}
                                <div className="absolute inset-1 rounded-full bg-navy-800/80 border border-cyan-500/20 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-cyan-400 text-2xl">+</span>
                                </div>
                                {/* Corner glow */}
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                            </motion.div>
                            <span className="text-cyan-400/60 text-[9px] font-mono tracking-wider uppercase">Transmit</span>
                        </motion.div>
                    )}

                    {/* Story Circles */}
                    {stories.map((story, i) => (
                        <motion.div
                            key={story.id}
                            variants={circleAnim}
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                            onClick={() => setViewingStory(grouped[story.userId])}
                        >
                            <motion.div
                                whileHover={{ scale: 1.12 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-20 h-20 md:w-24 md:h-24"
                            >
                                {/* Animated outer ring — multi-color gradient */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full p-[3px]"
                                    style={{ background: `conic-gradient(from ${i * 60}deg, rgba(6,182,212,0.8), rgba(201,162,39,0.8), rgba(168,85,247,0.8), rgba(6,182,212,0.8))` }}
                                >
                                    <div className="w-full h-full rounded-full bg-navy-950" />
                                </motion.div>

                                {/* Inner image circle */}
                                <div className="absolute inset-[5px] rounded-full overflow-hidden border-2 border-navy-900">
                                    <img
                                        src={story.image}
                                        alt={story.caption}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Sci-fi overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-cyan-500/5 group-hover:from-navy-950/30 transition-all duration-300" />
                                </div>

                                {/* Timer badge */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10">
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-navy-950/90 border border-cyan-500/20 rounded-full backdrop-blur-sm">
                                        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                        <span className="text-[8px] text-cyan-300 font-mono">{hoursLeft(story.timestamp)}</span>
                                    </div>
                                </div>

                                {/* Hover glow */}
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ boxShadow: '0 0 25px rgba(6,182,212,0.2), 0 0 50px rgba(201,162,39,0.1)' }}
                                />
                            </motion.div>

                            <div className="text-center">
                                <p className="text-white/80 text-[10px] font-medium truncate max-w-[80px]">{story.userName.split(' ')[0]}</p>
                                <p className="text-cyan-500/40 text-[8px] font-mono">{hoursAgo(story.timestamp)}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {stories.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 mt-4 rounded-xl border border-dashed border-cyan-800/20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-800/50 border border-cyan-500/10 flex items-center justify-center">
                            <motion.span
                                className="text-2xl"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >◈</motion.span>
                        </div>
                        <p className="text-gray-400 text-sm italic">No active transmissions detected...</p>
                        <p className="text-gray-600 text-xs mt-1 font-mono">Signal array is clear</p>
                    </motion.div>
                )}
            </section>

            {/* ═══ SCI-FI DIVIDER ═══ */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
                <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
                    <div className="w-6 h-px bg-cyan-500/20" />
                    <div className="w-2 h-2 rotate-45 border border-gold/30 bg-gold/5" />
                    <div className="w-6 h-px bg-cyan-500/20" />
                    <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
            </div>

            {/* ═══ SIGNAL DASHBOARD ═══ */}
            <section>
                <div className="flex items-center gap-2 mb-5 px-1">
                    <svg className="w-4 h-4 text-gold/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 13h2v8H3zM8 9h2v12H8zM13 5h2v16h-2zM18 1h2v20h-2z" />
                    </svg>
                    <span className="text-gold/50 text-[10px] font-mono tracking-widest uppercase">Signal Dashboard</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Active Signals', value: stories.length, color: 'cyan', icon: '◉' },
                        { label: 'Transmitters', value: Object.keys(grouped).length, color: 'gold', icon: '◎' },
                        { label: 'Decay Cycle', value: '24h', color: 'purple', icon: '◈' }
                    ].map(stat => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -3, scale: 1.02 }}
                            className="text-center py-5 rounded-xl border transition-all duration-300 relative overflow-hidden"
                            style={{
                                borderColor: stat.color === 'cyan' ? 'rgba(6,182,212,0.15)' : stat.color === 'gold' ? 'rgba(201,162,39,0.15)' : 'rgba(168,85,247,0.15)',
                                background: `radial-gradient(ellipse at center bottom, ${stat.color === 'cyan' ? 'rgba(6,182,212,0.05)' : stat.color === 'gold' ? 'rgba(201,162,39,0.05)' : 'rgba(168,85,247,0.05)'} 0%, transparent 70%)`
                            }}
                        >
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-l border-t" style={{ borderColor: stat.color === 'cyan' ? 'rgba(6,182,212,0.3)' : stat.color === 'gold' ? 'rgba(201,162,39,0.3)' : 'rgba(168,85,247,0.3)' }} />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b" style={{ borderColor: stat.color === 'cyan' ? 'rgba(6,182,212,0.3)' : stat.color === 'gold' ? 'rgba(201,162,39,0.3)' : 'rgba(168,85,247,0.3)' }} />

                            <span className="text-lg block mb-1" style={{ color: stat.color === 'cyan' ? 'rgba(6,182,212,0.6)' : stat.color === 'gold' ? 'rgba(201,162,39,0.6)' : 'rgba(168,85,247,0.6)' }}>{stat.icon}</span>
                            <p className="text-2xl font-mono font-bold" style={{ color: stat.color === 'cyan' ? 'rgba(6,182,212,0.9)' : stat.color === 'gold' ? 'rgba(201,162,39,0.9)' : 'rgba(168,85,247,0.9)' }}>{stat.value}</p>
                            <p className="text-gray-500 text-[8px] uppercase tracking-[0.2em] mt-1 font-mono">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ ADD STORY MODAL ═══ */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 40 }}
                            onClick={e => e.stopPropagation()}
                            className="relative rounded-xl p-8 w-full max-w-sm space-y-5 border border-cyan-500/15 overflow-hidden"
                            style={{ background: 'linear-gradient(180deg, rgba(8,15,35,0.98) 0%, rgba(5,10,25,0.98) 100%)', boxShadow: '0 0 80px rgba(6,182,212,0.05), 0 25px 60px rgba(0,0,0,0.5)' }}
                        >
                            {/* Sci-fi corner brackets */}
                            <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-cyan-500/30" />
                            <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-cyan-500/30" />
                            <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-cyan-500/30" />
                            <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-cyan-500/30" />

                            {/* Top scan line */}
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' }}
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />

                            <div className="text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="w-10 h-10 mx-auto mb-3 border border-cyan-500/20 rounded-full flex items-center justify-center"
                                >
                                    <span className="text-gold text-sm">◈</span>
                                </motion.div>
                                <h3 className="font-serif text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-gold font-bold uppercase tracking-wider">
                                    New Transmission
                                </h3>
                                <p className="text-cyan-500/30 text-[9px] tracking-[0.3em] uppercase mt-2 font-mono">Signal decays in 24 cycles</p>
                            </div>

                            <textarea
                                value={newCaption}
                                onChange={e => setNewCaption(e.target.value)}
                                placeholder="Compose your transmission... ◈"
                                rows={3}
                                className="w-full bg-navy-800/30 border border-cyan-500/10 rounded-lg p-4 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-500/30 focus:outline-none resize-none focus:ring-1 focus:ring-cyan-500/10 transition-all font-mono text-xs"
                            />

                            <div className="flex gap-3">
                                <button onClick={() => setShowAddForm(false)} className="flex-1 py-3 rounded-lg border border-navy-600/40 text-gray-500 text-xs font-mono uppercase tracking-wider hover:bg-navy-800/30 transition-colors">
                                    Abort
                                </button>
                                <button
                                    onClick={() => {
                                        if (!user) return;
                                        addStoryMutation.mutate({
                                            userId: user.id,
                                            userName: user.name,
                                            userAvatar: user.avatar,
                                            image: user.avatar,
                                            caption: newCaption || '◈'
                                        });
                                    }}
                                    disabled={addStoryMutation.isPending}
                                    className="flex-1 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 border border-cyan-500/30"
                                    style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(201,162,39,0.15))', color: '#67e8f9' }}
                                >
                                    {addStoryMutation.isPending ? 'Encoding...' : '▸ Transmit'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Story Viewer */}
            <AnimatePresence>
                {viewingStory && (
                    <StoryViewer stories={viewingStory} onClose={() => setViewingStory(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
