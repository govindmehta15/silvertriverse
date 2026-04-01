import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge';

export default function FilmCard({ film, category = 'film' }) {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{
                scale: 1.02,
                boxShadow: '0 0 30px rgba(201,162,39,0.25), 0 8px 30px rgba(0,0,0,0.5)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/collectible-units/${category}/${film.id}`)}
            className="card-luxury overflow-hidden cursor-pointer group"
        >
            {/* Banner */}
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={film.banner}
                    alt={film.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" />

                {/* Creator badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/40">
                        <img src={film.creatorAvatar} alt={film.creator} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-gray-300 font-medium">{film.creator}</span>
                </div>

                {/* Engagement */}
                <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        {film.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {film.supporters}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">
                    {film.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    {film.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-medium rounded bg-navy-700/60 text-gray-400 border border-navy-600/30"
                        >
                            {tag}
                        </span>
                    ))}
                    {film.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] text-gray-500">
                            +{film.tags.length - 3}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
