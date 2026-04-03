import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../mock/mockUsers';

const navItems = [
  { to: '/reelity', label: 'Reelity Home', end: true },
  { to: '/relics', label: 'Relics' },
  { to: '/collectible-units', label: 'Collectible Units' },
  { to: '/reelity/clubs', label: 'Societies' },
  { to: '/merchandise', label: 'Merchandise' },
  { to: '/ai-avatars', label: 'AI Avatars' },
  { to: '/leaderboard', label: 'Rankings' },
  { to: '/land', label: 'Land' },
  { to: '/land-world', label: 'Land World' },
  { to: '/profile', label: 'Profile' },
];

export default function MobileNavDrawer({ isOpen, onClose }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleClose = () => {
    setIsProfileDropdownOpen(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={handleClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-navy-950 border-l border-navy-600/50 z-[120] flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-navy-600/30">
              <Link to="/" onClick={handleClose} className="font-serif text-xl font-bold text-gold-shimmer">
                SilverTriverse
              </Link>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end === true}
                  onClick={handleClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 min-h-[44px] ${isActive ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-300 hover:bg-navy-800/80 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated && user?.role === 'professional' && (
                <NavLink
                  to="/collectible-units/pipeline"
                  onClick={handleClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 min-h-[44px] mt-2 ${isActive ? 'bg-teal-900/30 text-teal-400 border border-teal-500/30' : 'text-gray-300 hover:bg-navy-800/80 hover:text-teal-300'
                    }`
                  }
                >
                  Talent Pipeline
                </NavLink>
              )}
            </nav>

            <div className="p-4 border-t border-navy-600/30 relative">
              {isAuthenticated ? (
                <div className="flex flex-col">
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-4 right-4 mb-2 bg-navy-900 border border-navy-600/50 rounded-xl shadow-xl overflow-hidden z-[80]"
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
                              <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center text-sm">{u.avatar}</div>
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

                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center justify-between w-full px-2 py-2 hover:bg-navy-800/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/40">
                        <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                        <p className="text-xs text-gold capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-4 right-4 mb-2 bg-navy-900 border border-navy-600/50 rounded-xl shadow-xl overflow-hidden z-[80]"
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
                              <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center text-sm">{u.avatar}</div>
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
