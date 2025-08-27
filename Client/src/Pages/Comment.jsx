import { MessageCircle, X, Send, User, Trash2 } from 'lucide-react';
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
    const baseUrl = process.env.REACT_APP_API_URL;

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
            console.log("Fetched comments:", response.data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            // If endpoint doesn't exist yet, use empty array
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

            // API call to delete comment
            await axios.delete(`${baseUrl}/api/v1/comment/deleteComment`, {
                data: { id: commentId },
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove comment from local state
            setComments(prev => prev.filter(comment => comment._id !== commentId));
            showSuccess("Comment deleted successfully!");

        } catch (error) {
            console.error('Error deleting comment:', error);
            // For now, still remove from UI even if API fails
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
        <div className="relative inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Comments</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] max-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id} className="bg-gray-50/80 rounded-xl p-4 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User size={16} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800 text-sm">
                                                    {comment.createdBy?.name || user || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-gray-500">
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
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                                title="Delete comment"
                                            >
                                                {deletingId === comment._id ? (
                                                    <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed break-words">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No comments yet</p>
                            <p className="text-gray-400 text-sm">Be the first to leave a comment!</p>
                        </div>
                    )}
                </div>

                {/* Add Comment Form */}
                <div className="border-t border-gray-200 p-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Write a comment... (Press Enter to send, Shift+Enter for new line)"
                                className="w-full p-4 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 hover:bg-white transition-colors"
                                rows="3"
                                disabled={submitting}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || submitting}
                                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Send size={16} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};