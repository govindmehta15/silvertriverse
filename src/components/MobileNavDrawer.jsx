import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/reelity', label: 'Reelity' },
  { to: '/relics', label: 'Relics' },
  { to: '/fcu', label: 'FCU' },
  { to: '/reelity/clubs', label: 'Societies' },
  { to: '/merchandise', label: 'Merchandise' },
  { to: '/ai-writer', label: 'AI Writer' },
  { to: '/ai-producer', label: 'AI Producer' },
  { to: '/leaderboard', label: 'Rankings' },
  { to: '/land', label: 'Land' },
  { to: '/profile', label: 'Profile' },
];

export default function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger - visible only on mobile/tablet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-3 left-3 z-40 w-10 h-10 flex items-center justify-center rounded-lg bg-navy-800/80 border border-navy-600/50 text-gray-300 hover:text-gold hover:border-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={close}
              aria-hidden
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-navy-950 border-r border-navy-600/50 z-[70] lg:hidden flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-navy-600/30">
                <Link to="/" onClick={close} className="font-serif text-xl font-bold text-gold-shimmer">
                  YOURS
                </Link>
                <button
                  type="button"
                  onClick={close}
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
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 min-h-[44px] ${
                        isActive ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-300 hover:bg-navy-800/80 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                {isAuthenticated && user?.role === 'professional' && (
                  <NavLink
                    to="/fcu/pipeline"
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 min-h-[44px] mt-2 ${
                        isActive ? 'bg-teal-900/30 text-teal-400 border border-teal-500/30' : 'text-gray-300 hover:bg-navy-800/80 hover:text-teal-300'
                      }`
                    }
                  >
                    Talent Pipeline
                  </NavLink>
                )}
              </nav>
              <div className="p-4 border-t border-navy-600/30">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3 px-2">
                    <img src={user?.avatar} alt="" className="w-9 h-9 rounded-full border border-gold/30" />
                    <div>
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-gold capitalize">{user?.role}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm px-2">Guest · Free Tier</p>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
