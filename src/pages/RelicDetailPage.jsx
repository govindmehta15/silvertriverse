import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoldButton from '../components/GoldButton';
import Badge from '../components/Badge';
import CountdownTimer from '../components/CountdownTimer';
import { dispatchNotification, NotificationTypes } from '../utils/notificationDispatcher';
import { getData, updateData } from '../utils/storageService';

const relicData = {
    1: {
        name: 'Ancient Grimoire',
        type: 'rare',
        currentBid: 320000,
        endTime: Date.now() + 4 * 60 * 60 * 1000 + 59 * 60 * 1000,
        image: '/images/ancient_book.png',
        description: 'A mystical tome of forbidden knowledge, bound in enchanted leather with ancient metal clasps. Its pages contain arcane scripts that shimmer with otherworldly power. Said to have been penned by a legendary sorcerer over centuries.',
        minimumIncrement: 5000,
        bids: [
            { name: 'Arjun Patel', amount: 320000, time: '3m ago', avatar: '🧔' },
            { name: 'Priya Singh', amount: 315000, time: '8m ago', avatar: '👩' },
            { name: 'Rohan Kumar', amount: 310000, time: '15m ago', avatar: '👨' },
            { name: 'Meera Joshi', amount: 300000, time: '22m ago', avatar: '👩‍🦰' },
            { name: 'Dev Sharma', amount: 295000, time: '30m ago', avatar: '🧑' },
        ],
    },
    2: {
        name: 'Legendary Crown',
        type: 'legendary',
        currentBid: 810000,
        endTime: Date.now() + 20 * 60 * 60 * 1000 + 33 * 60 * 1000,
        image: '/images/legendary_crown.png',
        description: 'An iconic symbol of power in historic fantasy films, this legendary crown has graced the heads of rulers in timeless classics. Its amber-tinged gems and intricate design signify royal authority and power.',
        minimumIncrement: 5000,
        bids: [
            { name: 'Vikram Sharma', amount: 810000, time: '5m ago', avatar: '👨‍💼' },
            { name: 'Anjali Agarwal', amount: 805000, time: '11m ago', avatar: '👩‍💼' },
            { name: 'Rahul Mehta', amount: 790000, time: '19m ago', avatar: '🧔‍♂️' },
            { name: 'Sneha Kapoor', amount: 775000, time: '23m ago', avatar: '👩‍🎤' },
            { name: 'Chirag Joshi', amount: 760000, time: '29m ago', avatar: '👨‍🎨' },
            { name: 'Sakshi Pillai', amount: 750000, time: '33m ago', avatar: '👩‍🔬' },
        ],
    },
    3: {
        name: 'Plasma Cannon',
        type: 'rare',
        currentBid: 250000,
        endTime: Date.now() + 1 * 60 * 60 * 1000 + 12 * 60 * 1000,
        image: '/images/scifi_weapon.png',
        description: 'A devastating plasma-based weapon from the future. This fully functional prop features a glowing energy core and intricate mechanical details. Used in blockbuster sci-fi productions.',
        minimumIncrement: 5000,
        bids: [
            { name: 'Karan Malhotra', amount: 250000, time: '2m ago', avatar: '🧑‍🚀' },
            { name: 'Neha Verma', amount: 245000, time: '10m ago', avatar: '👩‍🚀' },
            { name: 'Siddharth Rao', amount: 240000, time: '18m ago', avatar: '👨‍💻' },
        ],
    },
    4: {
        name: 'Titan Mech Armor',
        type: 'legendary',
        currentBid: 950000,
        endTime: Date.now() + 59 * 60 * 60 * 1000 + 11 * 60 * 1000,
        image: '/images/mech_armor.png',
        description: 'A colossal mechanized combat suit forged from titanium alloy with integrated energy systems. This one-of-a-kind artifact features glowing power conduits and battle-worn detailing from epic sci-fi sagas.',
        minimumIncrement: 10000,
        bids: [
            { name: 'Aditya Reddy', amount: 950000, time: '7m ago', avatar: '🦸' },
            { name: 'Pooja Nair', amount: 940000, time: '14m ago', avatar: '🦸‍♀️' },
            { name: 'Manish Gupta', amount: 920000, time: '25m ago', avatar: '🦹' },
            { name: 'Riya Deshmukh', amount: 900000, time: '35m ago', avatar: '🦹‍♀️' },
        ],
    },
};

