import { getData, updateData } from '../utils/storageService';
import { mockVotes } from '../mock/mockVotes';

if (!getData('votes')) {
    updateData('votes', () => mockVotes);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const voteService = {
    getVotes: () => {
        return simulateNetwork(getData('votes'));
    },
    vote: (voteData) => {
        return simulateNetwork({ id: Date.now().toString(), ...voteData });
    }
};
