import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function StoryViewer({ stories, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const DURATION = 5000; // 5 seconds per story
    const INTERVAL = 50; // Update every 50ms

    const goNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    goNext();
                    return 0;
                }
                return prev + (100 * INTERVAL / DURATION);
            });
        }, INTERVAL);
        return () => clearInterval(timer);
    }, [currentIndex, goNext]);

    const story = stories[currentIndex];
    if (!story) return null;

    const hoursAgo = (ts) => {
        const h = Math.floor((Date.now() - ts) / 3600000);
        return h < 1 ? 'Just now' : `${h}h ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex flex-col"
        >
            {/* Progress Bars */}
            <div className="flex gap-1 p-3 pt-4">
                {stories.map((_, i) => (
                    <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-75"
                            style={{
                                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2">
                <Link
                    to={`/profile?user=${story.userId}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <img src={story.userAvatar} alt={story.userName} className="w-8 h-8 rounded-full border border-white/30" />
                    <div>
                        <p className="text-white text-sm font-medium hover:text-gold transition-colors">{story.userName}</p>
                        <p className="text-white/50 text-[10px]">{hoursAgo(story.timestamp)}</p>
                    </div>
                </Link>
                <button onClick={onClose} className="text-white/70 hover:text-white text-2xl p-1">✕</button>
            </div>

            {/* Story Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Tap areas */}
                <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" aria-label="Previous" />
                <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" aria-label="Next" />

                <motion.img
                    key={story.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={story.image}
                    alt={story.caption}
                    className="max-h-[70vh] max-w-full object-contain rounded-xl"
                />
            </div>

            {/* Caption */}
            {story.caption && (
                <div className="px-6 py-4 text-center">
                    <p className="text-white text-sm">{story.caption}</p>
                </div>
            )}
        </motion.div>
    );
}
