import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCredits } from '../context/CreditsContext';
import { useAuth } from '../context/AuthContext';

const aiProducerTabs = [
    { to: '/ai-producer', label: 'Hub', icon: '🎬', end: true },
    { to: '/ai-producer/top-up', label: 'Top-up', icon: '💳' },
];

export default function AIProducerLayout() {
    const { balance } = useCredits();
    const { isAuthenticated } = useAuth();

    return (
        <div className="pb-24 lg:pb-8">
            {/* Hero */}
            <div className="relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-teal-950/20 to-transparent" />
                <div className="relative px-4 pt-8 pb-4 text-center max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-3xl md:text-5xl font-bold text-white tracking-tight mb-2"
                    >
                        AI Producer
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-sm tracking-[0.3em] uppercase"
                    >
                        Studio Intelligence & Discovery
                    </motion.p>
                </div>
            </div>

            {/* Internal Nav Tabs + Credit balance */}
            <div className="sticky top-7 z-40 bg-navy-950/90 backdrop-blur-xl border-b border-navy-700/50 mb-8">
                <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
                    <nav className="flex items-center gap-1 overflow-x-auto hide-scrollbar flex-1">
                        {aiProducerTabs.map((tab) => (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                end={tab.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive
                                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'
                                    }`
                                }
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                    {isAuthenticated && (
                        <NavLink
                            to="/ai-producer/top-up"
                            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-bold"
                        >
                            <span className="text-gray-500 font-medium">Balance:</span>
                            <span>{balance}</span>
                        </NavLink>
                    )}
                </div>
            </div>

            {/* Page Content */}
            <div className="max-w-6xl mx-auto px-4">
                <Outlet />
            </div>
        </div>
    );
}
