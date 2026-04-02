import { getData, updateData } from '../utils/storageService';
import { mockStories, mockFeedItems } from '../mock/mockReelityData';

const STORIES_KEY = 'reelity_stories';
const FEED_KEY = 'reelity_feed';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Initialize
if (!getData(STORIES_KEY)) {
    updateData(STORIES_KEY, () => mockStories);
}
if (!getData(FEED_KEY)) {
    updateData(FEED_KEY, () => mockFeedItems);
} else {
    // Keep historical local feed but hydrate any newly shipped seed items by id.
    updateData(FEED_KEY, (existing = []) => {
        const byId = new Map(existing.map((item) => [item.id, item]));
        mockFeedItems.forEach((seed) => {
            if (!byId.has(seed.id)) byId.set(seed.id, seed);
        });
        return Array.from(byId.values());
    });
}

const simulateNetwork = (data) =>
    new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 300));

export const reelityService = {
    // --- Stories ---
    getStories: () => {
        const stories = getData(STORIES_KEY) || [];
        // Filter to last 24 hours
        const now = Date.now();
        const active = stories.filter(s => now - s.timestamp < TWENTY_FOUR_HOURS);
        return simulateNetwork(active);
    },

    addStory: (storyData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newStory = {
                    id: 'st_' + Date.now(),
                    timestamp: Date.now(),
                    ...storyData
                };
                updateData(STORIES_KEY, (stories) => [newStory, ...(stories || [])]);
                resolve({ success: true, data: newStory });
            }, 300);
        });
    },

    // --- Feed ---
    getFeed: () => {
        const feed = getData(FEED_KEY) || [];
        // Sort by timestamp descending
        const sorted = [...feed].sort((a, b) => b.timestamp - a.timestamp);
        return simulateNetwork(sorted);
    },

    addPost: (postData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newPost = {
                    id: 'fp_' + Date.now(),
                    type: 'social',
                    likes: [],
                    comments: [],
                    tags: postData.tags || [],
                    timestamp: Date.now(),
                    ...postData
                };
                updateData(FEED_KEY, (feed) => [newPost, ...(feed || [])]);

                // Gamification: +10 participation for posting
                updateData('users', (users) => {
                    if (!users) return users;
                    const idx = users.findIndex(u => u.id === postData.authorId);
                    if (idx > -1) {
                        users[idx].participationScore = (users[idx].participationScore || 0) + 10;
                    }
                    return users;
                });

                resolve({ success: true, data: newPost });
            }, 300);
        });
    },

    toggleLike: (postId, userId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let updatedPost = null;
                updateData(FEED_KEY, (feed) => {
                    const idx = feed.findIndex(p => p.id === postId);
                    if (idx > -1 && feed[idx].likes) {
                        if (feed[idx].likes.includes(userId)) {
                            feed[idx].likes = feed[idx].likes.filter(id => id !== userId);
                        } else {
                            feed[idx].likes.push(userId);
                        }
                        updatedPost = feed[idx];
                    }
                    return feed;
                });
                resolve({ success: true, data: updatedPost });
            }, 200);
        });
    },

    addComment: (postId, commentData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let newComment = null;
                updateData(FEED_KEY, (feed) => {
                    const idx = feed.findIndex(p => p.id === postId);
                    if (idx > -1) {
                        newComment = {
                            id: 'fc_' + Date.now(),
                            timestamp: Date.now(),
                            ...commentData
                        };
                        if (!feed[idx].comments) feed[idx].comments = [];
                        feed[idx].comments.push(newComment);
                    }
                    return feed;
                });
                resolve({ success: true, data: newComment });
            }, 200);
        });
    }
};
