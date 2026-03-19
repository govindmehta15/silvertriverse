import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTickerActivities } from '../services/simulationService';

export default function ActivityTicker() {
    const [activities, setActivities] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const loadActivities = () => {
        setActivities(getTickerActivities());
    };

    useEffect(() => {
        loadActivities();
        const handleUpdate = () => loadActivities();
        window.addEventListener('silvertriverse_ticker_update', handleUpdate);
        return () => window.removeEventListener('silvertriverse_ticker_update', handleUpdate);
    }, []);

    useEffect(() => {
        if (activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activities.length);
        }, 4000); // Rotate every 4 seconds
        return () => clearInterval(interval);
    }, [activities]);

    if (activities.length === 0) return null;

    return (
        <div className="bg-navy-950 border-b border-navy-700/50 flex items-center px-4 py-1.5 overflow-hidden sticky xl:fixed top-0 left-0 right-0 z-[60] text-xs font-medium tracking-wide">
            <span className="text-gold uppercase font-bold mr-3 shrink-0 flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                Live
            </span>
            <div className="relative h-4 flex-1 overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                        {activities[currentIndex]?.message}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
