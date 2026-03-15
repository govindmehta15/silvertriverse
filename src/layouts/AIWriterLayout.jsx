import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const aiWriterTabs = [
  { to: '/ai-writer', label: 'Hub', icon: '✒️', end: true },
  { to: '/ai-writer/history', label: 'History', icon: '📋' },
];

export default function AIWriterLayout() {
  return (
    <div className="pb-24 lg:pb-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-amber-950/20 to-transparent" />
        <div className="relative px-4 pt-8 pb-2 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-serif text-3xl md:text-4xl font-bold text-white tracking-widest uppercase mb-1"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
          >
            AI Writer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xs tracking-widest uppercase"
          >
            The Creative Empowerment Engine for Writers, Students & Creators
          </motion.p>
        </div>
      </div>

      <div className="sticky top-7 z-40 bg-navy-950/95 backdrop-blur-xl border-b border-navy-700/50">
        <nav className="max-w-3xl mx-auto flex items-center gap-1 px-4 py-2 overflow-x-auto hide-scrollbar">
          {aiWriterTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'
                }`
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Outlet />
      </div>
    </div>
  );
}
