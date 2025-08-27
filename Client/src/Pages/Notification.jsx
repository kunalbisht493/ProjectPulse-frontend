
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
    Bell,
    BellRing,
    User,
    MessageSquare,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    FileText,
    Calendar
} from "lucide-react";


const baseUrl = import.meta.env.VITE_API_URL;
const socket = io(`${baseUrl}`);

export default function Notification() {
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const userId = decoded ? decoded.userId : null;
    
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseUrl}/api/v1/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (e,notificationId) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${baseUrl}/api/v1/notifications/markasread`, {id:notificationId}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications(prevNotifs => prevNotifs.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
        } 
        catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }
    const handleDelete = async (e,notificationId) => {
        e.preventDefault();
        try{
            const res = await axios.delete(`http://localhost:4000/api/v1/notifications/delete/`, {
                data: {id:notificationId},
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Update local state
            setNotifications(prevNotifs => prevNotifs.filter(n => n._id !== notificationId));

        }catch(error){
            console.error("Error deleting notification:", error);
        }

    }


    useEffect(() => {
        if (userId) {
            socket.emit('join', userId);
            console.log(`Joined room for userId: ${userId}`);
            fetchNotifications();
        }

        // Listen for real-time notifications
        socket.on('taskAssigned', (data) => {
            console.log("Received taskAssigned event:", data);
            fetchNotifications();
        });

        socket.on('newComment', (data) => {
            console.log("Received newComment event:", data);
            fetchNotifications();
        });

        socket.on('taskStatusUpdate', (data) => {
            console.log("Received taskStatusUpdate event:", data);
            fetchNotifications();
        });

        return () => {
            socket.off('taskAssigned');
            socket.off('newComment');
            socket.off('taskStatusUpdate');
        };
    }, [userId]);

    // Filter notifications based on selected filter
    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.isRead;
        if (filter === 'read') return notif.isRead;
        return true; // 'all'
    });

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'task_assigned':
                return <UserCheck className="text-blue-500" size={20} />;
            case 'comment_added':
                return <MessageSquare className="text-green-500" size={20} />;
            case 'task_completed':
                return <CheckCircle2 className="text-emerald-500" size={20} />;
            case 'task_updated':
                return <FileText className="text-orange-500" size={20} />;
            case 'deadline_reminder':
                return <AlertCircle className="text-red-500" size={20} />;
            default:
                return <Bell className="text-gray-500" size={20} />;
        }
    };

    // Format notification message
    const formatNotificationMessage = (notification) => {
        // If the notification has a direct message field, use it
        if (notification.message) {
            // Parse the message to extract task name and create formatted display
            const message = notification.message;

            // Check if it's a task assignment message
            if (message.includes("You've been assigned a new task:")) {
                const taskMatch = message.match(/You've been assigned a new task: (.+)$/);
                const taskName = taskMatch ? taskMatch[1] : '';

                return (
                    <div>
                        <span className="font-medium">You've been assigned a new task:</span>
                        <span className="text-blue-600 font-semibold ml-1">"{taskName}"</span>
                    </div>
                );
            }

            // Check for comment messages
            if (message.includes("commented on your task")) {
                return (
                    <div>
                        <span className="text-gray-800">{message}</span>
                    </div>
                );
            }

            // Check for task completion messages
            if (message.includes("completed")) {
                return (
                    <div>
                        <span className="text-emerald-600 font-medium">{message}</span>
                    </div>
                );
            }

            // Default: just display the message
            return (
                <div>
                    <span className="text-gray-800">{message}</span>
                </div>
            );
        }

        // Fallback to old structure if no message field
        const { type, data } = notification;

        switch (type) {
            case 'task_assigned':
                return (
                    <div>
                        <span className="font-medium">You were assigned to task:</span>
                        <span className="text-blue-600 font-semibold ml-1">"{data?.taskName || 'Unknown Task'}"</span>
                    </div>
                );
            default:
                return <span>New notification</span>;
        }
    };

    // Get time ago format
    const getTimeAgo = (createdAt) => {
        const now = new Date();
        const notificationTime = new Date(createdAt);
        const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden pt-20">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-60">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-indigo-200/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/10 to-purple-200/8 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <BellRing className="text-blue-600" size={32} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            <p className="text-gray-600">
                                {notifications.length} total • {unreadCount} unread
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchNotifications}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <BellRing size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-white/20 inline-flex mb-6">
                    {[
                        { key: 'all', label: 'All', count: notifications.length },
                        { key: 'unread', label: 'Unread', count: unreadCount },
                        { key: 'read', label: 'Read', count: notifications.length - unreadCount }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${filter === tab.key
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
                            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                {filter === 'all' ? 'No notifications yet' :
                                    filter === 'unread' ? 'No unread notifications' :
                                        'No read notifications'}
                            </h3>
                            <p className="text-gray-500">
                                {filter === 'all'
                                    ? "You'll see notifications about task assignments and updates here."
                                    : `Switch to "${filter === 'unread' ? 'all' : 'unread'}" to see more notifications.`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 ${!notification.isRead ? 'ring-2 ring-blue-100 bg-blue-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Notification Icon */}
                                    <div className={`p-3 rounded-xl ${!notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                                        } flex-shrink-0`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="text-gray-800 mb-2">
                                                    {formatNotificationMessage(notification)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {getTimeAgo(notification.createdAt)}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <span className="flex items-center gap-1 text-blue-600">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1">
                                                {/* Mark as Read Button - Only show for unread notifications */}
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            handleMarkAsRead(e,notification._id)
                                                        }}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => {
                                                        handleDelete(e,notification._id)
                                                    }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete notification"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Time Display */}
                                            <div className="text-sm text-gray-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {getTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Load More Button (if you implement pagination) */}
                {filteredNotifications.length > 0 && (
                    <div className="text-center mt-8">
                        <p className="text-gray-500 text-sm">
                            Showing {filteredNotifications.length} of {notifications.length} notifications
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}






