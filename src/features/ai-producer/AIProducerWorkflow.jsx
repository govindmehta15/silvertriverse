import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
    { id: 1, name: 'Submission Upload', icon: '📤' },
    { id: 2, name: 'Script Scanning', icon: '🔍' },
    { id: 3, name: 'Originality Analysis', icon: '✨' },
    { id: 4, name: 'Market Viability', icon: '📈' },
    { id: 5, name: 'Narrative Strength', icon: '🎭' },
    { id: 6, name: 'Risk & Red-Flags', icon: '🚩' },
    { id: 7, name: 'Ranking & Decision', icon: '🏆' },
];

export default function AIProducerWorkflow({ tool, creditsCost, onDeduct, onSaveRun }) {
    const [stage, setStage] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);

    const [selectedPastScript, setSelectedPastScript] = useState(null);
    const [viewMode, setViewMode] = useState('upload'); // 'upload' or 'past'

    const pastScripts = [
        { id: 'ps1', name: 'Project_Alpha_Draft3.pdf', date: '2026-03-10' },
        { id: 'ps2', name: 'Neon_Nights_Pilot.fountain', date: '2026-03-12' },
        { id: 'ps3', name: 'The_Last_Echo.docx', date: '2026-03-14' },
    ];

    const nextStage = () => setStage((s) => Math.min(s + 1, 7));
    const prevStage = () => setStage((s) => Math.max(s - 1, 1));

    const handleStartAnalysis = (isPast = false) => {
        if (!file && !selectedPastScript) return;
        setIsProcessing(true);
        // Simulate credit deduction and processing
        setTimeout(async () => {
            const deduct = await onDeduct(creditsCost);
            if (deduct.success) {
                onSaveRun(tool.id, tool.name, creditsCost);
                setResults({
                    originality: 92,
                    viability: 'High',
                    narrative: 8.5,
                    risks: ['Moderate budgetary similarity with "Inception"', 'Political sensitivity in Stage 2'],
                    ranking: '#4 in Sci-Fi this month'
                });
                setIsProcessing(false);
                nextStage();
            } else {
                alert('Insufficient credits');
                setIsProcessing(false);
            }
        }, 1500);
    };

    return (
        <div className="space-y-8">
            {/* Stepper */}
            <div className="flex justify-between items-center px-4 overflow-x-auto pb-4 hide-scrollbar">
                {STAGES.map((s) => (
                    <div key={s.id} className="flex flex-col items-center min-w-[100px] relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-500 ${stage >= s.id ? 'bg-gold text-navy-950 scale-110 shadow-lg shadow-gold/20' : 'bg-navy-800 text-gray-500'
                            }`}>
                            {s.icon}
                        </div>
                        <span className={`text-[10px] mt-2 font-medium uppercase tracking-tighter text-center ${stage >= s.id ? 'text-gold' : 'text-gray-600'
                            }`}>
                            {s.name}
                        </span>
                        {s.id < 7 && (
                            <div className={`absolute top-5 left-[70px] w-[60px] h-[2px] -z-0 ${stage > s.id ? 'bg-gold' : 'bg-navy-800'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-navy-900/40 border border-navy-700/50 rounded-3xl p-8 min-h-[440px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {stage === 1 && (
                        <motion.div
                            key="stage1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col space-y-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-serif font-bold text-white">Select Script Source</h2>
                                <div className="flex bg-navy-800 p-1 rounded-xl border border-navy-700">
                                    <button
                                        onClick={() => setViewMode('upload')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'upload' ? 'bg-gold text-navy-950' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        UPLOAD NEW
                                    </button>
                                    <button
                                        onClick={() => setViewMode('past')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'past' ? 'bg-gold text-navy-950' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        PAST SCRIPTS
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'upload' ? (
                                <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 border-2 border-dashed border-navy-700 rounded-3xl bg-navy-950/30">
                                    <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                        <span className="text-4xl text-gold">📤</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Upload Script File</h3>
                                        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-4">
                                            Supports PDF, Final Draft (.fdx), Fountain, DOCX, and Text.
                                        </p>
                                        <div className="flex justify-center gap-3">
                                            {['.pdf', '.fdx', '.fountain', '.docx', '.txt'].map(fmt => (
                                                <span key={fmt} className="px-2 py-1 bg-navy-800 rounded text-[10px] text-gray-500 font-mono italic">{fmt}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <label className="cursor-pointer group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => { setFile(e.target.files[0]); setSelectedPastScript(null); }}
                                            disabled={isProcessing}
                                            accept=".pdf,.fdx,.fountain,.docx,.txt"
                                        />
                                        <div className="px-8 py-3 rounded-xl bg-gold/15 border border-gold/30 text-gold font-bold group-hover:bg-gold/25 transition-all flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            {file ? file.name : 'CHOOSE FILE'}
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="grid gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                    {pastScripts.map((ps) => (
                                        <button
                                            key={ps.id}
                                            onClick={() => { setSelectedPastScript(ps); setFile(null); }}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedPastScript?.id === ps.id
                                                ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5'
                                                : 'bg-navy-800/50 border-navy-700 hover:border-navy-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-lg bg-navy-950 flex items-center justify-center text-xl">📄</div>
                                                <div>
                                                    <p className="text-white font-bold text-sm tracking-wide">{ps.name}</p>
                                                    <p className="text-gray-500 text-xs">Analyzed on {ps.date}</p>
                                                </div>
                                            </div>
                                            {selectedPastScript?.id === ps.id && (
                                                <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-navy-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {(file || selectedPastScript) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 flex justify-center"
                                >
                                    <button
                                        onClick={() => handleStartAnalysis(!!selectedPastScript)}
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gold text-navy-950 font-black tracking-widest hover:bg-gold-shimmer transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-navy-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                INITIALIZING...
                                            </>
                                        ) : (
                                            <>
                                                START 7-STAGE ANALYSIS
                                                <span className="bg-navy-950/20 px-2 py-0.5 rounded text-xs">-{creditsCost} CRS</span>
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {stage === 2 && (
                        <motion.div
                            key="stage2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-serif font-bold text-white">Stage 2: Script Scanning</h2>
                            <div className="grid gap-4">
                                {[
                                    { l: 'Word Count', v: '18,540 words' },
                                    { l: 'Genre Detected', v: 'Sci-Fi / Thriller' },
                                    { l: 'Formatting Check', v: 'Standard Industry Format' },
                                    { l: 'Character Entities', v: '12 Unique Speaking Roles' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between p-4 rounded-xl bg-navy-800/50 border border-navy-700/50 text-sm">
                                        <span className="text-gray-400">{item.l}</span>
                                        <span className="text-gold font-bold">{item.v}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={nextStage} className="float-right px-8 py-2 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-600">Continue</button>
                        </motion.div>
                    )}

                    {stage === 3 && (
                        <motion.div
                            key="stage3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-serif font-bold text-white">Stage 3: Originality & Similarity</h2>
                            <div className="p-6 rounded-2xl bg-navy-800/50 border border-navy-700/50 flex items-center gap-6">
                                <div className="relative w-24 h-24">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path className="stroke-current text-navy-700" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="stroke-current text-teal-400" strokeWidth="2" strokeDasharray={`${results.originality}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-white">{results.originality}%</div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Unique Narrative Index</h3>
                                    <p className="text-gray-400 text-sm">Our engine compared this submission against 10M+ copyright records and existing scripts.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={prevStage} className="px-8 py-2 rounded-xl bg-navy-950/50 border border-navy-800 text-gray-500 font-bold hover:bg-navy-800">Back</button>
                                <button onClick={nextStage} className="ml-auto px-8 py-2 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-600">Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {stage === 4 && (
                        <motion.div
                            key="stage4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-serif font-bold text-white">Stage 4: Market Viability</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-navy-800/50 border border-navy-700/50 text-center">
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Viability Score</p>
                                    <p className="text-3xl font-bold text-emerald-400">{results.viability}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-navy-800/50 border border-navy-700/50 text-center">
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Est. Budget Tier</p>
                                    <p className="text-3xl font-bold text-white">₹₹₹</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm p-4 rounded-xl bg-navy-950/30 border border-navy-800">
                                Analysis suggests high resonance with Urban Gen-Z audiences in Tier 1 cities. Predicted ROI index: 4.2x.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={prevStage} className="px-8 py-2 rounded-xl bg-navy-950/50 border border-navy-800 text-gray-500 font-bold hover:bg-navy-800">Back</button>
                                <button onClick={nextStage} className="ml-auto px-8 py-2 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-600">Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {stage === 5 && (
                        <motion.div
                            key="stage5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-serif font-bold text-white">Stage 5: Narrative Strength</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Character Arc', score: 85 },
                                    { label: 'Pacing', score: 92 },
                                    { label: 'Dialogue', score: 78 },
                                    { label: 'Hook', score: 95 }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-gray-400">{item.label}</span>
                                            <span className="text-gold">{item.score}/100</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-navy-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                className="h-full bg-gold"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 pt-4 text-center">
                                <button onClick={prevStage} className="flex-1 px-8 py-2 rounded-xl bg-navy-950/50 border border-navy-800 text-gray-500 font-bold hover:bg-navy-800">Back</button>
                                <button onClick={nextStage} className="flex-1 px-8 py-2 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-600">Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {stage === 6 && (
                        <motion.div
                            key="stage6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                                Stage 6: Risk & Red-Flags <span className="text-rose-500">🚩</span>
                            </h2>
                            <ul className="space-y-3">
                                {results.risks.map((risk, i) => (
                                    <li key={i} className="flex gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-200 text-sm">
                                        <span className="text-rose-500 font-bold">•</span>
                                        {risk}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-4">
                                <button onClick={prevStage} className="px-8 py-2 rounded-xl bg-navy-950/50 border border-navy-800 text-gray-500 font-bold hover:bg-navy-800">Back</button>
                                <button onClick={nextStage} className="ml-auto px-8 py-2 rounded-xl bg-navy-700 text-white font-bold hover:bg-navy-600">Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {stage === 7 && (
                        <motion.div
                            key="stage7"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center space-y-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🏆</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-white mb-2">Analysis Complete</h2>
                                <p className="text-emerald-400 font-bold text-xl mb-4">{results.ranking}</p>
                                <div className="max-w-md mx-auto p-6 rounded-2xl bg-navy-800/50 border border-navy-700/50 text-left space-y-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-widest border-b border-navy-700 pb-2">Producer Recommendation</h3>
                                    <p className="text-gray-300 text-sm italic">"High potential for digital series. Strong narrative hook outweighs similarity risks. Recommended for fast-track development."</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <button className="px-8 py-4 rounded-2xl bg-gold text-navy-950 font-bold hover:bg-gold-shimmer transition-all">Download Executive Report</button>
                                <button onClick={() => setStage(1)} className="px-8 py-4 rounded-2xl bg-navy-800 text-white font-bold hover:bg-navy-700 transition-all border border-navy-600">Screen New Script</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-center text-gray-500 text-xs uppercase tracking-[0.2em]">
                SILVERTRIVERSE PRODUCER ENGINE · v2.4a · Confidential 2026
            </p>
        </div>
    );
}
