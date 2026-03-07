import { motion } from 'framer-motion';

export default function TagBadge({ label, active = false, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
        px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
        ${active
                    ? 'bg-gold/15 border-gold/40 text-gold shadow-glow-gold'
                    : 'bg-navy-800/60 border-navy-600/40 text-gray-400 hover:text-gray-200 hover:border-navy-500'
                }
      `}
        >
            {label}
        </motion.button>
    );
}
