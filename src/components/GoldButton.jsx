import { motion } from 'framer-motion';

export default function GoldButton({ children, onClick, className = '', size = 'md', disabled = false }) {
    const sizes = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3 text-lg',
    };

    return (
        <motion.button
            className={`gold-btn ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            onClick={disabled ? undefined : onClick}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
            {children}
        </motion.button>
    );
}
