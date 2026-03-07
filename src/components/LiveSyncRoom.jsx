import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SIMULATED_MESSAGES = [
    { id: 1, user: 'CryptoKing', text: 'This scene is going to be insane in IMAX.' },
    { id: 2, user: 'SarahJ', text: 'Did they confirm the runtime yet?' },
    { id: 3, user: 'DirectorX', text: 'We are aiming for 2h 15m.' },
    { id: 4, user: 'FilmGeek99', text: 'That lighting setup in the background looks like Roger Deakins style.' },
    { id: 5, user: 'NovaDawn', text: 'I just bought the early access relic!' },
];

export default function LiveSyncRoom({ group, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState(SIMULATED_MESSAGES.slice(0, 2));
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simulate incoming messages
    useEffect(() => {
        let currentIndex = 2;
        const interval = setInterval(() => {
            if (currentIndex < SIMULATED_MESSAGES.length) {
                setMessages(prev => [...prev, SIMULATED_MESSAGES[currentIndex]]);
                currentIndex++;
            }
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), user: user?.name || 'Guest', text: input }]);
        setInput('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pt-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-navy-950/90 backdrop-blur-md"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl h-[80vh] bg-navy-900 border border-gold/30 rounded-2xl shadow-glow-gold flex flex-col md:flex-row overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-navy-950/50 rounded-full text-gray-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Left: Video Player Mockup */}
                    <div className="flex-1 bg-black flex flex-col relative border-r border-navy-700">
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <span className="bg-red-600 animate-pulse text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Live</span>
                            <span className="bg-navy-900/80 backdrop-blur text-gray-300 text-[10px] tracking-wider px-2 py-1 rounded border border-navy-600/50">
                                👁 1,204 Viewers
                            </span>
                        </div>

                        <div className="flex-1 flex items-center justify-center bg-navy-950 relative overflow-hidden group">
                            {/* Simulated Video Content */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-800 via-navy-900 to-black opacity-80" />
                            <div className="text-center z-10">
                                <span className="text-gold tracking-[0.3em] uppercase text-xs">Director's Cut</span>
                                <h2 className="font-serif text-3xl font-bold text-white mt-2 mb-4 drop-shadow-lg">{group?.name}</h2>
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-gold/50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer hover:scale-105 hover:border-gold transition-all shadow-glow-gold">
                                    <svg className="w-6 h-6 text-gold translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Player Controls */}
                        <div className="h-12 bg-gradient-to-t from-navy-950 to-transparent flex items-center px-4 gap-4">
                            <div className="text-gold"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm8 0h2v12h-2z" /></svg></div>
                            <div className="h-1 flex-1 bg-navy-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gold w-1/3 shadow-glow-gold"></div>
                            </div>
                            <div className="text-xs font-medium text-gray-400 font-mono">24:15 / 1:30:00</div>
                        </div>
                    </div>

                    {/* Right: Live Chat */}
                    <div className="w-full md:w-80 bg-navy-900 flex flex-col h-64 md:h-full">
                        <div className="p-4 border-b border-navy-700 bg-navy-950/50">
                            <h3 className="font-serif font-bold text-gold text-sm tracking-widest uppercase">Live Sync Chat</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm"
                                >
                                    <span className={`font-bold mr-2 ${msg.user === user?.name ? 'text-teal-400' : 'text-gold-light'}`}>{msg.user}</span>
                                    <span className="text-gray-300">{msg.text}</span>
                                </motion.div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-3 bg-navy-950 border-t border-navy-700 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Send a message..."
                                className="w-full bg-navy-900 border border-navy-600 rounded-full py-2 px-4 pr-10 text-sm text-white focus:outline-none focus:border-gold/50"
                            />
                            <button type="submit" disabled={!input.trim()} className="absolute right-5 top-1/2 -translate-y-1/2 text-gold hover:text-white disabled:opacity-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
