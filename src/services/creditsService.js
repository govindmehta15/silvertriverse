import { getData, setData, simulateApi } from './storageService';

const CREDITS_PREFIX = 'silvertriverse_ai_credits_';
const DEFAULT_BALANCE = 50000;

function storageKey(userId) {
  return `${CREDITS_PREFIX}${userId || 'guest'}`;
}

export const creditsService = {
  getBalance(userId) {
    return simulateApi(() => {
      const key = storageKey(userId);
      const balance = getData(key, null);
      if (balance === null) {
        setData(key, DEFAULT_BALANCE);
        return DEFAULT_BALANCE;
      }
      return balance;
    });
  },

  topUp(userId, creditsToAdd) {
    return simulateApi(() => {
      if (!userId) throw new Error('User must be logged in to top up');
      const key = storageKey(userId);
      const current = getData(key, DEFAULT_BALANCE);
      const newBalance = current + creditsToAdd;
      setData(key, newBalance);
      return { newBalance, added: creditsToAdd };
    });
  },

  deduct(userId, amount) {
    return simulateApi(() => {
      if (!userId) throw new Error('User must be logged in');
      const key = storageKey(userId);
      const current = getData(key, DEFAULT_BALANCE);
      if (current < amount) throw new Error('Insufficient credits');
      const newBalance = current - amount;
      setData(key, newBalance);
      return newBalance;
    });
  },
};
