import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../context/CreditsContext';
import { AI_PRODUCER_TOOLS, CREDIT_TIERS } from '../data/aiProducerData';

function TierBadge({ tier }) {
    const config = CREDIT_TIERS[tier] || CREDIT_TIERS.medium;
    const colors =
        tier === 'low'
            ? 'bg-teal-900/50 border-teal-500/40 text-teal-300'
            : tier === 'high'
                ? 'bg-rose-900/50 border-rose-500/40 text-rose-300'
                : 'bg-indigo-900/50 border-indigo-500/40 text-indigo-300';
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors}`}
        >
            {config.label} · {config.credits} credits
        </span>
    );
}

export default function AIProducerHubPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { balance, canAfford } = useCredits();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="text-center space-y-4 pt-4">
                <h1 className="font-serif text-4xl font-bold text-white tracking-tight">AI Producer Module</h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Script Screening, Risk Analysis & Discovery Engine for Production Houses.
                    Process submissions with data-driven evaluation.
                </p>
            </div>

            {/* Balance + Top-up (logged in) */}
            {isAuthenticated && (
                <div className="flex flex-wrap items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-navy-900/50 border border-navy-700/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-xs uppercase tracking-wider">Producer Balance</span>
                        <span className="font-serif text-gold font-bold text-2xl">{balance} credits</span>
                    </div>
                    <div className="h-10 w-px bg-navy-700/50 mx-2 hidden sm:block"></div>
                    <button
                        type="button"
                        onClick={() => navigate('/ai-producer/top-up')}
                        className="px-6 py-2 rounded-xl bg-gold text-navy-950 text-sm font-bold hover:bg-gold-shimmer transition-all shadow-lg shadow-gold/10"
                    >
                        Top up Credits
                    </button>
                </div>
            )}

            {/* Guest CTA */}
            {!isAuthenticated && (
                <div className="text-center py-6 px-6 rounded-2xl bg-navy-800/40 border border-navy-600/30">
                    <p className="text-gray-300 mb-4">Login to access advanced script analysis tools.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="px-6 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-sm font-bold hover:bg-gold/25 transition-colors"
                    >
                        Login as Professional
                    </button>
                </div>
            )}

            {/* Tool grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {AI_PRODUCER_TOOLS.map((tool, i) => {
                    const affordable = isAuthenticated && canAfford(tool.credits);
                    return (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative flex flex-col h-full rounded-2xl border border-navy-700/50 bg-navy-900/40 p-6 hover:border-gold/40 transition-all hover:bg-navy-900/60"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="p-3 rounded-lg bg-navy-800/50 text-gold group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <TierBadge tier={tool.creditTier} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-white mb-2">{tool.name}</h3>
                            <p className="text-gray-400 text-sm mb-6 flex-grow">{tool.description}</p>

                            <button
                                type="button"
                                disabled={!isAuthenticated || !affordable}
                                onClick={() => isAuthenticated && affordable && navigate(`/ai-producer/tool/${tool.id}`)}
                                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${isAuthenticated && affordable
                                        ? 'bg-navy-800 text-white border border-navy-600 hover:border-gold/50 hover:bg-navy-700'
                                        : 'bg-navy-950/50 border border-navy-800 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                {!isAuthenticated
                                    ? 'Login Required'
                                    : !affordable
                                        ? `Requires ${tool.credits} Credits`
                                        : 'Analyze Script'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-gold/5 to-teal-500/5 border border-white/5 p-8 text-center space-y-4 mt-12">
                <h4 className="text-gold font-bold">Why AI Producer?</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <p className="text-white text-sm font-medium">90% Faster</p>
                        <p className="text-gray-500 text-xs text-balance">Screening submissions in minutes</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white text-sm font-medium">Risk Proof</p>
                        <p className="text-gray-500 text-xs text-balance">Detect story similarities early</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white text-sm font-medium">Viability</p>
                        <p className="text-gray-500 text-xs text-balance">Budget and market assessment</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white text-sm font-medium">Data Driven</p>
                        <p className="text-gray-500 text-xs text-balance">Objective narrative ranking</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
