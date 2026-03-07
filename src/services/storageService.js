/**
 * Core storage service providing localStorage persistence layers and
 * a simulated async wrapper.
 */

// Delay representing network latency (ms)
const API_DELAY = 500;

export const getData = (key, defaultVal = null) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === 'undefined' || item === 'null') return defaultVal;
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        return defaultVal;
    }
};

export const setData = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting ${key} to localStorage`, error);
    }
};

export const updateData = (key, updaterFn, defaultVal = null) => {
    try {
        const current = getData(key, defaultVal);
        const updated = updaterFn(current);
        setData(key, updated);
        return updated;
    } catch (error) {
        console.error(`Error updating ${key} in localStorage`, error);
        return null;
    }
};

/**
 * Wraps synchronous logic in a Promise to simulate a remote API call.
 * Handles try-catch automatically and formats responses consistently.
 */
export const simulateApi = (logicFn) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const result = logicFn();
                resolve({ success: true, data: result, error: null });
            } catch (err) {
                console.error('API Error:', err);
                resolve({ success: false, data: null, error: err.message || 'Server Error' });
            }
        }, API_DELAY);
    });
};
