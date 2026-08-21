import { MessageSquare, Trash2, GripVertical, Clock, User, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from '../Pages/Comment';

function TaskCard({ task, setTasks, dragHandleProps = {}, isDragging = false, isDragOverlay = false }) {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchCommentCount();
    }, [task._id]);

    const fetchCommentCount = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/task/${task._id}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCommentCount(response.data.comments?.length || 0);
        } catch (error) {
            setCommentCount(0);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await axios.delete(`${baseUrl}/api/v1/task/deletetask/${task._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTasks(prevTasks => prevTasks.filter(t => t._id !== task._id));
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const handleComment = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowCommentModal(true);
    };

    const handleCommentAdded = (newCount) => {
        setCommentCount(newCount);
    };

    const getPriorityStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-rose-50 text-rose-700 border-rose-200/80';
            case 'medium':
                return 'bg-amber-50 text-amber-700 border-amber-200/80';
            case 'low':
            default:
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        }
    };

    return (
        <>
            <div
                className={`bg-white rounded-xl p-3.5 sm:p-4 transition-all duration-200 border ${
                    isDragging
                        ? 'opacity-60 shadow-2xl scale-[1.03] border-indigo-400 bg-white ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-indigo-200/90 shadow-xs hover:shadow-md'
                } relative group cursor-pointer`}
            >
                {/* Drag Handle */}
                {!isDragOverlay && (
                    <div
                        {...dragHandleProps}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        aria-label="Drag task"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}

                <div className="pr-5">
                    <h4 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug text-sm line-clamp-3">
                        {task.description}
                    </h4>

                    {task.assignedTo && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{task.assignedTo?.name || task.assignedTo}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
                        {/* Priority & Due Date Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${getPriorityStyle(task.priority)}`}>
                                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'}
                            </span>

                            {task.dueDate && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleComment}
                                className="relative p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title={`${commentCount} Comments`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                {commentCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-xs">
                                        {commentCount > 9 ? '9+' : commentCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Task"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {isDragging && (
                    <div className="absolute inset-0 bg-indigo-50/20 rounded-xl border-2 border-dashed border-indigo-400/50 pointer-events-none" />
                )}
            </div>

            {/* Comment Modal */}
            <Comment
                isOpen={showCommentModal}
                onClose={() => setShowCommentModal(false)}
                task={task}
                onCommentAdded={handleCommentAdded}
            />
        </>
    );
}

export default TaskCard;