// Mock data for the Relics auction module
const relicsData = [
    {
        id: 1,
        name: 'Ancient Grimoire',
        type: 'rare',
        currentBid: 320000,
        endTime: Date.now() + 4 * 60 * 60 * 1000 + 59 * 60 * 1000,
        image: '/images/ancient_book.png',
        description:
            'A mystical tome of forbidden knowledge, bound in enchanted leather with ancient metal clasps. Its pages contain arcane scripts that shimmer with otherworldly power. Said to have been penned by a legendary sorcerer over centuries.',
        minimumIncrement: 5000,
        totalBids: 14,
        bids: [
            { id: 'b1-1', name: 'Arjun Patel', amount: 320000, time: Date.now() - 3 * 60 * 1000, avatar: '🧔' },
            { id: 'b1-2', name: 'Priya Singh', amount: 315000, time: Date.now() - 8 * 60 * 1000, avatar: '👩' },
            { id: 'b1-3', name: 'Rohan Kumar', amount: 310000, time: Date.now() - 15 * 60 * 1000, avatar: '👨' },
            { id: 'b1-4', name: 'Meera Joshi', amount: 300000, time: Date.now() - 22 * 60 * 1000, avatar: '👩‍🦰' },
            { id: 'b1-5', name: 'Dev Sharma', amount: 295000, time: Date.now() - 30 * 60 * 1000, avatar: '🧑' },
        ],
    },
    {
        id: 2,
        name: 'Legendary Crown',
        type: 'legendary',
        currentBid: 810000,
        endTime: Date.now() + 20 * 60 * 60 * 1000 + 33 * 60 * 1000,
        image: '/images/legendary_crown.png',
        description:
            'An iconic symbol of power in historic fantasy films, this legendary crown has graced the heads of rulers in timeless classics. Its amber-tinged gems and intricate design signify royal authority and power.',
        minimumIncrement: 5000,
        totalBids: 23,
        bids: [
            { id: 'b2-1', name: 'Vikram Sharma', amount: 810000, time: Date.now() - 5 * 60 * 1000, avatar: '👨‍💼' },
            { id: 'b2-2', name: 'Anjali Agarwal', amount: 805000, time: Date.now() - 11 * 60 * 1000, avatar: '👩‍💼' },
            { id: 'b2-3', name: 'Rahul Mehta', amount: 790000, time: Date.now() - 19 * 60 * 1000, avatar: '🧔‍♂️' },
            { id: 'b2-4', name: 'Sneha Kapoor', amount: 775000, time: Date.now() - 23 * 60 * 1000, avatar: '👩‍🎤' },
            { id: 'b2-5', name: 'Chirag Joshi', amount: 760000, time: Date.now() - 29 * 60 * 1000, avatar: '👨‍🎨' },
            { id: 'b2-6', name: 'Sakshi Pillai', amount: 750000, time: Date.now() - 33 * 60 * 1000, avatar: '👩‍🔬' },
        ],
    },
    {
        id: 3,
        name: 'Plasma Cannon',
        type: 'rare',
        currentBid: 250000,
        endTime: Date.now() + 1 * 60 * 60 * 1000 + 12 * 60 * 1000,
        image: '/images/scifi_weapon.png',
        description:
            'A devastating plasma-based weapon from the future. This fully functional prop features a glowing energy core and intricate mechanical details. Used in blockbuster sci-fi productions.',
        minimumIncrement: 5000,
        totalBids: 9,
        bids: [
            { id: 'b3-1', name: 'Karan Malhotra', amount: 250000, time: Date.now() - 2 * 60 * 1000, avatar: '🧑‍🚀' },
            { id: 'b3-2', name: 'Neha Verma', amount: 245000, time: Date.now() - 10 * 60 * 1000, avatar: '👩‍🚀' },
            { id: 'b3-3', name: 'Siddharth Rao', amount: 240000, time: Date.now() - 18 * 60 * 1000, avatar: '👨‍💻' },
        ],
    },
    {
        id: 4,
        name: 'Titan Mech Armor',
        type: 'legendary',
        currentBid: 950000,
        endTime: Date.now() + 59 * 60 * 60 * 1000 + 11 * 60 * 1000,
        image: '/images/mech_armor.png',
        description:
            'A colossal mechanized combat suit forged from titanium alloy with integrated energy systems. This one-of-a-kind artifact features glowing power conduits and battle-worn detailing from epic sci-fi sagas.',
        minimumIncrement: 10000,
        totalBids: 18,
        bids: [
            { id: 'b4-1', name: 'Aditya Reddy', amount: 950000, time: Date.now() - 7 * 60 * 1000, avatar: '🦸' },
            { id: 'b4-2', name: 'Pooja Nair', amount: 940000, time: Date.now() - 14 * 60 * 1000, avatar: '🦸‍♀️' },
            { id: 'b4-3', name: 'Manish Gupta', amount: 920000, time: Date.now() - 25 * 60 * 1000, avatar: '🦹' },
            { id: 'b4-4', name: 'Riya Deshmukh', amount: 900000, time: Date.now() - 35 * 60 * 1000, avatar: '🦹‍♀️' },
        ],
    },
    {
        id: 5,
        name: 'Diamond Ring',
        type: 'legendary',
        currentBid: 150000,
        endTime: Date.now() + 0.5 * 60 * 1000, // Ending very soon – triggers urgency
        image: '/images/diamond_ring.png',
        description:
            'Crafted from solid 18K rose gold. Set with 15 round-cut diamonds totalling 2.5 carats. Luxurious overlapping design with full pavé setting. Authentication certificate included for provenance.',
        minimumIncrement: 5000,
        totalBids: 31,
        bids: [
            { id: 'b5-1', name: 'Ananya Iyer', amount: 150000, time: Date.now() - 1 * 60 * 1000, avatar: '💎' },
            { id: 'b5-2', name: 'Kunal Shah', amount: 145000, time: Date.now() - 4 * 60 * 1000, avatar: '👨‍🦱' },
            { id: 'b5-3', name: 'Divya Menon', amount: 140000, time: Date.now() - 9 * 60 * 1000, avatar: '👩‍🦱' },
            { id: 'b5-4', name: 'Rajiv Das', amount: 135000, time: Date.now() - 16 * 60 * 1000, avatar: '🧔' },
        ],
    },
    {
        id: 6,
        name: 'Diamond Necklace',
        type: 'rare',
        currentBid: 420000,
        endTime: Date.now() + 8 * 60 * 60 * 1000,
        image: '/images/diamond_necklace.png',
        description:
            'A breathtaking diamond necklace with an elaborate gold filigree setting. Each stone is hand-selected for brilliance, creating a cascading waterfall of light around the wearer.',
        minimumIncrement: 5000,
        totalBids: 12,
        bids: [
            { id: 'b6-1', name: 'Trisha Rajan', amount: 420000, time: Date.now() - 6 * 60 * 1000, avatar: '👸' },
            { id: 'b6-2', name: 'Amit Bose', amount: 415000, time: Date.now() - 12 * 60 * 1000, avatar: '🤴' },
            { id: 'b6-3', name: 'Lavanya Nair', amount: 410000, time: Date.now() - 20 * 60 * 1000, avatar: '👩‍🎓' },
        ],
    },
];

// Random bidder names for simulated real-time bids
export const randomBidders = [
    { name: 'Aarav Gupta', avatar: '👨‍💼' },
    { name: 'Ishaan Reddy', avatar: '🧑‍💻' },
    { name: 'Kavya Sharma', avatar: '👩‍🎤' },
    { name: 'Nisha Patel', avatar: '👩‍💼' },
    { name: 'Omkar Jain', avatar: '🧔' },
    { name: 'Tanvi Desai', avatar: '👩' },
    { name: 'Yash Mehta', avatar: '👨' },
    { name: 'Zara Khan', avatar: '👩‍🚀' },
    { name: 'Vivek Nair', avatar: '🧑‍🎨' },
    { name: 'Simran Kaur', avatar: '👩‍🔬' },
];

export const formatPrice = (price) => {
    return '₹' + price.toLocaleString('en-IN');
};

export const timeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
};

export default relicsData;
