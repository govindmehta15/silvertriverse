import { getData, updateData } from '../utils/storageService';
import { mockMerchandise } from '../mock/mockMerchandise';

if (!getData('merch')) {
    updateData('merch', () => mockMerchandise);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const merchService = {
    getAllMerch: () => {
        return simulateNetwork(getData('merch'));
    },
    purchaseMerch: (id) => {
        return simulateNetwork(true);
    }
};
