import { getData, updateData } from '../utils/storageService';

if (!getData('notifications')) {
    updateData('notifications', () => []);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const notificationService = {
    getNotifications: () => {
        return simulateNetwork(getData('notifications'));
    },
    markRead: (id) => {
        return simulateNetwork(true);
    }
};
