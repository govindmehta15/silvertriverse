import { getData, updateData } from '../utils/storageService';
import { mockRelics } from '../mock/mockRelics';
import { dispatchNotification, NotificationTypes } from '../utils/notificationDispatcher';

// Initialize mock relics if not present, and auto-reset when everything has ended.
const existingRelics = getData('relics');
if (!existingRelics) {
    updateData('relics', () => mockRelics);
} else if (
    Array.isArray(existingRelics) &&
    existingRelics.length > 0 &&
    existingRelics.every((relic) => relic.status === 'ended' || relic.phase === 'closed' || relic.endTime <= Date.now())
) {
    // Re-seed with fresh Date.now()-based timers from mock data.
    updateData('relics', () => mockRelics);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const relicService = {
    getAllRelics: () => {
        return simulateNetwork(getData('relics'));
    },
    getRelics: () => { // Alias for backwards compatibility with RelicsList
        return simulateNetwork(getData('relics'));
    },
    getRelicById: (id) => {
        const relics = getData('relics');
        const relic = relics.find(r => r.id === id);

        // Check if auction just ended
        if (relic && relic.status === 'active' && relic.endTime <= Date.now()) {
            relicService.endAuction(relic.id);
            return simulateNetwork(getData('relics').find(r => r.id === id));
        }

        return simulateNetwork(relic || null);
    },
    placeBid: (id, userId, amount) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const relics = getData('relics');
                const relicIndex = relics.findIndex(r => r.id === id);

                if (relicIndex === -1) {
                    return resolve({ success: false, error: 'Relic not found' });
                }

                const relic = relics[relicIndex];

                // Rule: Cannot bid after endTime
                if (Date.now() > relic.endTime || relic.status !== 'active') {
                    if (relic.status === 'active') relicService.endAuction(id);
                    return resolve({ success: false, error: 'Auction has ended' });
                }

                // Rule: Highest bidder cannot bid against themselves
                const highestBidder = relic.bids.length > 0 ? relic.bids[0].userId : null;
                if (highestBidder === userId) {
                    return resolve({ success: false, error: 'You are already the highest bidder' });
                }

                // Rule: Minimum increment (5%)
                const minIncrement = relic.minimumIncrement || Math.ceil(relic.currentPrice * 0.05);
                if (amount < relic.currentPrice + minIncrement) {
                    return resolve({ success: false, error: `Minimum bid is ${relic.currentPrice + minIncrement}` });
                }

                // Get User details for the bid record
                const users = getData('users');
                const user = users.find(u => u.id === userId);

                const newBid = {
                    id: Date.now().toString(),
                    userId,
                    name: user ? user.name : 'Unknown',
                    avatar: user ? user.avatar : '👤',
                    amount,
                    time: Date.now(),
                    isNew: true
                };

                // Add bid
                relic.bids.unshift(newBid);
                relic.currentPrice = amount;

                // If someone else was the previous highest bidder, notify them they were outbid
                if (highestBidder && highestBidder !== userId && !highestBidder.startsWith('b_')) {
                    dispatchNotification(highestBidder, NotificationTypes.BID_OUTBID, `You were outbid on ${relic.title} by ${user ? user.name : 'Unknown'}!`);
                }

                // Anti-sniper rule: If bid occurs in last 30 seconds, extend by 30 seconds
                const timeRemaining = relic.endTime - Date.now();
                if (timeRemaining < 30000) {
                    relic.endTime += 30000;
                }

                relics[relicIndex] = relic;
                updateData('relics', () => relics);

                resolve({ success: true, data: relic });
            }, 500);
        });
    },
    endAuction: (id) => {
        const relics = getData('relics');
        const relicIndex = relics.findIndex(r => r.id === id);
        if (relicIndex === -1) return;

        const relic = relics[relicIndex];
        relic.status = 'ended';
        relic.phase = 'closed';
        if (!relic.phaseHistory) relic.phaseHistory = [];
        relic.phaseHistory.push({ phase: 'closed', date: Date.now(), note: relic.bids.length > 0 ? `Won by ${relic.bids[0].name}` : 'No bids received' });

        // Assign to winner
        if (relic.bids.length > 0) {
            const winnerId = relic.bids[0].userId;
            const users = getData('users');
            if (users) {
                const winnerIndex = users.findIndex(u => u.id === winnerId);
                if (winnerIndex > -1) {
                    const shelf = users[winnerIndex].ownedRelics || [];
                    if (!shelf.includes(relic.id)) {
                        users[winnerIndex].ownedRelics = [...shelf, relic.id];
                        updateData('users', () => users);

                        // Notify winner
                        dispatchNotification(winnerId, NotificationTypes.AUCTION_WON, `Congratulations! You won the auction for ${relic.title}!`);
                    }
                }
            }
        }
        updateData('relics', () => relics);
    }
};

// Simulate competing bids every 20 seconds
setInterval(() => {
    const relics = getData('relics');
    if (!relics) return;

    let updated = false;
    const now = Date.now();

    relics.forEach(relic => {
        // Only simulate bids on active auctions with at least 1 min remaining
        if (relic.status === 'active' && relic.endTime > now + 60000) {
            // 30% chance of a random bid happening on any given tick per relic
            if (Math.random() < 0.3) {
                const minIncrement = relic.minimumIncrement || Math.ceil(relic.currentPrice * 0.05);
                const randomBump = Math.floor(Math.random() * minIncrement * 2);
                const bidAmount = relic.currentPrice + minIncrement + randomBump;

                const simulatedBots = [
                    { id: 'b_1', name: 'Collector_99', avatar: '🕵️' },
                    { id: 'b_2', name: 'FilmFanatic', avatar: '👀' },
                    { id: 'b_3', name: 'Studio_Archive', avatar: '🏛️' }
                ];

                // Get a bot that isn't the highest bidder
                const highestBidderId = relic.bids.length > 0 ? relic.bids[0].userId : null;
                const availableBots = simulatedBots.filter(b => b.id !== highestBidderId);
                if (availableBots.length === 0) return;

                const randomBot = availableBots[Math.floor(Math.random() * availableBots.length)];

                const newBid = {
                    id: Date.now().toString() + Math.random(),
                    userId: randomBot.id,
                    name: randomBot.name,
                    avatar: randomBot.avatar,
                    amount: bidAmount,
                    time: Date.now(),
                    isNew: true
                };

                // If there was a previous highest bidder and it's not the same user, notify them
                if (highestBidderId && highestBidderId !== randomBot.id) {
                    dispatchNotification(highestBidderId, NotificationTypes.BID_OUTBID, `You were outbid on ${relic.title} by ${randomBot.name}!`);
                }

                relic.bids.unshift(newBid);
                relic.currentPrice = bidAmount;
                updated = true;
            }
        } else if (relic.status === 'active' && relic.endTime <= now) {
            // End auctions loop
            relicService.endAuction(relic.id);
        }
    });

    if (updated) {
        updateData('relics', () => relics);
    }
}, 20000);
