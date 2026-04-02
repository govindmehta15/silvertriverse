import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCredits } from '../context/CreditsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TOPUP_OPTIONS = [
    { amount: 1000, credits: 25000, label: 'Starter' },
    { amount: 5000, credits: 150000, label: 'Professional', popular: true },
    { amount: 10000, credits: 400000, label: 'Studio' },
    { amount: 25000, credits: 1200000, label: 'Enterprise' },
];

export default function AIProducerTopUpPage() {
    const navigate = useNavigate();
    const { addCredits } = useCredits();
    const { user } = useAuth();
    const { addToast } = useToast();

    const handleTopUp = async (option) => {
        if (!user?.id) {
            addToast('Please login to top up credits.', 'error');
            return;
        }
        const res = await addCredits(option.credits, user.id);
        if (res.success) {
            addToast(`Added ${option.credits.toLocaleString()} credits successfully.`, 'success');
            return;
        }
        addToast(res.error || 'Top-up failed. Please try again.', 'error');
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>

            <div className="text-center mb-12">
                <h1 className="font-serif text-3xl font-bold text-white mb-2">Top-up Producer Credits</h1>
                <p className="text-gray-400">Add credits to your account to process more submissions.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {TOPUP_OPTIONS.map((opt) => (
                    <motion.div
                        key={opt.amount}
                        whileHover={{ y: -4 }}
                        className={`relative rounded-2xl border p-6 flex flex-col items-center ${opt.popular ? 'bg-navy-900/50 border-gold shadow-lg shadow-gold/10' : 'bg-navy-900/30 border-navy-700/50'
                            }`}
                    >
                        {opt.popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                Most Popular
                            </span>
                        )}
                        <span className="text-gray-400 text-sm font-medium mb-4">{opt.label}</span>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="font-serif text-4xl font-bold text-white">{opt.credits}</span>
                            <span className="text-gold font-medium text-sm">credits</span>
                        </div>
                        <p className="text-emerald-400 font-bold mb-6 text-xl">₹{opt.amount.toLocaleString()}</p>

                        <button
                            type="button"
                            onClick={() => handleTopUp(opt)}
                            className="w-full py-3 rounded-xl bg-gold text-navy-950 font-bold hover:bg-gold-shimmer transition-all shadow-md mt-auto"
                        >
                            Select Plan
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-navy-900/40 border border-navy-700/50">
                <h3 className="text-white font-serif font-bold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-200 text-sm font-medium">Do credits expire?</p>
                        <p className="text-gray-500 text-sm">No, your producer credits never expire and roll over indefinitely.</p>
                    </div>
                    <div>
                        <p className="text-gray-200 text-sm font-medium">Can I transfer credits?</p>
                        <p className="text-gray-500 text-sm">Credits are non-transferable and are tied to your professional account.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