const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

export default function RelicDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const relic = relicData[id];
    const [bidAmount, setBidAmount] = useState('');
    const [localBids, setLocalBids] = useState(relic ? relic.bids : []);
    const [currentBid, setCurrentBid] = useState(relic ? relic.currentBid : 0);

    const handlePlaceBid = () => {
        const amount = Number(bidAmount);
        const nextBid = currentBid + relic.minimumIncrement;
        if (!amount || amount < nextBid) {
            dispatchNotification(NotificationTypes.ERROR, 'Bid To Low', `Minimum bid is ${formatPrice(nextBid)}`);
            return;
        }

        // Local state update
        setCurrentBid(amount);
        setLocalBids([{ name: 'You', amount: amount, time: 'Just now', avatar: '🔥' }, ...localBids]);
        setBidAmount('');

        // Store bid globally for profile
        updateData('user_bids', (bids = []) => {
            return [{
                id: `bid_${Date.now()}`,
                relicId: id,
                relicName: relic.name,
                amount: amount,
                timestamp: Date.now()
            }, ...bids];
        });

        // Show success
        dispatchNotification(NotificationTypes.SUCCESS, 'Bid Placed!', `Successfully bid ${formatPrice(amount)} on ${relic.name}`);
    };

    if (!relic) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Relic not found.</p>
            </div>
        );
    }

    const nextBid = currentBid + relic.minimumIncrement;

    return (
        <div className="min-h-screen pb-4">
            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/relics')}
                className="fixed top-4 left-4 lg:left-[17rem] z-50 w-10 h-10 rounded-full bg-navy-800/80 backdrop-blur-sm border border-navy-600/50 flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>

            {/* Hero image */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
            >
                <div className="aspect-[4/3] md:aspect-[16/9] max-h-[50vh] overflow-hidden">
                    <img
                        src={relic.image}
                        alt={relic.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/30 to-transparent" />
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge type={relic.type} className="mb-3" />
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-white uppercase tracking-wider">
                        {relic.name}
                    </h1>
                </div>
            </motion.div>

            {/* Timer */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-6 py-4 text-center border-b border-navy-600/30"
            >
                <p className="text-gray-400 text-sm">TIME REMAINING</p>
                <CountdownTimer endTime={relic.endTime} className="text-xl mt-1" />
                <p className="text-gray-500 text-xs mt-1">Auction ends when timer reaches zero</p>
            </motion.div>

            {/* Content grid */}
            <div className="px-4 md:px-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Description + Bid */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="font-serif text-xl text-gold font-bold mb-3">Description</h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                        {relic.description}
                    </p>

                    {/* Bid section */}
                    <div className="card-luxury p-5">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Bid</p>
                        <p className="text-gold font-serif font-bold text-2xl mb-4">
                            {formatPrice(currentBid)}
                        </p>

                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                            Your Bid:
                        </label>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`Min: ${formatPrice(nextBid)}`}
                            className="w-full px-4 py-3 bg-navy-800/80 border border-navy-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gold/40 focus:shadow-glow-gold transition-all duration-300 mb-4"
                        />

                        <GoldButton onClick={handlePlaceBid} className="w-full text-center justify-center" size="lg">
                            PLACE BID {formatPrice(nextBid)}
                        </GoldButton>
                        <p className="text-gray-500 text-xs text-center mt-2">
                            {formatPrice(relic.minimumIncrement)} minimum increment
                        </p>
                    </div>
                </motion.div>

                {/* Right: Latest Bids */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="font-serif text-xl text-gold font-bold mb-3">Latest Bids</h2>
                    <div className="space-y-3">
                        {localBids.map((bid, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.08 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-navy-800/40 border border-navy-600/20 hover:border-gold/20 transition-all duration-200"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-800 to-navy-700 flex items-center justify-center text-lg shrink-0">
                                    {bid.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-200 truncate">{bid.name}</p>
                                    <p className="text-gold font-bold text-sm">{formatPrice(bid.amount)}</p>
                                </div>
                                <span className="text-xs text-gray-500 shrink-0">{bid.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
