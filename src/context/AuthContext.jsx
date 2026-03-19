import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../mock/mockUsers';

const AuthContext = createContext();
const AUTH_KEY = 'silvertriverse_auth_session';

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    // Initialize from localStorage
    useEffect(() => {
        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (storedAuth) {
            const data = JSON.parse(storedAuth);
            setIsAuthenticated(true);
            setUser(data);
        }
    }, []);

    const login = (userId) => {
        // Fallback to first user if no ID provided
        const selectedUser = userId
            ? mockUsers.find(u => u.id === userId)
            : mockUsers[0];

        if (selectedUser) {
            setIsAuthenticated(true);
            setUser(selectedUser);
            localStorage.setItem(AUTH_KEY, JSON.stringify(selectedUser));
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem(AUTH_KEY);
    };

    const getCurrentUser = () => {
        return user;
    };

    const updateRole = (newRole) => {
        if (!user) return;
        const updated = { ...user, role: newRole };
        setUser(updated);
        localStorage.setItem(AUTH_KEY, JSON.stringify(updated));

        // Ensure the global users list exists for other pages/profiles
        let allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (allUsers.length === 0) {
            allUsers = [...mockUsers];
        }

        const idx = allUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            allUsers[idx] = updated;
        } else {
            allUsers.push(updated);
        }
        localStorage.setItem('users', JSON.stringify(allUsers));
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getCurrentUser, updateRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
