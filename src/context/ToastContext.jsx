import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md min-w-[250px]
                ${toast.type === 'success' ? 'bg-green-900/80 border-green-500/50 text-white' : ''}
                ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-white' : ''}
                ${toast.type === 'info' ? 'bg-navy-800/90 border-navy-500/50 text-white shadow-glow-gold' : ''}
              `}
                        >
                            {toast.type === 'success' && <span className="text-xl">✅</span>}
                            {toast.type === 'error' && <span className="text-xl">⚠️</span>}
                            {toast.type === 'info' && <span className="text-xl">✨</span>}
                            <p className="text-sm font-medium flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-white/60 hover:text-white transition-colors p-1"
                            >
                                ✕
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
