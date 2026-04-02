import { getData, updateData } from '../utils/storageService';
import { mockCommunities } from '../mock/mockCommunities';

const COM_KEY = 'communities_v2';

if (!getData(COM_KEY)) {
    updateData(COM_KEY, () => mockCommunities);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const communityService = {
    getAllCommunities: () => {
        return simulateNetwork(getData(COM_KEY));
    },
    getGroups: () => {
        return simulateNetwork(getData(COM_KEY));
    },
    getGroupById: (id) => {
        const groups = getData(COM_KEY);
        return simulateNetwork(groups.find(g => g.id === id) || null);
    },
    joinGroup: (groupId, userId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let updatedGroup = null;
                updateData(COM_KEY, (groups) => {
                    const idx = groups.findIndex(g => g.id === groupId);
                    if (idx > -1 && !groups[idx].members.includes(userId)) {
                        groups[idx].members.push(userId);
                        updatedGroup = groups[idx];
                    }
                    return groups;
                });

                // Gamification: Add 10 points for joining
                if (updatedGroup) {
                    updateData('users', (users) => {
                        if (!users) return users;
                        const userIdx = users.findIndex(u => u.id === userId);
                        if (userIdx > -1) {
                            users[userIdx].participationScore = (users[userIdx].participationScore || 0) + 10;
                        }
                        return users;
                    });
                    resolve({ success: true, data: updatedGroup });
                } else {
                    resolve({ success: false, error: 'Failed to join group' });
                }
            }, 300);
        });
    },
    leaveGroup: (groupId, userId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let updatedGroup = null;
                updateData(COM_KEY, (groups) => {
                    const idx = groups.findIndex(g => g.id === groupId);
                    if (idx > -1 && groups[idx].members.includes(userId)) {
                        groups[idx].members = groups[idx].members.filter(id => id !== userId);
                        updatedGroup = groups[idx];
                    }
                    return groups;
                });
                if (updatedGroup) resolve({ success: true, data: updatedGroup });
                else resolve({ success: false, error: 'Failed to leave group' });
            }, 300);
        });
    },
    addPost: (groupId, postData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let newPost = null;
                updateData(COM_KEY, (groups) => {
                    const idx = groups.findIndex(g => g.id === groupId);
                    if (idx > -1) {
                        newPost = {
                            id: 'gp_' + Date.now(),
                            timestamp: Date.now(),
                            ...postData
                        };
                        if (!groups[idx].posts) groups[idx].posts = [];
                        groups[idx].posts.unshift(newPost);
                    }
                    return groups;
                });

                if (newPost) {
                    // Gamification: Add 15 points for posting in community
                    updateData('users', (users) => {
                        if (!users) return users;
                        const userIdx = users.findIndex(u => u.id === postData.authorId);
                        if (userIdx > -1) {
                            users[userIdx].participationScore = (users[userIdx].participationScore || 0) + 15;
                        }
                        return users;
                    });
                    resolve({ success: true, data: newPost });
                } else {
                    resolve({ success: false, error: 'Group not found' });
                }
            }, 300);
        });
    },
    addComment: (groupId, postId, commentData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let newComment = null;
                updateData(COM_KEY, (groups) => {
                    const groupIdx = groups.findIndex(g => g.id === groupId);
                    if (groupIdx > -1) {
                        const postIdx = groups[groupIdx].posts?.findIndex(p => p.id === postId);
                        if (postIdx > -1) {
                            newComment = {
                                id: 'gc_' + Date.now(),
                                timestamp: Date.now(),
                                ...commentData
                            };
                            if (!groups[groupIdx].posts[postIdx].comments) {
                                groups[groupIdx].posts[postIdx].comments = [];
                            }
                            groups[groupIdx].posts[postIdx].comments.push(newComment);
                        }
                    }
                    return groups;
                });

                if (newComment) {
                    // Gamification: Add 5 points for commenting
                    updateData('users', (users) => {
                        if (!users) return users;
                        const userIdx = users.findIndex(u => u.id === commentData.authorId);
                        if (userIdx > -1) {
                            users[userIdx].participationScore = (users[userIdx].participationScore || 0) + 5;
                        }
                        return users;
                    });
                    resolve({ success: true, data: newComment });
                } else {
                    resolve({ success: false, error: 'Post not found' });
                }
            }, 300);
        });
    },
    getLeaderboard: (groupId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const groups = getData(COM_KEY);
                const group = groups.find(g => g.id === groupId);
                if (!group) return resolve({ success: false, error: 'Group not found' });

                const postCounts = {};
                (group.posts || []).forEach(post => {
                    if (!postCounts[post.authorId]) {
                        postCounts[post.authorId] = { userId: post.authorId, name: post.authorName, postCount: 0 };
                    }
                    postCounts[post.authorId].postCount++;
                });

                const leaderboard = Object.values(postCounts).sort((a, b) => b.postCount - a.postCount);
                resolve({ success: true, data: leaderboard });
            }, 300);
        });
    },
    getGlobalLeaderboard: () => {
        return new Promise(resolve => {
            setTimeout(() => {
                const groups = getData(COM_KEY) || [];
                const postCounts = {};

                groups.forEach(group => {
                    (group.posts || []).forEach(post => {
                        if (!postCounts[post.authorId]) {
                            postCounts[post.authorId] = { userId: post.authorId, name: post.authorName, postCount: 0 };
                        }
                        postCounts[post.authorId].postCount++;
                    });
                });

                const leaderboard = Object.values(postCounts).sort((a, b) => b.postCount - a.postCount);
                resolve({ success: true, data: leaderboard });
            }, 300);
        });
    },
    advanceMissionProgress: (groupId, progress) => {
        updateData(COM_KEY, (groups) => {
            const idx = groups.findIndex(g => g.id === groupId);
            if (idx > -1 && groups[idx].mission) {
                groups[idx].mission.currentProgress = Math.min(
                    groups[idx].mission.target,
                    (groups[idx].mission.currentProgress || 0) + progress
                );
            }
            return groups;
        });
    }
};
