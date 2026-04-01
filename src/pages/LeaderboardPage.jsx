import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getGlobalLeaderboard } from '../services/statsService';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function LeaderboardPage() {
    // We simulate a fast network fetch for the board
    const { data: boards, isLoading } = useQuery({
        queryKey: ['globalLeaderboard'],
        queryFn: () => {
            try {
                return Promise.resolve(getGlobalLeaderboard());
            } catch (e) {
                console.error('Leaderboard load failed', e);
                return Promise.resolve({ 'Top Fans': [], 'Top Collectors': [], 'Top Creators': [] });
            }
        },
        refetchInterval: 15000,
        staleTime: 0
    });

    if (isLoading && !boards) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    const safeBoards = boards || { 'Top Fans': [], 'Top Collectors': [], 'Top Creators': [] };

    return (
        <div className="min-h-[calc(100vh-80px)] p-4 md:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-white uppercase tracking-widest mb-4">
                    Global Rankings
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    The most dedicated fans, legendary collectors, and prolific creators in the SilverTriverse universe.
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {Object.entries(safeBoards).map(([category, users], idx) => (
                    <motion.div key={category} variants={item} className="bg-navy-900/50 rounded-2xl border border-navy-700 overflow-hidden hide-scrollbar">
                        {/* Header */}
                        <div className="bg-navy-800/80 px-6 py-4 border-b border-navy-700">
                            <h2 className="font-serif text-xl font-bold text-gold flex items-center gap-2">
                                {idx === 0 && '⭐'}
                                {idx === 1 && '🏛️'}
                                {idx === 2 && '🎬'}
                                {category}
                            </h2>
                        </div>

                        {/* Ranks list */}
                        <div className="p-4 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {(Array.isArray(users) ? users : []).map((u, i) => (
                                    <Link
                                        key={u.id}
                                        to={`/profile/${u.id}`}
                                        className="flex items-center gap-4 bg-navy-800/40 hover:bg-navy-700/60 transition-colors p-3 rounded-xl border border-navy-700/50 w-full text-left"
                                    >
                                        <div className={`w-8 h-8 flex shrink-0 items-center justify-center rounded-full font-bold text-sm ${i === 0 ? 'bg-gold text-navy-950 shadow-glow-gold' : i === 1 ? 'bg-gray-300 text-navy-950' : i === 2 ? 'bg-orange-400 text-navy-950' : 'bg-navy-900 text-gray-400 border border-navy-600'}`}>
                                            #{i + 1}
                                        </div>

                                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-navy-900 border border-navy-600 object-cover" />

                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate text-sm">{u.name}</p>
                                            <p className="text-xs text-gold/80">{u.score}</p>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            {u.rankChange > 0 && <span className="text-green-400 text-xs">▲</span>}
                                            {u.rankChange < 0 && <span className="text-red-400 text-xs">▼</span>}
                                            {u.rankChange === 0 && <span className="text-gray-500 text-xs">—</span>}
                                        </div>
                                    </Link>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
