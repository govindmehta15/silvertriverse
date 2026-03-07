import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { dispatchNotification } from '../utils/notificationDispatcher';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = useCallback(() => {
        if (isAuthenticated && user) {
            const key = `notifications_${user.id}`;
            const notifs = JSON.parse(localStorage.getItem(key) || '[]');
            setNotifications(notifs);
        } else {
            setNotifications([]);
        }
    }, [user, isAuthenticated]);

    // Load initial
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Listen to global notification events
    useEffect(() => {
        const handleNewNotification = (e) => {
            const { userId, notification } = e.detail;
            if (isAuthenticated && user && userId === user.id) {
                setNotifications(prev => [notification, ...prev]);
                // Show a toast for the new notification automatically
                addToast(`${notification.title} - ${notification.message}`, 'info');
            }
        };

        window.addEventListener('global_notification_update', handleNewNotification);
        return () => window.removeEventListener('global_notification_update', handleNewNotification);
    }, [user, isAuthenticated, addToast]);

    const markAsRead = (notifId) => {
        if (!user) return;
        setNotifications(prev => {
            const updated = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
            const key = `notifications_${user.id}`;
            localStorage.setItem(key, JSON.stringify(updated));
            return updated;
        });
    };

    const clearNotifications = () => {
        if (!user) return;
        const key = `notifications_${user.id}`;
        localStorage.removeItem(key);
        setNotifications([]);
    };

    const notifyUser = (type, message) => {
        if (!user) return;
        dispatchNotification(user.id, type, message);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearNotifications, notifyUser }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
