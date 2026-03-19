import { getData, updateData } from './storageService';
import { communityService } from './communityService';
import { dispatchNotification, NotificationTypes } from '../utils/notificationDispatcher';

const EVENT_TYPES = [
    'BID_OUTBID',
    'AUCTION_WON',
    'STORY_UPVOTED',
    'NEW_FOLLOWER',
    'POST_LIKE'
];

// Start background loop
export const initSimulation = () => {
    // Run every 30 seconds to generate fake activity
    setInterval(() => {
        generateFakeActivity();
    }, 30000);
};

// Helper: Pick a random item
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fakeUsers = [
    { id: 'f1', name: 'CryptoKing99' },
    { id: 'f2', name: 'DirectorJane' },
    { id: 'f3', name: 'Collector_X' },
    { id: 'f4', name: 'StarkIndustries' },
    { id: 'f5', name: 'AnonFan2023' }
];

const generateFakeActivity = () => {
    // Determine target user (the real simulated user if we want to show a notification)
    const authData = getData('silvertriverse_auth');
    const currentUser = authData?.user;

    const activities = ['new_vote', 'new_bid', 'new_post', 'new_follower'];
    const chosenActivity = pickRandom(activities);

    if (chosenActivity === 'new_bid') {
        addGlobalActivity('LIVE: New relic bid placed');
        if (currentUser && Math.random() > 0.6) {
            dispatchNotification(
                currentUser.id,
                NotificationTypes.BID_OUTBID,
                `${pickRandom(fakeUsers).name} placed a higher bid on an item you're tracking.`
            );
        }
    } else if (chosenActivity === 'new_vote') {
        addGlobalActivity('LIVE: Story pitch trending');
        if (currentUser && Math.random() > 0.6) {
            dispatchNotification(
                currentUser.id,
                NotificationTypes.VOTE_SUBMITTED,
                `${pickRandom(fakeUsers).name} upvoted your story pitch!`
            );
        }
    } else if (chosenActivity === 'new_post') {
        addGlobalActivity('LIVE: Film community growing');
    } else if (chosenActivity === 'new_follower') {
        addGlobalActivity('LIVE: Film community growing');
        if (currentUser && Math.random() > 0.6) {
            dispatchNotification(
                currentUser.id,
                NotificationTypes.NEW_FOLLOWER,
                `${pickRandom(fakeUsers).name} started following your profile.`
            );
        }
    }

    // 50% chance to advance group missions in the background
    if (Math.random() < 0.5) {
        communityService.advanceMissionProgress('g_1', Math.floor(Math.random() * 3) + 1);
        communityService.advanceMissionProgress('g_2', Math.floor(Math.random() * 2) + 1);
    }
};

const addGlobalActivity = (message) => {
    updateData('silvertriverse_global_ticker', (tickerItems) => {
        const newItem = { id: `tick_${Date.now()}`, message, timestamp: Date.now() };
        return [newItem, ...(tickerItems || [])].slice(0, 10);
    }, []);
    window.dispatchEvent(new Event('silvertriverse_ticker_update'));
};

export const getTickerActivities = () => {
    return getData('silvertriverse_global_ticker', [
        { id: 'tick_initial_1', message: 'Welcome to SilverTriverse Entertainment! The auction house is now live.', timestamp: Date.now() }
    ]);
};
