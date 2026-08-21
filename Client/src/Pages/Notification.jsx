import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
    Bell,
    BellRing,
    MessageSquare,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    FileText,
    FolderKanban,
    RotateCw,
    Trash2,
    Check
} from "lucide-react";
import Loader from "../Components/Loader";

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

    const handleMarkAsRead = async (e, notificationId) => {
        e.preventDefault();
        try {
            await axios.put(`${baseUrl}/api/v1/notifications/markasread`, { id: notificationId }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(prevNotifs => prevNotifs.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.preventDefault();
        try {
            await axios.delete(`${baseUrl}/api/v1/notifications/delete`, {
                data: { id: notificationId },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(prevNotifs => prevNotifs.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            socket.emit('join', userId);
            fetchNotifications();
        }

        socket.on('taskAssigned', () => {
            fetchNotifications();
        });

        socket.on('newComment', () => {
            fetchNotifications();
        });

        socket.on('taskStatusUpdate', () => {
            fetchNotifications();
        });

        return () => {
            socket.off('taskAssigned');
            socket.off('newComment');
            socket.off('taskStatusUpdate');
        };
    }, [userId]);

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.isRead;
        if (filter === 'read') return notif.isRead;
        return true;
    });

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'task_assigned':
                return { icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' };
            case 'comment_added':
                return { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' };
            case 'task_completed':
                return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' };
            case 'task_updated':
                return { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' };
            case 'deadline_reminder':
                return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' };
            default:
                return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
        }
    };

    const formatNotificationMessage = (notification) => {
        if (notification.message) {
            const message = notification.message;

            if (message.includes("You've been assigned a new task:")) {
                const taskMatch = message.match(/You've been assigned a new task: (.+)$/);
                const taskName = taskMatch ? taskMatch[1] : '';

                return (
                    <div>
                        <span className="text-slate-600 font-medium">You've been assigned a new task:</span>
                        <span className="text-indigo-600 font-semibold ml-1">"{taskName}"</span>
                    </div>
                );
            }

            if (message.includes("commented on your task")) {
                return <span className="text-slate-800 font-medium">{message}</span>;
            }

            if (message.includes("completed")) {
                return <span className="text-emerald-700 font-semibold">{message}</span>;
            }

            return <span className="text-slate-800">{message}</span>;
        }

        const { type, data } = notification;
        switch (type) {
            case 'task_assigned':
                return (
                    <div>
                        <span className="text-slate-600 font-medium">You were assigned to task:</span>
                        <span className="text-indigo-600 font-semibold ml-1">"{data?.taskName || 'Unknown Task'}"</span>
                    </div>
                );
            default:
                return <span className="text-slate-800">New notification</span>;
        }
    };

    const getProjectName = (notification) => {
        if (notification.data?.projectName) {
            return notification.data.projectName;
        } else if (notification.projectName) {
            return notification.projectName;
        }
        return null;
    };

    const getTimeAgo = (createdAt) => {
        const now = new Date();
        const notificationTime = new Date(createdAt);
        const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
            return `${diffInMinutes || 1}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            {/* Header Banner */}
            <div className="bg-white/80 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
                        <BellRing className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            {notifications.length} total alerts • {unreadCount} unread
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchNotifications}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer w-fit"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-fit">
                {[
                    { key: 'all', label: 'All', count: notifications.length },
                    { key: 'unread', label: 'Unread', count: unreadCount },
                    { key: 'read', label: 'Read', count: notifications.length - unreadCount }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            filter === tab.key
                                ? 'bg-white text-indigo-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                    >
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                filter === tab.key ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications Feed */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">
                            {filter === 'all' ? 'No notifications yet' :
                                filter === 'unread' ? 'No unread notifications' :
                                    'No read notifications'}
                        </h3>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto">
                            {filter === 'all'
                                ? "You'll see notifications about task assignments and comments here."
                                : `Switch to "${filter === 'unread' ? 'all' : 'unread'}" to see older alerts.`
                            }
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const iconData = getNotificationIcon(notification.type);
                        const IconComponent = iconData.icon;
                        const projectName = getProjectName(notification);

                        return (
                            <div
                                key={notification._id}
                                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-sm ${
                                    !notification.isRead
                                        ? 'border-indigo-200 bg-indigo-50/20'
                                        : 'border-slate-200/80 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    {/* Type Icon */}
                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconData.bg} ${iconData.color}`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="text-xs sm:text-sm">
                                                    {formatNotificationMessage(notification)}
                                                </div>

                                                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                                                    {projectName && (
                                                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                                                            <FolderKanban className="w-3 h-3 text-indigo-500" />
                                                            <span>{projectName}</span>
                                                        </div>
                                                    )}

                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {getTimeAgo(notification.createdAt)}
                                                    </span>

                                                    {!notification.isRead && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(e, notification._id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={(e) => handleDelete(e, notification._id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}