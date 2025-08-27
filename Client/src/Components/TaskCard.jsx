
import { MessageCircle, Trash, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from '../Pages/Comment';

// Enhanced TaskCard Component
function TaskCard({ task, setTasks, dragHandleProps = {}, isDragging = false, isDragOverlay = false }) {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL;

    // Fetch comment count on component mount
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
            // If endpoint doesn't exist, default to 0
            setCommentCount(0);
        }
    };

  
    const handleDelete = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const res = await axios.delete(`${baseUrl}/api/v1/task/deletetask/${task._id}`, {
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

    return (
        <>
            <div
                className={`bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm transition-all duration-200 border border-gray-200/50
                    ${isDragging ? 'opacity-50 shadow-xl scale-105 border-blue-300/70 bg-white/90 z-50' : 'hover:shadow-md hover:border-blue-200/50 hover:bg-white/90'}
                    relative group cursor-pointer`}
            >
                {/* Drag Handle (hidden in overlay) */}
                {!isDragOverlay && (
                    <div
                        {...dragHandleProps}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100/50"
                        aria-label="Drag task"
                    >
                        <GripVertical size={14} className="text-gray-400 hover:text-gray-600" />
                    </div>
                )}

                <div className="pr-6">
                    <h4 className="font-medium text-gray-800 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {task.description}
                    </h4>

                    {task.assignedTo && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            <span className="text-gray-500">Assigned to:</span> {task.assignedTo?.name || task.assignedTo}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs gap-2">
                        <span
                            className={`px-2.5 py-1 rounded-full font-medium ${task.priority === "high"
                                ? "bg-red-100/80 text-red-700 border border-red-200/50"
                                : task.priority === "medium"
                                    ? "bg-yellow-100/80 text-yellow-700 border border-yellow-200/50"
                                    : "bg-green-100/80 text-green-700 border border-green-200/50"
                                }`}
                        >
                            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                        </span>

                        {task.dueDate && (
                            <span className="text-gray-500 bg-gray-50/50 px-2 py-1 rounded border border-gray-200/30">
                                {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        )}

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center cursor-pointer justify-center w-8 h-8 rounded-full bg-red-50/50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 hover:scale-110 group-hover:shadow-md border border-red-100/50 hover:border-red-200"
                                title="Delete Task"
                            >
                                <Trash size={14} />
                            </button>

                            <button
                                onClick={handleComment}
                                className="inline-flex items-center cursor-pointer justify-center w-8 h-8 rounded-full bg-blue-50/50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 hover:scale-110 group-hover:shadow-md border border-blue-100/50 hover:border-blue-200 relative"
                                title={`${commentCount} Comments`}
                            >
                                <MessageCircle size={14} />
                                {commentCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium shadow-sm">
                                        {commentCount > 9 ? '9+' : commentCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dragging visual */}
                {isDragging && (
                    <div className="absolute inset-0 bg-blue-50/20 rounded-lg border-2 border-dashed border-blue-300/40 pointer-events-none" />
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