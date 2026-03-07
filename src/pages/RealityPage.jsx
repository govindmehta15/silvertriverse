import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realityService } from '../services';
import Leaderboard from '../components/Leaderboard';
import { useToast } from '../context/ToastContext';
import { SkeletonCard, SkeletonBanner } from '../components/Skeleton';
import useCountdown from '../hooks/useCountdown';

export default function RealityPage() {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [votedFor, setVotedFor] = useState(null);

    // 1. Fetch Battles
    const { data: response, isLoading } = useQuery({
        queryKey: ['battles'],
        queryFn: realityService.getBattles,
        refetchInterval: 10000, // Background updates
    });

    const battle = response?.success && response.data.length > 0 ? response.data[0] : null;

    // 2. Cast Vote Mutation
    const voteMutation = useMutation({
        mutationFn: (filmId) => realityService.castVote(battle.id, 'mock-user-123', filmId),
        onSuccess: (data, filmId) => {
            setVotedFor(filmId);
            queryClient.invalidateQueries(['battles']);

            const filmName = battle.films.find(f => f.id === filmId)?.title;
            addToast(`Vote cast for ${filmName}! +50 Points`, 'success');
        },
        onError: (error) => {
            addToast(error.message, 'error');
        }
    });

    // We still use local countdown, relying on battle endTime
    const timeLeft = useCountdown(battle?.endTime ?? 0);

    const handleVote = (filmId) => {
        if (!battle || voteMutation.isPending || battle.hasVoted) return;
        voteMutation.mutate(filmId);
    };

    if (isLoading || !battle) {
        return (
            <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
                <SkeletonBanner />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    const votes = {
        f1: battle.films[0].votes,
        f2: battle.films[1].votes,
    };
    const totalVotes = votes.f1 + Math.max(0, votes.f2) // Safeguard total
    const f1Percent = totalVotes > 0 ? Math.round((votes.f1 / totalVotes) * 100) : 50;
    const f2Percent = 100 - f1Percent;

    // Check if user already voted in this session
    const hasVoted = votedFor !== null;

    return (
        <div className="pb-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-teal-950/20 to-transparent" />
                <div className="absolute inset-0 cinematic-overlay" />

                <div className="relative px-4 pt-10 pb-6 text-center max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-gold/70 text-2xl mb-2">
                        ⚔️
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-serif text-4xl md:text-5xl font-bold text-white tracking-widest uppercase mb-2"
                        style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                    >
                        Reality Check
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-400 text-sm tracking-widest uppercase">
                        Your voice shapes the future of cinema
                    </motion.p>
                </div>
            </div>

            <div className="px-4 md:px-8 max-w-6xl mx-auto space-y-12">
                {/* Voting Section */}
                <section>
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
                        {/* VS Badge (Desktop Center) */}
                        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-navy-900 border-2 border-gold/40 items-center justify-center text-gold font-bold font-serif shadow-[0_0_20px_rgba(201,162,39,0.3)]">
                            VS
                        </div>

                        {battle.films.map((film) => (
                            <motion.div
                                key={film.id}
                                whileHover={{ y: -5 }}
                                className={`
                  relative overflow-hidden rounded-2xl border transition-all duration-300
                  ${votedFor === film.id ? 'border-gold shadow-glow-gold bg-gold/5' : 'border-navy-600/40 bg-navy-800/60'}
                  ${hasVoted && votedFor !== film.id ? 'opacity-50 grayscale-[50%]' : ''}
                `}
                            >
                                {/* Background Image Gradient */}
                                <div className="absolute inset-0">
                                    <img src={film.image} alt={film.title} className="w-full h-full object-cover opacity-30" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${film.color}`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent" />
                                </div>

                                <div className="relative p-6 flex flex-col h-full min-h-[300px]">
                                    {votedFor === film.id && (
                                        <div className="absolute top-4 right-4 bg-gold text-navy-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                            <span>✓</span> Your Pick
                                        </div>
                                    )}

                                    <div className="mt-auto">
                                        <p className="text-gray-300 text-xs uppercase tracking-widest mb-1">{film.director}</p>
                                        <h3 className="font-serif text-2xl font-bold text-white mb-4 leading-tight">{film.title}</h3>

                                        <button
                                            onClick={() => handleVote(film.id)}
                                            disabled={hasVoted}
                                            className={`
                        w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all
                        ${hasVoted
                                                    ? votedFor === film.id ? 'bg-gold text-navy-900' : 'bg-navy-700 text-gray-500'
                                                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'}
                      `}
                                        >
                                            {hasVoted ? (votedFor === film.id ? 'Voted' : 'Voting Closed') : 'Vote Now'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Progress Bar under voting cards */}
                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-cyan-400">{f1Percent}%</span>
                            <span className="text-gray-400 text-xs tracking-widest uppercase">{totalVotes.toLocaleString()} Total Votes</span>
                            <span className="text-pink-400">{f2Percent}%</span>
                        </div>
                        <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden flex border border-navy-600/30">
                            <motion.div
                                initial={{ width: '50%' }}
                                animate={{ width: `${f1Percent}%` }}
                                transition={{ type: 'spring', bounce: 0.2 }}
                                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            />
                            <motion.div
                                initial={{ width: '50%' }}
                                animate={{ width: `${f2Percent}%` }}
                                transition={{ type: 'spring', bounce: 0.2 }}
                                className="h-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                            />
                        </div>
                    </div>
                </section>

                {/* Global Leaderboard Section */}
                <section className="pt-8 border-t border-navy-600/30">
                    <Leaderboard />
                </section>
            </div>
        </div>
    );
}
