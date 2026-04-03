import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import logo from '../assets/logo.png';
import { mockUsers } from '../mock/mockUsers';
import { useState } from 'react';

const navItems = [
    {
        to: '/reelity',
        label: 'Reelity Home',
        end: true,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        ),
    },
    {
        to: '/relics',
        label: 'Relics',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
        ),
    },
    {
        to: '/collectible-units',
        label: 'Collectible Units',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        ),
    },
    {
        to: '/reelity/clubs',
        label: 'Societies',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
    },
    {
        to: '/merchandise',
        label: 'Merchandise',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        ),
    },
    {
        to: '/ai-avatars',
        label: 'AI Avatars',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25m0 0A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m7.5 0A2.25 2.25 0 0118 11.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 18.75v-7.5A2.25 2.25 0 018.25 9m7.5 0h-7.5" />
            </svg>
        ),
    },
    {
        to: '/land',
        label: 'Land',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
        ),
    },
    {
        to: '/land-world',
        label: 'Land World',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5m18 0l-9-4.5-9 4.5m18 0L12 13l9-5.5m-18 0L3 13" />
            </svg>
        ),
    },
    {
        to: '/profile',
        label: 'Profile',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
];

export default function Sidebar() {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-50 bg-navy-950/95 backdrop-blur-xl border-r border-navy-600/30">
            {/* Logo - clickable to home */}
            <Link
                to="/"
                className="flex flex-col items-center py-8 border-b border-navy-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-inset rounded-lg transition-opacity hover:opacity-90 active:opacity-80"
                aria-label="SilverTriverse Home"
            >
                <div className="relative w-12 h-12 mb-2">
                    <img src={logo} alt="SilverTriverse Logo" className="w-full h-full object-contain filter drop-shadow-glow-gold" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-gold-shimmer mt-1">SilverTriverse</h1>
                <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase mt-1">Entertainment</p>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${isActive
                                ? 'bg-gold/10 text-gold border border-gold/20'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={isActive ? 'text-gold' : ''}
                                >
                                    {item.icon}
                                </motion.div>
                                <span className="font-medium text-sm">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                                        layoutId="sidebarIndicator"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Conditional Pipeline Link for Professionals */}
                {isAuthenticated && user?.role === 'professional' && (
                    <NavLink
                        to="/collectible-units/pipeline"
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${isActive
                                ? 'bg-teal-900/30 text-teal-400 border border-teal-500/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={isActive ? 'text-teal-400' : ''}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                    </svg>
                                </motion.div>
                                <span className="font-medium text-sm">Talent Pipeline</span>
                                {isActive && (
                                    <motion.div
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"
                                        layoutId="sidebarIndicator"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-navy-600/30 relative relative-footer-wrapper">
                {isAuthenticated ? (
                    <div className="flex flex-col">
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isProfileDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full left-4 right-4 mb-2 bg-navy-900 border border-navy-600/50 rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    <div className="py-2 px-3 border-b border-navy-800">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Switch Account</p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {mockUsers.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    login(u.id);
                                                    setIsProfileDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-navy-800 transition-colors ${user?.id === u.id ? 'bg-navy-800/80' : ''}`}
                                            >
                                                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-gold/20" />
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-200">{u.name}</p>
                                                    <p className="text-xs text-gold capitalize">{u.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-navy-800 p-2">
                                        <button onClick={() => { logout(); setIsProfileDropdownOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-navy-800 rounded-lg transition-colors text-sm font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between px-2 py-2">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 text-left hover:bg-navy-800/50 p-1 -ml-1 rounded-lg transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/40">
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-200">{user.name}</p>
                                    <p className="text-xs text-gold/80 capitalize">{user.role}</p>
                                </div>
                            </button>
                            <div className="flex items-center gap-2">
                                <NotificationBell />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <AnimatePresence>
                            {isProfileDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full left-4 right-4 mb-2 bg-navy-900 border border-navy-600/50 rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    <div className="py-2 px-3 border-b border-navy-800">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Login As</p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {mockUsers.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    login(u.id);
                                                    setIsProfileDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-navy-800 transition-colors"
                                            >
                                                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-gold/20" />
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-200">{u.name}</p>
                                                    <p className="text-xs text-gold capitalize">{u.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between px-2 py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-700 to-navy-700 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gold">S</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-300">Guest</p>
                                    <p className="text-xs text-gray-500">Free Tier</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="text-gold text-sm font-medium hover:text-white transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
