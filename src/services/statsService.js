import { getData } from './storageService';
import { mockUsers } from '../mock/mockUsers';

// Calculate global rankings based on local storage data
export const getGlobalLeaderboard = () => {
    // 1. Gather all users
    // For this simulation, we'll construct a mock user pool + the current user
    const authData = getData('silvertriverse_auth');
    const currentUser = authData?.user;

    const saved = getData('users');
    const usersColl = (saved && saved.length > 0) ? saved : mockUsers;
    const allUsersMap = {};

    usersColl.forEach(u => {
        allUsersMap[u.id] = {
            id: u.id,
            name: u.name,
            avatar: u.avatar || '/images/profile_avatar.png',
            role: u.role || 'fan',
            fanScore: u.participationScore || 0,
            relsOwned: (u.ownedRelics || []).length,
            filmsCreated: 0,
            postsCreated: 0
        };
    });

    // Count Collectible Units films / stories (mock proxy to filmsCreated)
    // Count community posts
    const communities = getData('communities') || [];
    communities.forEach(c => {
        (c.posts || []).forEach(post => {
            if (allUsersMap[post.authorId]) {
                allUsersMap[post.authorId].postsCreated += 1;
            }
        });
    });

    // Add some random variance to the fake users so the board changes
    ['u1', 'u2', 'u3', 'u4'].forEach(id => {
        if (allUsersMap[id]) {
            allUsersMap[id].fanScore += Math.floor(Math.random() * 50);
            if (allUsersMap[id].role === 'creator') {
                allUsersMap[id].filmsCreated += Math.floor(Math.random() * 3);
            }
        }
    });

    // 5. Sort into categories
    const allUsers = Object.values(allUsersMap);

    const topFans = [...allUsers]
        .sort((a, b) => b.fanScore - a.fanScore)
        .slice(0, 5)
        .map((u, i) => ({ id: u.id, name: u.name, avatar: u.avatar, score: `${u.fanScore} pts`, rankChange: i % 2 === 0 ? 1 : -1 }));

    const topCollectors = [...allUsers]
        .sort((a, b) => b.relsOwned - a.relsOwned)
        .slice(0, 5)
        .map((u, i) => ({ id: u.id, name: u.name, avatar: u.avatar, score: `${u.relsOwned} Relics`, rankChange: i % 2 === 0 ? 0 : 1 }));

    const topCreators = [...allUsers]
        .filter(u => u.role === 'creator' || u.role === 'professional')
        .sort((a, b) => (b.filmsCreated + b.postsCreated) - (a.filmsCreated + a.postsCreated))
        .slice(0, 5)
        .map((u, i) => ({ id: u.id, name: u.name, avatar: u.avatar, score: `${u.filmsCreated + u.postsCreated} Creations`, rankChange: i % 2 !== 0 ? 1 : -1 }));

    return {
        'Top Fans': topFans,
        'Top Collectors': topCollectors,
        'Top Creators': topCreators
    };
};
