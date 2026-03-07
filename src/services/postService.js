import { getData, updateData } from '../utils/storageService';
import { mockPosts } from '../mock/mockPosts';

if (!getData('posts')) {
    updateData('posts', () => mockPosts);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const postService = {
    getFeed: () => {
        return simulateNetwork(getData('posts'));
    },
    getAllPosts: () => {
        return simulateNetwork(getData('posts'));
    },
    createPost: (postData) => {
        const posts = getData('posts') || [];
        const newPost = { id: Date.now().toString(), ...postData, timestamp: new Date().toISOString() };
        updateData('posts', () => [newPost, ...posts]);
        return simulateNetwork(newPost);
    },
    likePost: (id) => {
        const posts = getData('posts');
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex !== -1) {
            posts[postIndex].likes += 1;
            updateData('posts', () => posts);
        }
        return simulateNetwork(true);
    }
};
