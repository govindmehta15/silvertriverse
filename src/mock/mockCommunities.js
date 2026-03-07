export const mockCommunities = [
    {
        id: '1',
        name: 'The Writers Room',
        topic: 'Screenwriting',
        banner: '/images/profile_cover.png',
        members: ['pro_1', 'user1', 'user2', 'u1', 'guest'],
        posts: [
            {
                id: 'post1',
                authorId: 'pro_1',
                authorName: 'Elias Vance',
                content: 'Anyone have tips for pacing a thriller in the second act?',
                timestamp: Date.now() - 3600000,
            },
            {
                id: 'post2',
                authorId: 'user1',
                authorName: 'Alice',
                content: 'Looking for a writing partner for a sci-fi pilot.',
                timestamp: Date.now() - 86400000,
            },
            {
                id: 'post_w1',
                authorId: 'u2',
                authorName: 'Elias Vance',
                content: 'Working on the third act twist for "The Silhouette" prequel. Silence is sometimes the best dialogue.',
                timestamp: Date.now() - 172800000,
            },
            {
                id: 'post_w2',
                authorId: 'u4',
                authorName: 'Marcus Thorne',
                content: 'We are holding open casting next week. Looking for raw talent who can express a lot without words.',
                timestamp: Date.now() - 259200000,
            }
        ]
    },
    {
        id: '2',
        name: 'Indie Filmmakers Unite',
        topic: 'Production',
        banner: '/images/film_thriller.png',
        members: ['user3', 'user4', 'u1'],
        posts: [
            {
                id: 'post3',
                authorId: 'user3',
                authorName: 'Charlie',
                content: 'What lenses do you recommend for shooting in low light?',
                timestamp: Date.now() - 7200000,
            },
            {
                id: 'post_i1',
                authorId: 'u1',
                authorName: 'Natalie Portman',
                content: 'Just experimented with anamorphic lenses on a small sensor. The distortion is surprisingly intimate in claustrophobic sets.',
                timestamp: Date.now() - 14400000,
            },
            {
                id: 'post_i2',
                authorId: 'u2',
                authorName: 'Elias Vance',
                content: 'Shadows tell the best stories. Try underexposing your subject for a more ominous, noir vibe.',
                timestamp: Date.now() - 50000000,
            }
        ]
    },
    {
        id: '3',
        name: 'Aetherion Lore Fanatics',
        topic: 'Fandom',
        banner: '/images/film_scifi.png',
        members: ['user5', 'user6', 'guest', 'u1', 'u3', 'u4'],
        posts: [
            {
                id: 'post_a1',
                authorId: 'u3',
                authorName: 'Sarah Jenkins',
                content: 'Did anyone else notice that the quantum core fragment exactly matches the artifact from sector 4 in the background?',
                timestamp: Date.now() - 3600000,
            },
            {
                id: 'post_a2',
                authorId: 'u1',
                authorName: 'Natalie Portman',
                content: 'The lore runs deep! We left a lot of easter eggs in the background of sector 4, keep digging! 😉',
                timestamp: Date.now() - 1800000,
            },
            {
                id: 'post_a3',
                authorId: 'u4',
                authorName: 'Marcus Thorne',
                content: 'That prop was actually heavy as a brick. We had to use a hollow replica for the running scenes.',
                timestamp: Date.now() - 900000,
            }
        ]
    }
];
