import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
    {
        to: '/reelity',
        label: 'Reelity',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
    },
    {
        to: '/relics',
        label: 'Relics',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
        ),
    },
    {
        to: '/',
        label: 'Yours',
        icon: null,
        isCenter: true,
    },
    {
        to: '/fcu',
        label: 'FCU',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        ),
    },
    {
        to: '/reelity/clubs',
        label: 'Societies',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
    },
    {
        to: '/merchandise',
        label: 'Merchandise',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        ),
    },
    {
        to: '/ai-writer',
        label: 'AI Writer',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
        ),
    },
    {
        to: '/ai-producer',
        label: 'AI Producer',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        to: '/land',
        label: 'Land',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
        ),
    },
    {
        to: '/profile',
        label: 'Profile',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const { isAuthenticated, user } = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <div className="bg-navy-950/95 backdrop-blur-xl border-t border-navy-600/50">
                <div className="flex items-center justify-around h-16 px-1 sm:px-2 min-h-[64px]">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.isCenter ? 'center' : `${item.to}-${index}`}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `nav-item flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 active:bg-navy-800/50 ${isActive ? 'active' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {item.isCenter ? (
                                        <motion.div
                                            className="relative -mt-5 w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-glow-gold focus:outline-none"
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.92 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        >
                                            <span className="text-navy-900 font-serif font-bold text-xl" aria-hidden>Y</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            className="relative flex items-center justify-center"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        >
                                            {item.to === '/profile' && isAuthenticated ? (
                                                <div className="w-6 h-6 rounded-full overflow-hidden border border-gold/40 mx-auto">
                                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                item.icon
                                            )}

                                            {isActive && (
                                                <motion.div
                                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                                                    layoutId="bottomNavIndicator"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                />
                                            )}
                                        </motion.div>
                                    )}
                                    <span className={`text-[10px] mt-0.5 truncate max-w-[64px] text-center ${item.isCenter ? 'text-gold font-semibold' : ''}`}>
                                        {item.isCenter ? 'Yours' : item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
