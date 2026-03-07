import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { authService } from '../services';

export default function PostCard({ post }) {
    const [liked, setLiked] = useState(post.liked || false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [showHeart, setShowHeart] = useState(false);

    const handleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        // Add participation score on like implicitly here
        authService.getCurrentUser().then(res => {
            if (res.success && !liked) {
                // simple hack for simulation
                const users = JSON.parse(localStorage.getItem('users'));
                const userIndex = users.findIndex(u => u.id === res.data.id);
                if (userIndex > -1) {
                    users[userIndex].participationScore = (users[userIndex].participationScore || 0) + 2;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
        });
    };

    const handleDoubleTap = () => {
        if (!liked) {
            setLiked(true);
            setLikeCount((prev) => prev + 1);
        }
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxury overflow-hidden"
        >
            {/* Creator & Film header */}
            <div className="flex items-center gap-3 p-4 pb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-navy-600/50 shrink-0">
                    <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-200 truncate">{post.author}</p>
                        {post.film && (
                            <span className="text-[10px] uppercase font-bold text-gold px-2 py-0.5 rounded-full border border-gold/30 bg-gold/10 truncate max-w-[120px]">
                                {post.film}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500">{post.timestamp ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true }) : post.time}</p>
                </div>
                <button className="text-gray-500 hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Post image */}
            <div
                className="relative aspect-video overflow-hidden bg-navy-800 cursor-pointer"
                onDoubleClick={handleDoubleTap}
            >
                <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover"
                />

                {/* Double-tap heart animation */}
                <AnimatePresence>
                    {showHeart && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.4, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <svg className="w-20 h-20 text-red-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions + caption */}
            <div className="p-4 pt-3">
                {/* Action buttons */}
                <div className="flex items-center gap-4 mb-3">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleLike}
                        className="flex items-center gap-1.5 group"
                    >
                        <motion.svg
                            animate={liked ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            className={`w-6 h-6 transition-colors ${liked ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-200'}`}
                            fill={liked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={liked ? 0 : 1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </motion.svg>
                        <span className={`text-sm font-medium ${liked ? 'text-red-400' : 'text-gray-400'}`}>
                            {likeCount.toLocaleString()}
                        </span>
                    </motion.button>

                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors group">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                        <span className="text-sm font-medium">{post.comments}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors group">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        <span className="text-sm font-medium">Share</span>
                    </button>

                    <button className="ml-auto text-gray-400 hover:text-gold transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                    </button>
                </div>

                {/* Caption */}
                <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-gray-100">{post.author}</span>{' '}
                    {post.caption}
                </p>
            </div>
        </motion.div>
    );
}
