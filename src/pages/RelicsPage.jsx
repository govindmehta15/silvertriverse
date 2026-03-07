import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Badge from '../components/Badge';
import CountdownTimer from '../components/CountdownTimer';

const relicItems = [
    {
        id: 1,
        name: 'Ancient Grimoire',
        type: 'rare',
        currentBid: 320000,
        endTime: Date.now() + 4 * 60 * 60 * 1000 + 59 * 60 * 1000,
        image: '/images/ancient_book.png',
    },
    {
        id: 2,
        name: 'Legendary Crown',
        type: 'legendary',
        currentBid: 810000,
        endTime: Date.now() + 20 * 60 * 60 * 1000 + 33 * 60 * 1000,
        image: '/images/legendary_crown.png',
    },
    {
        id: 3,
        name: 'Plasma Cannon',
        type: 'rare',
        currentBid: 250000,
        endTime: Date.now() + 1 * 60 * 60 * 1000 + 12 * 60 * 1000,
        image: '/images/scifi_weapon.png',
    },
    {
        id: 4,
        name: 'Titan Mech Armor',
        type: 'legendary',
        currentBid: 950000,
        endTime: Date.now() + 59 * 60 * 60 * 1000 + 11 * 60 * 1000,
        image: '/images/mech_armor.png',
    },
];

const formatPrice = (price) => {
    return '₹' + price.toLocaleString('en-IN');
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function RelicsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const filteredItems = relicItems.filter(
        (r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pb-4">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-teal-950/50 to-transparent" />
                <div className="absolute inset-0 cinematic-overlay" />

                <div className="relative px-4 pt-8 pb-6 text-center">
                    {/* Ornamental top */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gold/60 text-2xl mb-2"
                    >
                        ⚜
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="font-serif text-3xl md:text-4xl font-bold text-gold-shimmer tracking-wider"
                    >
                        RELICS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-sm mt-1 tracking-widest uppercase"
                    >
                        Auction House
                    </motion.p>

                    {/* Treasure chest visual hint */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 text-5xl"
                    >
                        🏛️
                    </motion.div>
                </div>
            </div>

            {/* Search bar */}
            <div className="px-4 mb-6">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search auctions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-navy-800/80 border border-navy-600/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold/40 focus:shadow-glow-gold transition-all duration-300"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Auction Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="px-4 grid grid-cols-2 gap-4"
            >
                {filteredItems.map((relic) => (
                    <motion.div key={relic.id} variants={item}>
                        <Card
                            variant={relic.type === 'legendary' ? 'legendary' : 'rare'}
                            onClick={() => navigate(`/relics/${relic.id}`)}
                            className="h-full"
                        >
                            {/* Badge + Timer row */}
                            <div className="flex items-start justify-between p-2 pb-0">
                                <Badge type={relic.type} />
                                <CountdownTimer endTime={relic.endTime} className="text-xs" />
                            </div>

                            {/* Image */}
                            <div className="p-3 pb-2">
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-navy-800">
                                    <img
                                        src={relic.image}
                                        alt={relic.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {relic.type === 'legendary' && (
                                        <div className="absolute inset-0 border-2 border-gold/20 rounded-lg pointer-events-none" />
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-3 pb-3">
                                <p className="text-xs text-gray-400">Current Bid</p>
                                <p className="text-gold font-serif font-bold text-lg">
                                    {formatPrice(relic.currentBid)}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
