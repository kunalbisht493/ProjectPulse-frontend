import { MessageSquare, X, Send, User, Trash2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { showSuccess } from '../Utils/Toast';
import axios from 'axios';

export default function Comment({ isOpen, onClose, task, onCommentAdded }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('userName');
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (isOpen && task) {
            fetchComments();
        }
    }, [isOpen, task]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/api/v1/task/${task._id}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const response = await axios.post(
                `${baseUrl}/api/v1/task/${task._id}/createcomment`,
                { content: newComment.trim(), createdBy: user, createdAt: new Date() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const newCommentObj = response.data.comment;
            setComments(prev => [...prev, newCommentObj]);
            setNewComment('');
            onCommentAdded(comments.length + 1);
            showSuccess("Comment added successfully!");
        } catch (error) {
            console.error('Error adding comment:', error);
            setNewComment('');
            onCommentAdded(comments.length + 1);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            setDeletingId(commentId);
            await axios.delete(`${baseUrl}/api/v1/comment/deleteComment`, {
                data: { id: commentId },
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(prev => prev.filter(comment => comment._id !== commentId));
            showSuccess("Comment deleted successfully!");
        } catch (error) {
            console.error('Error deleting comment:', error);
            setComments(prev => prev.filter(comment => comment._id !== commentId));
        } finally {
            setDeletingId(null);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                            <h3 className="font-bold text-slate-900 text-base">Task Discussion</h3>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[260px] max-h-[380px] bg-slate-50/30">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id} className="bg-white rounded-xl p-3.5 border border-slate-200/70 shadow-2xs hover:border-slate-300 transition-colors group">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                        {(comment.createdBy?.name || user || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 text-xs">
                                                    {comment.createdBy?.name || user || 'Anonymous'}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                disabled={deletingId === comment._id}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer disabled:opacity-50"
                                                title="Delete comment"
                                            >
                                                {deletingId === comment._id ? (
                                                    <div className="w-3 h-3 border border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-slate-700 text-xs leading-relaxed break-words">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-2">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <p className="text-slate-700 font-semibold text-xs">No comments yet</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">Start the conversation with your team.</p>
                        </div>
                    )}
                </div>

                {/* Add Comment Form */}
                <div className="border-t border-slate-100 p-4 bg-white">
                    <div className="relative flex items-center">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Write a message... (Press Enter to send)"
                            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white resize-none"
                            rows="2"
                            disabled={submitting}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || submitting}
                            className="absolute right-2.5 bottom-2.5 p-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                            title="Send Comment"
                        >
                            {submitting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};