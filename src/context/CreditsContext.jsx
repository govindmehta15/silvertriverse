import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { creditsService } from '../services/creditsService';
import { useAuth } from './AuthContext';
import { updateData } from '../services/storageService';

const HISTORY_KEY = 'silvertriverse_credits_history';
const CreditsContext = createContext();

export function CreditsProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  const refreshBalance = useCallback(async (userId) => {
    if (!userId) {
      setBalance(0);
      return;
    }
    const res = await creditsService.getBalance(userId);
    if (res.success && res.data != null) setBalance(res.data);
  }, []);

  useEffect(() => {
    refreshBalance(user?.id ?? null);
  }, [user?.id, refreshBalance]);

  const addCredits = useCallback(async (amount, userId = user?.id) => {
    if (!userId) return { success: false, error: 'Login required' };
    const res = await creditsService.topUp(userId, amount);
    if (res.success && res.data) {
      setBalance(res.data.newBalance);
      return { success: true, newBalance: res.data.newBalance };
    }
    return { success: false, error: res.error };
  }, [user?.id]);

  const deductCredits = useCallback(async (amount, userId = user?.id) => {
    if (!userId) return { success: false, error: 'Login required' };
    const res = await creditsService.deduct(userId, amount);
    if (res.success && res.data != null) {
      setBalance(res.data);
      return { success: true, newBalance: res.data };
    }
    return { success: false, error: res.error };
  }, [user?.id]);

  const canAfford = useCallback((amount) => balance >= amount, [balance]);

  const saveHistory = useCallback((entry) => {
    const userId = user?.id;
    if (!userId) return;
    const key = `${HISTORY_KEY}_${userId}`;
    updateData(key, (arr) => [{ ...entry, id: `h_${Date.now()}` }, ...(arr || [])], []);
  }, [user?.id]);

  return (
    <CreditsContext.Provider
      value={{
        balance,
        setBalance,
        refreshBalance,
        addCredits,
        deductCredits,
        canAfford,
        saveHistory,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error('useCredits must be used within CreditsProvider');
  return context;
}
