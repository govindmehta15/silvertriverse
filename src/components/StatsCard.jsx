import { motion } from 'framer-motion';

export default function StatsCard({ icon, value, label, className = '' }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(201,162,39,0.2)' }}
            className={`card-luxury p-4 text-center ${className}`}
        >
            <div className="text-xl mb-1.5">{icon}</div>
            <p className="text-gold font-serif font-bold text-2xl leading-none">{value}</p>
            <p className="text-gray-500 text-[11px] mt-1.5 leading-tight">{label}</p>
        </motion.div>
    );
}
