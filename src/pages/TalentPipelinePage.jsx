import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STAGES = [
    { id: 'inbox', title: 'Inbox', color: 'border-blue-500/30 text-blue-400' },
    { id: 'reviewing', title: 'Reviewing', color: 'border-teal-500/30 text-teal-400' },
    { id: 'shortlisted', title: 'Shortlisted', color: 'border-yellow-500/30 text-yellow-400' },
    { id: 'offered', title: 'Offered', color: 'border-green-500/30 text-green-400' }
];

export default function TalentPipelinePage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [draggedStoryId, setDraggedStoryId] = useState(null);
    const [selectedOfferStory, setSelectedOfferStory] = useState(null);

    const professionalId = user ? user.id : 'pro_1'; // fallback for demo

    const { data: pipelineRes, isLoading } = useQuery({
        queryKey: ['pipeline', professionalId],
        queryFn: () => pipelineService.getPipeline(professionalId)
    });

    const updateStageMutation = useMutation({
        mutationFn: ({ storyId, newStage }) => pipelineService.updateStage(professionalId, storyId, newStage),
        onSuccess: () => queryClient.invalidateQueries(['pipeline', professionalId])
    });

    const pipelineData = pipelineRes?.success ? pipelineRes.data : [];

    const handleDragStart = (e, storyId) => {
        setDraggedStoryId(storyId);
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', storyId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // allow drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetStage) => {
        e.preventDefault();
        const storyId = e.dataTransfer.getData('text/plain') || draggedStoryId;
        if (storyId) {
            updateStageMutation.mutate({ storyId, newStage: targetStage });
            setDraggedStoryId(null);

            if (targetStage === 'offered') {
                const storyItem = pipelineData.find(item => item.storyId === storyId);
                setSelectedOfferStory(storyItem);
            }
        }
    };

    const handleSendOffer = () => {
        addToast("Offer sent successfully! The creator has been notified.", "success");
        setSelectedOfferStory(null);
    };

    return (
        <div className="min-h-screen px-6 py-10 pb-24 lg:pb-10">
            <div className="mb-8 flex justify-between items-end border-b border-navy-700 pb-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-gold-shimmer mb-2">Talent Pipeline</h1>
                    <p className="text-gray-400 text-sm">Manage incoming story pitches and scout creators. Drag cards to update their status.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-500 animate-pulse text-center py-20">Loading pipeline...</div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
                    {STAGES.map(stage => {
                        const items = pipelineData.filter(item => item.stage === stage.id);

                        return (
                            <div
                                key={stage.id}
                                className="flex-1 min-w-[300px] bg-navy-900 border border-navy-700/50 rounded-2xl flex flex-col snap-start"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                {/* Column Header */}
                                <div className={`p-4 border-b bg-navy-800/50 rounded-t-2xl flex justify-between items-center ${stage.color}`}>
                                    <h3 className="font-bold tracking-wide uppercase text-sm">{stage.title}</h3>
                                    <span className="bg-navy-950 px-2 py-0.5 rounded text-xs font-bold border border-navy-700">
                                        {items.length}
                                    </span>
                                </div>

                                {/* Cards Container */}
                                <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[70vh]">
                                    {items.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-navy-700 rounded-xl flex items-center justify-center text-gray-600 text-sm">
                                            Drop here
                                        </div>
                                    )}

                                    {items.map(item => (
                                        <motion.div
                                            key={item.storyId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.storyId)}
                                            layoutId={`card-${item.storyId}`}
                                            className="bg-navy-950 border border-navy-600/30 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-gold/30 transition-colors shadow-lg"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-serif font-bold text-gray-200">{item.story?.title || 'Unknown Story'}</h4>
                                                {stage.id === 'offered' && <span className="text-green-500 text-xs text-shadow-sm ml-2">✓</span>}
                                            </div>
                                            <p className="text-xs text-gold/80 mb-3">{item.story?.genre}</p>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                {item.story?.synopsis}
                                            </p>

                                            {stage.id === 'shortlisted' && (
                                                <button
                                                    onClick={() => setSelectedOfferStory(item)}
                                                    className="mt-3 w-full py-1.5 bg-teal-900/40 hover:bg-teal-800/60 border border-teal-500/30 text-teal-400 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Draft Offer
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mock Offer Modal */}
            {selectedOfferStory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setSelectedOfferStory(null)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-luxury relative w-full max-w-lg p-6 bg-navy-900 border border-navy-600/50 rounded-2xl shadow-glow-gold"
                    >
                        <h2 className="font-serif text-2xl text-gold font-bold mb-1">Make an Offer</h2>
                        <p className="text-gray-400 text-sm mb-6">You are preparing a formal pitch offer to the creator of <strong className="text-white">{selectedOfferStory.story?.title}</strong>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Offer Term</label>
                                <select className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50">
                                    <option>Option Agreement ($5,000 Advance)</option>
                                    <option>Development Deal (Tier 1)</option>
                                    <option>Direct Purchase</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Personal Message</label>
                                <textarea
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white text-sm min-h-[100px] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
                                    placeholder="We love your concept and want to bring it to our studio..."
                                ></textarea>
                            </div>

                            <button
                                onClick={handleSendOffer}
                                className="gold-btn w-full mt-2"
                            >
                                Send Formal Offer
                            </button>
                            <button
                                onClick={() => setSelectedOfferStory(null)}
                                className="w-full py-2.5 text-gray-400 text-sm hover:text-white font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
