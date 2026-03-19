import { getData, setData, updateData, simulateApi } from './storageService';

const STORIES_KEY = 'silvertriverse_fcu_stories';

// Seed initial data if none exists
if (!getData(STORIES_KEY)) {
    setData(STORIES_KEY, [
        {
            id: 's_1',
            authorId: 'u1',
            title: 'Neon Drift',
            genre: 'Cyberpunk / Thriller',
            synopsis: 'In a rain-soaked megalopolis, a rogue archivist discovers a memory drive that points to the last unspoiled sanctuary on Earth. As corporate hitmen close in, she must decipher the fragments before the grid reboots permanently.',
            upvotes: ['u2', 'u3', 'u4'],
            status: 'pending', // pending, reviewed, selected
            interestedBy: [], // Array of professional user IDs
            createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
        },
        {
            id: 's_2',
            authorId: 'u2',
            title: 'The Silent Emperor',
            genre: 'Historical / Drama',
            synopsis: 'Chronicling the hidden 15 years of an ousted monarch living as a commoner in the very city he once ruled, plotting a silent rebellion using only his knowledge of the city\'s deepest architectural secrets.',
            upvotes: ['u1', 'u5'],
            status: 'reviewed',
            interestedBy: ['u_pro_1'],
            createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 days ago
        }
    ]);
}

export const storyService = {
    getStories: () => {
        return simulateApi(() => {
            const stories = getData(STORIES_KEY, []);
            // Sort by most upvotes
            return stories.sort((a, b) => b.upvotes.length - a.upvotes.length);
        });
    },

    createStory: (storyData) => {
        return simulateApi(() => {
            const newStory = {
                id: `s_${Date.now()}`,
                ...storyData,
                upvotes: [],
                status: 'pending',
                interestedBy: [],
                createdAt: Date.now()
            };

            updateData(STORIES_KEY, (stories) => [newStory, ...(stories || [])], []);
            return newStory;
        });
    },

    upvoteStory: (storyId, userId) => {
        return simulateApi(() => {
            let updatedStory = null;
            updateData(STORIES_KEY, (stories) => {
                return stories.map(story => {
                    if (story.id === storyId) {
                        const hasUpvoted = story.upvotes.includes(userId);
                        const newUpvotes = hasUpvoted
                            ? story.upvotes.filter(id => id !== userId) // remove upvote
                            : [...story.upvotes, userId];               // add upvote

                        updatedStory = { ...story, upvotes: newUpvotes };
                        return updatedStory;
                    }
                    return story;
                });
            }, []);

            if (!updatedStory) throw new Error('Story not found');
            return updatedStory;
        });
    },

    markInterested: (storyId, professionalId) => {
        return simulateApi(() => {
            let updatedStory = null;
            updateData(STORIES_KEY, (stories) => {
                return stories.map(story => {
                    if (story.id === storyId) {
                        const isInterested = story.interestedBy.includes(professionalId);
                        const newInterested = isInterested
                            ? story.interestedBy.filter(id => id !== professionalId)
                            : [...story.interestedBy, professionalId];

                        // Also auto-update status to reviewed if someone is interested
                        const newStatus = (!isInterested && story.status === 'pending') ? 'reviewed' : story.status;

                        updatedStory = { ...story, interestedBy: newInterested, status: newStatus };
                        return updatedStory;
                    }
                    return story;
                });
            }, []);

            if (!updatedStory) throw new Error('Story not found');
            return updatedStory;
        });
    },

    updateStatus: (storyId, newStatus) => {
        return simulateApi(() => {
            let updatedStory = null;
            updateData(STORIES_KEY, (stories) => {
                return stories.map(story => {
                    if (story.id === storyId) {
                        updatedStory = { ...story, status: newStatus };
                        return updatedStory;
                    }
                    return story;
                });
            }, []);

            if (!updatedStory) throw new Error('Story not found');
            return updatedStory;
        });
    }
};
