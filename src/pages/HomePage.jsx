import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    to: '/reelity',
    title: 'Reelity',
    description: 'Social feed, stories, people & clubs.',
    icon: '📰',
    gradient: 'from-teal-900/60 to-navy-900',
    borderGlow: 'hover:shadow-glow-rare',
  },
  {
    to: '/relics',
    title: 'Relics',
    description: 'Collect & bid on rare film assets.',
    icon: '🏛️',
    gradient: 'from-amber-900/50 to-navy-900',
    borderGlow: 'hover:shadow-glow-gold',
  },
  {
    to: '/collectible-units',
    title: 'Collectible Units',
    description: 'Explore sports, film, and multi-category collectible units.',
    icon: '🎬',
    gradient: 'from-gold-900/40 to-navy-900',
    borderGlow: 'hover:shadow-glow-gold',
  },
  {
    to: '/reelity/clubs',
    title: 'Societies',
    description: 'Clubs and communities.',
    icon: '👥',
    gradient: 'from-indigo-900/50 to-navy-900',
    borderGlow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]',
  },
  {
    to: '/merchandise',
    title: 'Merchandise',
    description: 'Shop official gear & collectibles.',
    icon: '🛍️',
    gradient: 'from-rose-900/40 to-navy-900',
    borderGlow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]',
  },
  {
    to: '/ai-writer',
    title: 'AI Writer',
    description: 'Creative tools for writers & creators.',
    icon: '✒️',
    gradient: 'from-amber-950/60 to-navy-900',
    borderGlow: 'hover:shadow-glow-gold',
  },
  {
    to: '/ai-producer',
    title: 'AI Producer',
    description: 'Screening & discovery for studios.',
    icon: '📋',
    gradient: 'from-teal-800/50 to-navy-900',
    borderGlow: 'hover:shadow-glow-rare',
  },
  {
    to: '/leaderboard',
    title: 'Rankings',
    description: 'Leaderboards & standings.',
    icon: '🏆',
    gradient: 'from-gold-900/30 to-navy-900',
    borderGlow: 'hover:shadow-glow-gold',
  },
  {
    to: '/land',
    title: 'Land',
    description: 'Virtual plots — buy one to unlock premium profile themes.',
    icon: '🗺️',
    gradient: 'from-emerald-900/50 to-navy-900',
    borderGlow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
  },
  {
    to: '/profile',
    title: 'Profile',
    description: 'Your account & settings.',
    icon: '👤',
    gradient: 'from-navy-700 to-navy-900',
    borderGlow: 'hover:shadow-[0_0_15px_rgba(201,162,39,0.3)]',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden pt-3 pb-10 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-2"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}
          >
            SilverTriverse
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-gray-400 text-sm sm:text-base tracking-[0.2em] uppercase mb-1"
          >
            Entertainment
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto"
          >
            Explore films, creators, and experiences
          </motion.p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-serif text-xl sm:text-2xl font-bold text-gold mb-6 text-center"
        >
          Explore
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.35 }}
            >
              <Link
                to={feature.to}
                className={`block rounded-2xl border border-navy-600/50 bg-gradient-to-br ${feature.gradient} p-5 sm:p-6 transition-all duration-300 ${feature.borderGlow} hover:border-gold/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950`}
              >
                <span className="text-3xl sm:text-4xl mb-3 block" aria-hidden>
                  {feature.icon}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-gold text-sm font-medium">
                  Open
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
