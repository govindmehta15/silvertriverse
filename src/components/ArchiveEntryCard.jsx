import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArchiveEntryCard({ entry, isPremium = false }) {
    const navigate = useNavigate();

    if (!entry) return null;

    const bgClass = isPremium ? 'bg-zinc-900 border border-gold/20 shadow-[0_0_30px_rgba(201,162,39,0.05)]' : 'bg-white border border-blue-100 shadow-sm rounded-2xl';
    const textMain = isPremium ? 'text-white' : 'text-gray-900';
    const textMuted = isPremium ? 'text-zinc-400' : 'text-gray-600';
    const accent = isPremium ? 'text-gold' : 'text-blue-600';
    const buttonClass = isPremium ? 'text-gold hover:text-white border border-gold/30 hover:bg-gold/10 rounded-sm' : 'text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 rounded-full bg-blue-50/50';

    return (
        <div className={`p-6 md:p-8 relative overflow-hidden mt-10 ${bgClass}`}>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                {/* Visual */}
                <div className={`md:w-1/3 shrink-0 relative aspect-video md:aspect-[4/5] overflow-hidden ${isPremium ? 'border border-zinc-800' : 'rounded-xl'}`}>
                    <img
                        src={entry.stillUrl}
                        alt="Archive Still"
                        className="w-full h-full object-cover filter mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-white rounded-full">
                        {entry.releaseYear}
                    </div>
                </div>

                {/* Info */}
                <div className="md:w-2/3 flex flex-col justify-center">
                    <h3 className={`font-serif text-2xl md:text-3xl mb-6 ${textMain} flex items-center gap-3`}>
                        <span className="text-2xl">🏛</span>
                        Cultural Archive Entry
                    </h3>

                    <div className="space-y-5 mb-8">
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${accent}`}>Historical Context</p>
                            <p className={`text-sm leading-relaxed ${textMuted}`}>{entry.historicalContext}</p>
                        </div>
                        <div>
                            <p className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${accent}`}>Collector Impact</p>
                            <p className={`text-sm leading-relaxed ${textMuted}`}>{entry.collectorImpact}</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className={`flex flex-wrap gap-4 pt-5 border-t ${isPremium ? 'border-zinc-800' : 'border-gray-100'}`}>
                        <button
                            onClick={() => navigate(`/collectible-units/film/${entry.filmId}`)}
                            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${buttonClass}`}
                        >
                            Explore Film 🎬
                        </button>
                        <button
                            onClick={() => navigate(`/collectible-units`)}
                            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${buttonClass}`}
                        >
                            View Relic Context 🏛
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
