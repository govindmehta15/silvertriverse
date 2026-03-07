import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gold transition-colors"
                title="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-navy-950 animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-navy-900 border border-navy-700/50 rounded-2xl shadow-glow-rare z-[70]"
                    >
                        <div className="p-4 border-b border-navy-800 flex justify-between items-center sticky top-0 bg-navy-900/95 backdrop-blur-sm z-10">
                            <h3 className="font-serif text-lg font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded bg-gold/10 text-gold text-xs font-bold">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>

                        <div className="divide-y divide-navy-800/50">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    <div className="opacity-50 text-2xl mb-2">📭</div>
                                    You're all caught up.
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-4 flex gap-3 transition-colors cursor-pointer ${notif.read ? 'bg-navy-900 opacity-70' : 'bg-navy-800/40 hover:bg-navy-800/60'}`}
                                    >
                                        <div className="text-xl pt-1 shrink-0">{notif.icon}</div>
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-bold ${notif.read ? 'text-gray-300' : 'text-gold'}`}>{notif.title}</h4>
                                                {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5 ml-2" />}
                                            </div>
                                            <p className="text-sm text-gray-400 leading-tight">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
