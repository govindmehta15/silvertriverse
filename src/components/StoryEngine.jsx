import React from 'react';
import { motion } from 'framer-motion';

export default function StoryEngine({
    filmReference,
    sceneReference,
    characterReference,
    designerNote,
    culturalContext,
    memoryTag
}) {
    return (
        <section className="relative overflow-hidden bg-zinc-950 text-zinc-300 py-16 px-6 md:px-12 rounded-xl my-16 shadow-2xl border border-gold/10">
            {/* Cinematic Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.12)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <span className="w-12 h-px bg-gold/50" />
                    <span className="font-serif text-gold text-sm tracking-widest uppercase">
                        {filmReference || 'Cinematic Archives'}
                    </span>
                    <span className="w-12 h-px bg-gold/50" />
                </div>

                <h2 className="font-serif text-4xl md:text-5xl text-white mb-16 leading-tight tracking-wide">
                    The Story Behind This Piece
                </h2>

                <div className="space-y-16">
                    {/* Scene Description & Emotional Impact */}
                    {(sceneReference || memoryTag) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-none">
                            <h3 className="font-sans text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">The Moment</h3>
                            {sceneReference && (
                                <p className="font-serif text-2xl md:text-3xl leading-relaxed text-zinc-100 font-medium">
                                    {sceneReference}
                                </p>
                            )}
                            {memoryTag && (
                                <p className="font-serif text-xl md:text-xl text-zinc-400 italic mt-6 border-l-2 border-gold/30 pl-5 py-1 leading-relaxed">
                                    {memoryTag}
                                </p>
                            )}
                            {characterReference && (
                                <div className="mt-8 flex items-center gap-3">
                                    <span className="w-6 h-px bg-zinc-700" />
                                    <span className="text-xs font-sans text-zinc-500 uppercase tracking-widest font-bold">
                                        Embodied by {characterReference}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Cultural Interpretation */}
                    {culturalContext && (
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                            <h3 className="font-sans text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Cultural Resonance</h3>
                            <p className="font-sans text-lg md:text-xl leading-loose text-zinc-300 font-light text-justify">
                                {culturalContext}
                            </p>
                        </motion.div>
                    )}

                    {/* Designer Inspiration & Why Crafted */}
                    {designerNote && (
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-zinc-900/40 border border-zinc-800/80 p-8 md:p-10 rounded-lg relative mt-8">
                            <div className="absolute top-0 left-8 -translate-y-1/2 bg-zinc-950 px-3 text-gold/60">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                            </div>
                            <h3 className="font-sans text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-5 mt-2">Designer's Vision & Craft</h3>
                            <p className="font-serif text-lg md:text-xl leading-relaxed text-zinc-300">
                                {designerNote}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
