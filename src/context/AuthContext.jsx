import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../mock/mockUsers';

const AuthContext = createContext();
const AUTH_KEY = 'yours_auth_session';

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

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
