import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClubCard from '../components/ClubCard';
import RoleGuard from '../components/RoleGuard';
import { SkeletonCard } from '../components/Skeleton';

// Inline Modal for Creating a Group
function CreateGroupModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const mutation = useMutation({
        mutationFn: (newGroup) => communityService.createGroup(newGroup),
        onSuccess: () => {
            queryClient.invalidateQueries(['communities']);
            addToast('Society Founded.', 'success');
            onClose();
            setName('');
            setDescription('');
        },
        onError: () => addToast('Failed to establish society', 'error')
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !description) return addToast('Complete the charter first', 'error');

        mutation.mutate({
            name,
            description,
            creatorId: user?.id || 'u1'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-zinc-900 border border-gold/20 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(201,162,39,0.15)] relative"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-[60px] pointer-events-none" />

                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800">
                    ✕
                </button>

                <h2 className="font-serif text-3xl font-bold text-white mb-2 relative z-10">Found a Society</h2>
                <p className="text-zinc-400 text-sm mb-6 font-sans relative z-10">Establish a new cultural outpost in Reelity.</p>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-gold/80 mb-2">Society Name</label>
                        <input
                            type="text" value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all placeholder-zinc-700"
                            placeholder="e.g. The Kubrick Collective"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-gold/80 mb-2">Charter Description</label>
                        <textarea
                            value={description} onChange={e => setDescription(e.target.value)} rows={3}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 resize-none transition-all placeholder-zinc-700"
                            placeholder="What brings this society together?"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-gold to-yellow-600 text-zinc-950 font-bold uppercase tracking-widest text-sm rounded-lg hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] transition-all disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Forging...' : 'Establish Order'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}


const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function ReelityClubsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: commRes, isLoading } = useQuery({
        queryKey: ['communities'],
        queryFn: communityService.getAllCommunities
    });

    const { data: globalLeaderboardRes, isLoading: leaderLoading } = useQuery({
        queryKey: ['globalLeaderboard'],
        queryFn: communityService.getGlobalLeaderboard
    });

    const communities = commRes?.data || [];
    const globalLeaderboard = globalLeaderboardRes?.success ? globalLeaderboardRes.data : [];

    // Sort trending by members descending
    const trendingClubs = [...communities].sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0)).slice(0, 3);

    return (
        <div className="space-y-12 pb-24 lg:pb-12 max-w-5xl mx-auto px-4">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800 pb-6 mt-4">
                <div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-white">Societies & Clubs</h2>
                    <p className="text-zinc-400 text-sm mt-2 max-w-xl">Deep cultural enclaves dedicated to nuanced discussion, artifact collecting, and real-time cinematic sync rooms.</p>
                </div>

                <RoleGuard allowedRoles={['creator', 'professional']}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsModalOpen(true)}
                        className="shrink-0 px-5 py-2.5 bg-zinc-900 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gold hover:text-zinc-950 transition-colors shadow-glow-gold"
                    >
                        Found a Society
                    </motion.button>
                </RoleGuard>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Column: Clubs Feed */}
                <div className="lg:w-2/3 space-y-10">

                    {/* Trending First */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-gold font-serif text-2xl tracking-wide flex items-center gap-3">
                                <span className="text-xl">✧</span> Trending Enclaves
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
                        ) : (
                            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trendingClubs.map(c => (
                                    <motion.div key={`trending-${c.id}`} variants={item}>
                                        <ClubCard community={c} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </section>

                    {/* The Rest of the Clubs */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-white font-serif text-xl tracking-wide">
                                All Registered Clubs
                            </h3>
                            <div className="h-px bg-zinc-800 flex-1 ml-4" />
                        </div>

                        {isLoading ? (
                            <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
                        ) : (
                            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                                {communities.map(c => (
                                    <motion.div key={`all-${c.id}`} variants={item}>
                                        <ClubCard community={c} />
                                    </motion.div>
                                ))}

                                {communities.length === 0 && (
                                    <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                                        <p className="text-zinc-500 font-serif text-lg">No societies have been registered.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </section>

                </div>

                {/* Right Column: Global Leaderboard (Ecosystem Prestige) */}
                <div className="lg:w-1/3">
                    <div className="sticky top-24 bg-zinc-950 border border-gold/10 p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[40px] pointer-events-none" />

                        <h3 className="font-serif text-xl text-gold mb-1">Cultural Architects</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-6">Global Contributor Ranking</p>

                        {leaderLoading ? (
                            <div className="space-y-3"><SkeletonCard height="40px" /><SkeletonCard height="40px" /></div>
                        ) : globalLeaderboard.length === 0 ? (
                            <p className="text-zinc-600 text-sm text-center py-8">No recorded activity.</p>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {globalLeaderboard.slice(0, 5).map((u, index) => (
                                    <div key={u.userId} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-gold/30 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-5 text-center font-bold font-serif text-lg
                                                ${index === 0 ? 'text-gold drop-shadow-md' :
                                                    index === 1 ? 'text-zinc-300' :
                                                        index === 2 ? 'text-orange-amber' : 'text-zinc-600'}`
                                            }>
                                                #{index + 1}
                                            </span>
                                            <span className="text-zinc-200 text-sm font-medium tracking-wide group-hover:text-gold transition-colors">{u.name}</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] uppercase font-mono text-teal-400 rounded flex flex-col items-end leading-tight">
                                            <span className="text-white text-xs">{u.postCount}</span>
                                            <span className="text-zinc-500 scale-90">Posts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <AnimatePresence>
                {isModalOpen && <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
