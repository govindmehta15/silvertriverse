import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getData } from '../utils/storageService';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../mock/mockUsers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function ReelityPeoplePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const saved = getData('users');
    const allUsers = (saved && saved.length > 0) ? saved : mockUsers;

    const getPrestigeLabel = (u) => {
        const total = (u.participationScore || 0) + (u.ownedRelics?.length || 0) * 100;
        if (total >= 3000) return { name: 'Legendary', color: 'text-purple-400 bg-purple-900/30 border-purple-500/30' };
        if (total >= 1500) return { name: 'Gold', color: 'text-gold bg-gold/10 border-gold/30' };
        if (total >= 500) return { name: 'Silver', color: 'text-gray-300 bg-gray-700/50 border-gray-400/30' };
        return { name: 'Bronze', color: 'text-orange-400 bg-orange-900/30 border-orange-700/30' };
    };

    return (
        <div className="space-y-6">
            <h2 className="font-serif text-xl text-gold font-bold uppercase tracking-wide">People</h2>

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {allUsers.map(u => {
                    const prestige = getPrestigeLabel(u);
                    const isMe = user?.id === u.id;
                    return (
                        <Link
                            key={u.id}
                        to={isMe ? '/profile' : `/profile/${u.id}`}
                            className="flex items-center gap-4 bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 cursor-pointer hover:border-gold/30 transition-all block"
                        >
                            <div className="relative shrink-0">
                                <img src={u.avatar} alt={u.name} className="w-14 h-14 rounded-full border-2 border-navy-600 object-cover" />
                                {(u.role === 'creator' || u.role === 'professional') && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full border-2 border-navy-800 flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white text-sm font-semibold truncate group-hover:text-gold transition-colors">{u.name}</p>
                                    {isMe && <span className="text-[9px] text-gold bg-gold/10 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                                </div>
                                <p className="text-gray-400 text-xs truncate">@{u.username} · {u.role}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5 truncate">{u.bio}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${prestige.color}`}>
                                    {prestige.name}
                                </span>
                                <span className="text-gray-500 text-[10px]">{(u.followers || 0).toLocaleString()} fans</span>
                            </div>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
}
