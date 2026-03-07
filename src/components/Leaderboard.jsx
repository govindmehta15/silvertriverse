import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlobalLeaderboard } from '../services/statsService';

const tabs = ['Top Fans', 'Top Collectors', 'Top Creators'];

export default function Leaderboard() {
    const [activeTab, setActiveTab] = useState('Top Fans');
    const [data, setData] = useState({
        'Top Fans': [],
        'Top Collectors': [],
        'Top Creators': []
    });

    useEffect(() => {
        // Load real stats from local storage interactions
        setData(getGlobalLeaderboard());

        // Periodically refresh to catch live mock events
        const interval = setInterval(() => {
            setData(getGlobalLeaderboard());
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card-luxury p-5 w-full max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">🏆</span>
                <h2 className="font-serif text-lg text-gold font-bold">Global Leaderboard</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-navy-800/40 rounded-lg p-1 border border-navy-600/30 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 relative
              ${activeTab === tab ? 'text-gold' : 'text-gray-400 hover:text-gray-200'}
            `}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="leaderboardTab"
                                className="absolute inset-0 bg-gold/10 border border-gold/20 rounded-md"
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>

            {/* List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                >
                    {data[activeTab].map((user, index) => (
                        <div
                            key={user.id}
                            className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${index === 0
                                    ? 'bg-gold/10 border-gold/30 shadow-[inset_0_0_15px_rgba(201,162,39,0.15)]'
                                    : 'bg-navy-800/40 border-navy-600/20'
                                }
              `}
                        >
                            {/* Rank */}
                            <div className={`
                w-6 text-center font-bold font-serif
                ${index === 0 ? 'text-gold text-lg drop-shadow-md' : 'text-gray-500 text-sm'}
              `}>
                                #{index + 1}
                            </div>

                            {/* Avatar */}
                            <div className={`
                w-10 h-10 rounded-full overflow-hidden shrink-0 border-2
                ${index === 0 ? 'border-gold' : 'border-navy-500'}
              `}>
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${index === 0 ? 'text-gold' : 'text-gray-200'}`}>
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-400">{user.score}</p>
                            </div>

                            {/* Rank Change Indicator */}
                            <div className="w-6 flex justify-end">
                                {user.rankChange > 0 && <span className="text-green-500 text-xs text-shadow-sm">▲{user.rankChange}</span>}
                                {user.rankChange < 0 && <span className="text-red-500 text-xs text-shadow-sm">▼{Math.abs(user.rankChange)}</span>}
                                {user.rankChange === 0 && <span className="text-gray-600 text-[10px]">—</span>}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
