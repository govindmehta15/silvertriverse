import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storyService } from '../services/storyService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function StorySubmissionPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        synopsis: ''
    });

    const mutation = useMutation({
        mutationFn: (newStory) => storyService.createStory(newStory),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            addToast('Story pitch submitted successfully!', 'success');
            navigate('/collectible-units');
        },
        onError: () => {
            addToast('Failed to submit story', 'error');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.genre || !formData.synopsis) {
            addToast('Please fill all fields', 'error');
            return;
        }

        mutation.mutate({
            ...formData,
            authorId: user?.id || 'u1',
            authorName: user?.name || 'Unknown',
            authorAvatar: user?.avatar || '/images/profile_avatar.png'
        });
    };

    return (
        <div className="min-h-screen pb-20 relative px-4 pt-10">
            {/* Background elements */}
            <div className="absolute inset-0 bg-navy-950 -z-20" />
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-900/30 to-transparent -z-10" />

            <div className="max-w-2xl mx-auto">
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => navigate('/collectible-units')}
                    className="flex items-center text-gray-400 hover:text-gold mb-6 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Collectible Units
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-navy-800/80 border border-navy-600/50 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-glow-rare"
                >
                    <div className="text-center mb-8">
                        <span className="inline-block p-3 rounded-full bg-gold/10 text-gold mb-4 shadow-glow-gold">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.121l-2.857.714a.5.5 0 01-.61-.61l.714-2.857a4.5 4.5 0 011.12-1.89l13.49-13.49z" />
                            </svg>
                        </span>
                        <h1 className="font-serif text-3xl font-bold text-white mb-2">Pitch Your Story</h1>
                        <p className="text-gray-400">Share your original concept with the Collectible Units community and catch the eye of collectors and industry professionals.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 tracking-wider uppercase">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                maxLength={60}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                                placeholder="E.g. The Quantum Paradox"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 tracking-wider uppercase">Genre</label>
                            <input
                                type="text"
                                value={formData.genre}
                                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                                placeholder="E.g. Sci-Fi / Thriller"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 tracking-wider uppercase">Synopsis</label>
                            <textarea
                                rows={5}
                                value={formData.synopsis}
                                onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all resize-none"
                                placeholder="Describe your world, characters, and the central conflict..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2 flex justify-between">
                                <span>Keep it compelling and brief.</span>
                                <span>{formData.synopsis.length} / 500</span>
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 text-navy-950 font-bold text-lg shadow-glow-gold relative overflow-hidden"
                        >
                            {mutation.isPending ? 'Submitting...' : 'Submit Pitch'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
