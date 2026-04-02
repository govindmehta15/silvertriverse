import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonBanner } from '../components/Skeleton';
import LiveSyncRoom from '../components/LiveSyncRoom';

export default function CommunityGroupPage() {
    const { id: groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [newPostContent, setNewPostContent] = useState('');
    const [showSyncRoom, setShowSyncRoom] = useState(false);

    const { data: groupRes, isLoading: groupLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => communityService.getGroupById(groupId),
        refetchInterval: 10000,
    });

    const { data: leaderboardRes, isLoading: leaderLoading } = useQuery({
        queryKey: ['groupLeaderboard', groupId],
        queryFn: () => communityService.getLeaderboard(groupId),
    });

    const group = groupRes?.success ? groupRes.data : null;
    const leaderboard = leaderboardRes?.success ? leaderboardRes.data : [];
    const isLoading = groupLoading || leaderLoading;

    const isMember = group?.members?.includes(user?.id || 'guest');

    // Mutations
    const joinMutation = useMutation({
        mutationFn: () => communityService.joinGroup(groupId, user?.id || 'guest'),
        onSuccess: () => {
            queryClient.invalidateQueries(['group', groupId]);
            queryClient.invalidateQueries(['groupLeaderboard', groupId]);
            addToast('Inducted into the Society!', 'success');
        }
    });

    const leaveMutation = useMutation({
        mutationFn: () => communityService.leaveGroup(groupId, user?.id || 'guest'),
        onSuccess: () => {
            queryClient.invalidateQueries(['group', groupId]);
            queryClient.invalidateQueries(['groupLeaderboard', groupId]);
            addToast('Society membership rescinded.', 'info');
        }
    });

    const postMutation = useMutation({
        mutationFn: (postData) => communityService.addPost(groupId, postData),
        onSuccess: () => {
            queryClient.invalidateQueries(['group', groupId]);
            queryClient.invalidateQueries(['groupLeaderboard', groupId]);
            setNewPostContent('');
            addToast('Discourse added', 'success');
        },
        onError: () => addToast('Failed to post', 'error')
    });

    const commentMutation = useMutation({
        mutationFn: ({ postId, content }) => communityService.addComment(groupId, postId, {
            authorId: user?.id || 'guest',
            authorName: user?.name || 'Guest User',
            content
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['group', groupId]);
            addToast('Comment added!', 'success');
        }
    });

    const [commentInputs, setCommentInputs] = useState({});

    const handleCommentSubmit = (e, postId) => {
        e.preventDefault();
        const content = commentInputs[postId];
        if (!content?.trim()) return;
        commentMutation.mutate({ postId, content });
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    };

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        postMutation.mutate({
            authorId: user?.id || 'guest',
            authorName: user?.name || 'Guest User',
            content: newPostContent
        });
    };

    const handleJoinToggle = () => {
        if (isMember) {
            leaveMutation.mutate();
        } else {
            joinMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen px-4 pt-10">
                <SkeletonBanner duration={2} />
            </div>
        );
    }

    if (!group) {
        return <div className="p-10 text-center text-zinc-500 font-serif text-lg">Society not found.</div>;
    }

    return (
        <div className="min-h-screen pb-32 relative bg-zinc-950 font-sans text-gray-200">
            {/* Cinematic Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-zinc-950 to-zinc-950 -z-10" />

            <div className="max-w-6xl mx-auto px-4 pt-12">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/reelity/clubs')}
                    className="flex items-center text-zinc-500 hover:text-gold mb-10 transition-colors text-[10px] uppercase font-bold tracking-widest group"
                >
                    <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Return to Societies
                </button>

                {/* Society Header */}
                <div className="bg-zinc-900 border border-gold/20 rounded-2xl p-8 lg:p-12 mb-10 flex flex-col md:flex-row md:items-start justify-between gap-8 relative overflow-hidden group shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-gold/5 blur-xl group-hover:to-gold/10 transition-all opacity-50 z-0 pointer-events-none" />

                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-gold/10 text-gold border border-gold/30 text-[10px] uppercase tracking-widest px-3 py-1 font-bold rounded-sm">
                                EST. 2026
                            </span>
                            <span className="text-zinc-500 text-xs tracking-widest uppercase">
                                {group.topic}
                            </span>
                        </div>

                        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4 tracking-wide">{group.name}</h1>
                        <p className="text-zinc-400 text-lg mb-6 max-w-2xl leading-relaxed font-serif italic">{group.description}</p>

                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                            <div className="flex items-center text-teal-400 bg-zinc-950 px-4 py-2 border border-teal-900/50 rounded-lg">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V4H2v16h5m10 0v-5m-10 5v-5M7 11h10" /></svg>
                                {group.members.length} Members
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-end gap-4 shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleJoinToggle}
                            className={`px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest w-full md:w-auto shadow-md transition-all
                            ${isMember
                                    ? 'bg-zinc-950 border border-red-500/50 text-red-500 hover:bg-red-950/30'
                                    : 'bg-gold border border-gold/50 text-zinc-950 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]'}`}
                        >
                            {isMember ? 'Rescind Membership' : 'Request Induction'}
                        </motion.button>

                        {isMember && (
                            <button
                                onClick={() => setShowSyncRoom(true)}
                                className="px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest w-full md:w-auto border border-zinc-700 hover:border-blue-400 text-blue-400 bg-zinc-950 hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Enter Sync Room
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-Layout Structure */}
                {isMember ? (
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Feed Column */}
                        <div className="flex-1 space-y-8">

                            {/* Create Post Area */}
                            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 mb-8">
                                <form onSubmit={handlePostSubmit} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/40 to-zinc-800 border border-gold/20 flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="What profound realization shall we discuss?"
                                            rows="2"
                                            className="w-full bg-transparent text-white placeholder-zinc-600 focus:outline-none resize-none pt-2"
                                        />
                                        <div className="absolute right-0 bottom-0 text-right">
                                            <button
                                                type="submit"
                                                disabled={postMutation.isPending || !newPostContent.trim()}
                                                className="px-5 py-2 bg-zinc-800 hover:bg-gold hover:text-zinc-950 border border-zinc-700 hover:border-gold/50 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-white"
                                            >
                                                {postMutation.isPending ? 'Scribing...' : 'Contribute'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Feed Items */}
                            <div className="space-y-6">
                                {(!group.posts || group.posts.length === 0) ? (
                                    <div className="text-center py-16 text-zinc-600 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
                                        No discourse written yet. You hold the pen.
                                    </div>
                                ) : (
                                    group.posts.map(post => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
                                        >
                                            <Link to={`/profile/${post.authorId}`} className="flex items-center hover:opacity-80 transition-opacity">
                                                <div className="w-8 h-8 rounded-full bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold mr-3 border border-cyan-500/30 shrink-0">
                                                    {post.authorName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white hover:text-gold transition-colors">{post.authorName}</h3>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{new Date(post.timestamp).toLocaleString()}</p>
                                                </div>
                                            </Link>
                                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-5 font-serif">{post.content}</p>

                                            <div className="h-px bg-zinc-800 w-full mb-4" />

                                            {/* Comments */}
                                            <div className="space-y-4">
                                                {post.comments?.map(comment => (
                                                    <div key={comment.id} className="flex items-start text-sm">
                                                        <span className="font-bold text-teal-500 mr-2 shrink-0 border-b border-teal-500/30 pb-0.5">{comment.authorName}</span>
                                                        <span className="text-zinc-400 break-words">{comment.content}</span>
                                                    </div>
                                                ))}

                                                <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-gold/30 transition-colors mt-2">
                                                    <input
                                                        type="text"
                                                        value={commentInputs[post.id] || ''}
                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        placeholder="Engage in discourse..."
                                                        className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none"
                                                    />
                                                    <button type="submit" disabled={!commentInputs[post.id]?.trim()} className="px-4 text-gold hover:text-white disabled:opacity-30 disabled:hover:text-gold transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                    </button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Leaderboard Column */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-24 bg-zinc-950 border border-gold/10 p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
                                <h2 className="font-serif text-xl tracking-wide text-gold border-b border-zinc-800 pb-3 mb-4">
                                    Society Rank
                                </h2>

                                {leaderLoading ? (
                                    <div className="space-y-3"><SkeletonBanner duration={1} /></div>
                                ) : leaderboard.length === 0 ? (
                                    <p className="text-zinc-600 text-sm text-center py-6">No ranked contributors.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {leaderboard.map((u, index) => (
                                            <Link
                                                key={u.userId}
                                                to={`/profile/${u.userId}`}
                                                className="flex justify-between items-center p-3 rounded-lg bg-zinc-900 border border-zinc-800/50 hover:border-gold/30 hover:bg-zinc-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-4 font-serif font-bold text-center ${index === 0 ? 'text-gold' : index === 1 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-zinc-200 text-sm font-medium group-hover:text-gold">{u.name}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-teal-400 font-mono text-xs">{u.score} PV</span>
                                                    <span className="text-zinc-600 text-[9px] uppercase tracking-widest">Points</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl mt-8">
                        <div className="w-20 h-20 mx-auto bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800 mb-6 shadow-glow-rare">
                            <svg className="w-8 h-8 text-gold opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h2 className="text-2xl font-serif text-white mb-3 tracking-wide">Sanctum Closed</h2>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">The discourse within this society is protected. Request induction to read, scibe, and sync with members.</p>
                        <button
                            onClick={handleJoinToggle}
                            className="bg-gold text-zinc-950 font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-lg hover:bg-yellow-500 transition-colors shadow-glow-gold"
                        >
                            Request Induction
                        </button>
                    </div>
                )}
            </div>

            {showSyncRoom && (
                <LiveSyncRoom
                    groupId={group.id}
                    groupName={group.name}
                    onClose={() => setShowSyncRoom(false)}
                />
            )}
        </div>
    );
}
