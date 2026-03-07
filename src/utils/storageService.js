// /src/utils/storageService.js
export const getData = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

export const setData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const updateData = (key, fn) => {
    const current = getData(key);
    const updated = fn(current);
    setData(key, updated);
    return updated;
};
