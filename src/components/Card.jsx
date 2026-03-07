import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick, variant = 'default', glowing = false }) {
    const baseClasses = 'card-luxury overflow-hidden';

    const variants = {
        default: '',
        legendary: 'glow-border-legendary',
        rare: 'glow-border-gold',
    };

    return (
        <motion.div
            className={`${baseClasses} ${variants[variant]} ${glowing ? 'animate-pulse-glow' : ''} ${className}`}
            whileHover={{
                scale: 1.03,
                boxShadow: '0 0 25px rgba(201, 162, 39, 0.4), 0 8px 30px rgba(0, 0, 0, 0.5)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {children}
        </motion.div>
    );
}
