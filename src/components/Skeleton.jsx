import { motion } from 'framer-motion';

export function SkeletonCard() {
    return (
        <div className="card-luxury p-3">
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full aspect-square bg-navy-800 rounded-lg mb-3"
            />
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="h-4 w-3/4 bg-navy-700 rounded mb-2"
            />
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="h-3 w-1/2 bg-navy-800 rounded"
            />
        </div>
    );
}

export function SkeletonBanner() {
    return (
        <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full aspect-video bg-navy-800 rounded-xl mb-6"
        />
    );
}

export function SkeletonText() {
    return (
        <div className="space-y-3">
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-4 w-full bg-navy-800 rounded"
            />
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                className="h-4 w-5/6 bg-navy-800 rounded"
            />
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="h-4 w-4/6 bg-navy-800 rounded"
            />
        </div>
    );
}
