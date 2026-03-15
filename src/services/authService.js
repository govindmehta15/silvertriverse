import { getData, updateData } from '../utils/storageService';
import { mockUsers } from '../mock/mockUsers';
import { seedPlotsAndThemes } from '../mock/seedPlotsAndThemes';

if (!getData('users')) {
    updateData('users', () => mockUsers);
}
seedPlotsAndThemes();

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const authService = {
    login: (email, password) => {
        const users = getData('users');
        const user = users.find(u => u.email === email && u.password === password) || users[0];
        return simulateNetwork(user || null);
    },
    register: (userData) => {
        return simulateNetwork({ id: Date.now().toString(), ...userData });
    },
    logout: () => {
        return simulateNetwork(null);
    },
    getCurrentUser: () => {
        const users = getData('users');
        return simulateNetwork(users[0] || null);
    }
};
