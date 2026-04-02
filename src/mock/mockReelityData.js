// Seed stories (24hr)
export const mockStories = [
    {
        id: 'st_1',
        userId: 'u1',
        userName: 'Natalie Portman',
        userAvatar: '/images/profile_avatar.png',
        image: '/images/leather_jacket.png',
        caption: 'Behind the scenes at Horizon Studios ✨',
        timestamp: Date.now() - 3600000 * 2 // 2 hours ago
    },
    {
        id: 'st_2',
        userId: 'u2',
        userName: 'Elias Vance',
        userAvatar: '/images/leather_jacket.png',
        image: '/images/profile_avatar.png',
        caption: 'Writing the next thriller screenplay 🎬',
        timestamp: Date.now() - 3600000 * 5 // 5 hours ago
    },
    {
        id: 'st_3',
        userId: 'u4',
        userName: 'Marcus Thorne',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        image: '/images/leather_jacket.png',
        caption: 'Casting call for Sci-Fi epic!',
        timestamp: Date.now() - 3600000 * 10 // 10 hours ago
    }
];

// Seed feed items — mixed types: social, cultural, commerce
export const mockFeedItems = [
    {
        id: 'fp_1',
        type: 'social',
        authorId: 'u1',
        authorName: 'Natalie Portman',
        authorAvatar: '/images/profile_avatar.png',
        image: '/images/leather_jacket.png',
        caption: 'Just wrapped the final scene. This film is going to change everything. 🎥',
        tags: [{ userId: 'u2', name: 'Elias Vance', tagType: 'friend' }],
        likes: ['u2', 'u3'],
        comments: [
            { id: 'fc_1', authorId: 'u2', authorName: 'Elias Vance', text: 'Can\'t wait to see this!', timestamp: Date.now() - 3600000 }
        ],
        timestamp: Date.now() - 3600000 * 1
    },
    {
        id: 'fp_2',
        type: 'cultural',
        title: 'Collectible Units story pitch trending',
        message: '"The Last Signal" by Elias Vance has received 200+ upvotes on the Film Creative Universe.',
        icon: '🔥',
        timestamp: Date.now() - 3600000 * 2
    },
    {
        id: 'fp_3',
        type: 'social',
        authorId: 'u3',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        image: '/images/profile_avatar.png',
        caption: 'My first relic! So excited to own a piece of film history 🏛️',
        tags: [{ userId: 'u1', name: 'Natalie Portman', tagType: 'fan' }],
        likes: ['u1', 'u4'],
        comments: [],
        timestamp: Date.now() - 3600000 * 4
    },
    {
        id: 'fp_4',
        type: 'commerce',
        title: 'New Relic Drop',
        message: 'A legendary prop from "Neon Horizon" is now live in the Auction House. Starting bid: $500.',
        icon: '🏛️',
        link: '/relics',
        timestamp: Date.now() - 3600000 * 6
    },
    {
        id: 'fp_5',
        type: 'cultural',
        title: 'Community Milestone',
        message: 'The Sci-Fi Writers Club just reached 500 members! Join the conversation.',
        icon: '🎉',
        timestamp: Date.now() - 3600000 * 8
    },
    {
        id: 'fp_6',
        type: 'commerce',
        title: 'Merch Launch',
        message: 'The exclusive Neon Horizon leather jacket is now available in the Merchandise store.',
        icon: '🛍️',
        link: '/merchandise',
        timestamp: Date.now() - 3600000 * 10
    },
    {
        id: 'fp_7',
        type: 'social',
        authorId: 'u2',
        authorName: 'Elias Vance',
        authorAvatar: '/images/leather_jacket.png',
        image: '/images/leather_jacket.png',
        caption: 'Collaboration with @natalie_p was incredible. Grateful for this creative journey.',
        tags: [{ userId: 'u1', name: 'Natalie Portman', tagType: 'friend' }],
        likes: ['u1', 'u3', 'u4'],
        comments: [
            { id: 'fc_2', authorId: 'u1', authorName: 'Natalie Portman', text: 'Likewise! The best is yet to come 🌟', timestamp: Date.now() - 3600000 * 11 }
        ],
        timestamp: Date.now() - 3600000 * 12
    },
    {
        id: 'fp_8',
        type: 'social',
        authorId: 'u4',
        authorName: 'Marcus Thorne',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        image: '/images/film_scifi.png',
        caption: 'Audition shortlist locked. Neon Horizon casting board is stacked this week.',
        likes: ['u1', 'u2', 'u3'],
        comments: [
            { id: 'fc_3', authorId: 'u3', authorName: 'Sarah Jenkins', text: 'This looks incredible 🔥', timestamp: Date.now() - 3600000 * 13 }
        ],
        timestamp: Date.now() - 3600000 * 13
    },
    {
        id: 'fp_9',
        type: 'commerce',
        title: 'Land World Expansion Live',
        message: 'New districts opened in Land World with large metaverse city blocks and scenic zones.',
        icon: '🗺️',
        image: '/images/grass_texture.png',
        link: '/land-world',
        timestamp: Date.now() - 3600000 * 14
    },
    {
        id: 'fp_10',
        type: 'cultural',
        title: 'Writers Room Challenge',
        message: '24-hour Neo-Noir challenge reached 1,200 submissions in AI Lab.',
        icon: '🧠',
        image: '/images/film_thriller.png',
        timestamp: Date.now() - 3600000 * 16
    },
    {
        id: 'fp_11',
        type: 'social',
        authorId: 'u1',
        authorName: 'Natalie Portman',
        authorAvatar: '/images/profile_avatar.png',
        image: '/images/diamond_necklace.png',
        caption: 'Styling tests for the gala premiere. Which look should make the final cut?',
        likes: ['u2', 'u3', 'u4'],
        comments: [
            { id: 'fc_4', authorId: 'u2', authorName: 'Elias Vance', text: 'The silver set is perfect for this arc.', timestamp: Date.now() - 3600000 * 16.5 }
        ],
        timestamp: Date.now() - 3600000 * 17
    },
    {
        id: 'fp_12',
        type: 'commerce',
        title: 'Premium Merch Restock',
        message: 'Aetherion Chronograph restocked for 90 minutes. Priority goes to high-rank collectors.',
        icon: '⌚',
        image: '/images/bomber_jacket.png',
        link: '/merchandise',
        timestamp: Date.now() - 3600000 * 18
    },
    {
        id: 'fp_13',
        type: 'cultural',
        title: 'Club Pulse',
        message: 'Sci-Fi Writers Club and Relic Hunters Club crossed 2,000 combined members.',
        icon: '🌐',
        image: '/images/profile_avatar.png',
        timestamp: Date.now() - 3600000 * 19
    },
    {
        id: 'fp_14',
        type: 'social',
        authorId: 'u3',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        image: '/images/scifi_weapon.png',
        caption: 'Won my first live auction bid tonight. Still shaking.',
        likes: ['u1', 'u4'],
        comments: [],
        timestamp: Date.now() - 3600000 * 21
    },
    {
        id: 'fp_15',
        type: 'commerce',
        title: 'Reelity Battle Window',
        message: 'Voting is open for this week’s cinematic showdown. Winner receives bonus distribution.',
        icon: '🎬',
        image: '/images/film_scifi.png',
        link: '/reelity',
        timestamp: Date.now() - 3600000 * 22
    }
];
