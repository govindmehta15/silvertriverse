import { getData, simulateApi } from './storageService';

const VOTES_KEY = 'silvertriverse_reality_votes';

// Format: { [battleId]: { f1_votes: 0, f2_votes: 0, userVotes: { [userId]: 'f1' } } }
if (!getData(VOTES_KEY)) {
    localStorage.setItem(VOTES_KEY, JSON.stringify({
        'vote_1': {
            f1_votes: 145020,
            f2_votes: 132940,
            f1_meta: {
                id: 'f1',
                title: 'Aetherion: The Future Is Now',
                image: '/images/film_scifi.png',
                director: 'Kaelen Vance',
                color: 'from-blue-600/40 to-cyan-500/20',
                border: 'border-cyan-500/50',
            },
            f2_meta: {
                id: 'f2',
                title: 'The Silhouette',
                image: '/images/film_thriller.png',
                director: 'Elena Rostova',
                color: 'from-purple-600/40 to-pink-500/20',
                border: 'border-pink-500/50',
            },
            userVotes: {} // Track which user voted for what to prevent double voting
        }
    }));
}

export const realityService = {
    getBattles: () => {
        return simulateApi(() => {
            const data = getData(VOTES_KEY, {});

            // Reconstruct the array expected by RealityPage
            const battles = Object.keys(data).map(bId => {
                const b = data[bId];
                return {
                    id: bId,
                    title: 'BATTLE OF THE ERAS',
                    endTime: Date.now() + 1000 * 60 * 60 * 48,
                    films: [
                        { ...b.f1_meta, votes: b.f1_votes },
                        { ...b.f2_meta, votes: b.f2_votes }
                    ]
                };
            });
            return battles;
        });
    },

    getBattleStats: (battleId) => {
        return simulateApi(() => {
            const data = getData(VOTES_KEY, {});
            if (!data[battleId]) throw new Error('Battle not found');

            const battle = data[battleId];
            return {
                f1_votes: battle.f1_votes,
                f2_votes: battle.f2_votes,
            };
        });
    },

    castVote: (battleId, userId, filmId) => {
        return simulateApi(() => {
            const data = getData(VOTES_KEY, {});
            if (!data[battleId]) throw new Error('Battle not found');

            const battle = data[battleId];

            // Limit 1 vote per user
            if (battle.userVotes[userId]) {
                throw new Error('You have already voted in this battle.');
            }

            // Increment
            if (filmId === 'f1') battle.f1_votes += 1;
            else if (filmId === 'f2') battle.f2_votes += 1;
            else throw new Error('Invalid film option');

            battle.userVotes[userId] = filmId;

            localStorage.setItem(VOTES_KEY, JSON.stringify(data));

            return {
                f1_votes: battle.f1_votes,
                f2_votes: battle.f2_votes,
                votedFor: filmId
            };
        });
    }
};
