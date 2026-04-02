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
        to: '/reelity',
        label: 'SilverTriverse',
        icon: null,
        isCenter: true,
    },
    {
        to: '/collectible-units',
        label: 'Collectible Units',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        ),
    },
    {
        label: 'Menu',
        isMenu: true,
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        ),
    },
];

export default function BottomNav({ onMenuClick }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
            <div className="bg-navy-950/95 backdrop-blur-xl border-t border-navy-600/50">
                <div className="flex items-center justify-around h-16 px-1 sm:px-2 min-h-[64px]">
                    {navItems.map((item, index) => {
                        const content = (
                            <>
                                {item.isCenter ? (
                                    <motion.div
                                        className="relative -mt-5 w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-glow-gold focus:outline-none"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    >
                                        <span className="text-navy-900 font-serif font-bold text-xl" aria-hidden>S</span>
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
                                    </motion.div>
                                )}
                                <span className={`text-[10px] mt-0.5 truncate max-w-[64px] text-center ${item.isCenter ? 'text-gold font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </>
                        );

                        if (item.isMenu) {
                            return (
                                <button
                                    key="menu-trigger"
                                    onClick={onMenuClick}
                                    className="nav-item flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 active:bg-navy-800/50 text-gray-400"
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <NavLink
                                key={item.isCenter ? 'center' : `${item.to}-${index}`}
                                to={item.to}
                                end={item.to === '/reelity'}
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
                                                <span className="text-navy-900 font-serif font-bold text-xl" aria-hidden>S</span>
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
                                            {item.isCenter ? 'SilverTriverse' : item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
