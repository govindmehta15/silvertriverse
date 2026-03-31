import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postService, authService } from '../services';
import GoldButton from '../components/GoldButton';

export default function CreatePostPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [caption, setCaption] = useState('');
    const [film, setFilm] = useState('');
    const [image, setImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const createPostMutation = useMutation({
        mutationFn: async (postData) => {
            const userRes = await authService.getCurrentUser();
            if (!userRes.success) throw new Error('Not logged in');
            const newPost = {
                ...postData,
                author: userRes.data.name,
                avatar: userRes.data.avatar,
                likes: 0,
                comments: 0
            };
            const result = await postService.createPost(newPost);

            // Implicit score tracking for creating a post
            const users = JSON.parse(localStorage.getItem('users'));
            if (users) {
                const userIndex = users.findIndex(u => u.id === userRes.data.id);
                if (userIndex > -1) {
                    users[userIndex].participationScore = (users[userIndex].participationScore || 0) + 15;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['posts']);
            navigate('/collectible-units');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption) return;
        setIsLoading(true);
        createPostMutation.mutate({
            caption,
            film: film || null,
            image: image || '/images/post_bts.png' // Default mock image
        });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="mb-6 w-10 h-10 rounded-full bg-navy-800 border border-navy-600/50 flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>

            <h1 className="font-serif text-3xl font-bold text-white mb-8">Create Post</h1>

            <form onSubmit={handleSubmit} className="card-luxury p-6 space-y-6">
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Film Tag (Optional)</label>
                    <input
                        type="text"
                        value={film}
                        onChange={(e) => setFilm(e.target.value)}
                        placeholder="e.g. Aetherion: The Future Is Now"
                        className="w-full bg-navy-900 border border-navy-600 rounded-lg p-3 text-white focus:outline-none focus:border-gold transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Caption</label>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's happening on set?"
                        required
                        className="w-full bg-navy-900 border border-navy-600 rounded-lg p-3 text-white h-32 resize-none focus:outline-none focus:border-gold transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Mock Image URL</label>
                    <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="/images/post_bts.png"
                        className="w-full bg-navy-900 border border-navy-600 rounded-lg p-3 text-white focus:outline-none focus:border-gold transition-colors"
                    />
                </div>

                <GoldButton
                    size="lg"
                    className="w-full justify-center"
                    type="submit"
                    disabled={isLoading || !caption}
                >
                    {isLoading ? 'Posting...' : 'Share Update'}
                </GoldButton>
            </form>
        </div>
    );
}
