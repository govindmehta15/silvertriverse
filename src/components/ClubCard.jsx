import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ClubCard({ community }) {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="group relative bg-zinc-900 border border-gold/10 hover:border-gold/40 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 shadow-md hover:shadow-[0_0_30px_rgba(201,162,39,0.15)] overflow-hidden"
            onClick={() => navigate(`/reelity/clubs/${community.id}`)}
        >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-900 via-zinc-800 to-black flex items-center justify-center text-gold font-serif text-2xl border border-gold/20 shrink-0 relative z-10">
                {community.name?.charAt(0) || 'C'}
            </div>

            <div className="flex-1 min-w-0 relative z-10">
                <h4 className="text-white text-base font-serif tracking-wide truncate">{community.name}</h4>
                <p className="text-zinc-400 text-xs mt-0.5 truncate flex items-center gap-2">
                    <span className="flex items-center gap-1 text-teal-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        {community.members?.length || 0}
                    </span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span>{community.topic}</span>
                </p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); navigate(`/reelity/clubs/${community.id}`); }}
                className="px-4 py-2 bg-transparent text-gold text-[10px] uppercase tracking-widest font-bold rounded-lg border border-gold/30 hover:bg-gold hover:text-zinc-950 transition-colors shrink-0 relative z-10"
            >
                Enter Room
            </button>
        </motion.div>
    );
}
