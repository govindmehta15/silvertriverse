import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DigitalBooklet({ pages, onClose, isPremium = false }) {
    const [currentPage, setCurrentPage] = useState(0);

    const next = () => setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
    const prev = () => setCurrentPage((p) => Math.max(p - 1, 0));

    // Thematic styling depending on product type
    const bgClass = isPremium ? 'bg-zinc-950 text-gold' : 'bg-[#fafafa] text-blue-900';
    const borderClass = isPremium ? 'border-gold/30 shadow-[0_0_50px_rgba(201,162,39,0.15)]' : 'border-blue-100 shadow-2xl';
    const textBase = isPremium ? 'text-zinc-300' : 'text-gray-600';
    const accentColor = isPremium ? 'text-gold/60' : 'text-blue-500';
    const arrowColor = isPremium ? 'text-gold/50 hover:text-gold' : 'text-blue-300 hover:text-blue-600';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-12 overflow-hidden"
        >
            <div className="absolute inset-0 pointer-events-none" onClick={onClose} />

            <div className={`relative w-full max-w-3xl aspect-[3/4] md:aspect-[16/10] flex rounded-sm overflow-hidden border ${borderClass} ${bgClass} z-10`}>

                {/* Background Textures */}
                {isPremium ? (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.05)_0%,transparent_70%)] pointer-events-none" />
                ) : (
                    <div className="absolute inset-0 bg-blue-50/30 pointer-events-none" />
                )}

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-6 z-50 text-3xl font-light opacity-50 hover:opacity-100 transition-opacity">
                    &times;
                </button>

                {/* Page Content */}
                <div className="relative flex-1 perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, rotateY: 90, z: -100 }}
                            animate={{ opacity: 1, rotateY: 0, z: 0 }}
                            exit={{ opacity: 0, rotateY: -90, z: -100 }}
                            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16 text-center origin-left"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <h4 className={`text-xs font-bold uppercase tracking-[0.25em] mb-8 ${accentColor}`}>
                                {pages[currentPage].title}
                            </h4>

                            {pages[currentPage].type === 'image' && (
                                <div className={`mb-8 p-1 w-full max-w-sm aspect-video ${isPremium ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-200 bg-white'}`}>
                                    <img
                                        src={pages[currentPage].content}
                                        alt={pages[currentPage].title}
                                        className="w-full h-full object-cover mix-blend-luminosity"
                                    />
                                </div>
                            )}

                            {pages[currentPage].type === 'quote' && (
                                <p className="font-serif text-3xl md:text-5xl italic mb-6 leading-tight max-w-xl">
                                    {pages[currentPage].text}
                                </p>
                            )}

                            {pages[currentPage].type !== 'quote' && (
                                <p className={`font-serif text-lg md:text-xl leading-relaxed max-w-md ${textBase}`}>
                                    {pages[currentPage].text}
                                </p>
                            )}

                            <p className="absolute bottom-6 font-mono text-[10px] tracking-widest opacity-40">
                                {currentPage + 1} / {pages.length}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <button
                    onClick={prev}
                    disabled={currentPage === 0}
                    className={`absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center z-40 transition-all ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'} ${arrowColor}`}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={next}
                    disabled={currentPage === pages.length - 1}
                    className={`absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center z-40 transition-all ${currentPage === pages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'} ${arrowColor}`}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </motion.div>
    );
}
