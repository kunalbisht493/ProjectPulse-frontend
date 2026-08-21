import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../Context/AppContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../Utils/Toast";
import { X, CheckSquare, User, Calendar, AlertCircle } from "lucide-react";

function CreateTask() {
    const { taskColumn, createTasks, setCreateTasks, setTaskChanged, setShowCreateTask } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useParams();
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const baseUrl = import.meta.env.VITE_API_URL;

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search users with debouncing
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim() === "") {
                setSearchResults([]);
                setShowSuggestions(false);
                return;
            }

            setIsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${baseUrl}/api/v1/user/search`, {
                    params: { search: searchQuery },
                    headers: { Authorization: `Bearer ${token}` }
                });

                const allUsers = response.data.users || [];
                const filteredUsers = allUsers.filter(user => {
                    const userName = user.name || user.username || user.email || '';
                    return userName.toLowerCase().startsWith(searchQuery.toLowerCase());
                });

                setSearchResults(filteredUsers);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
                setShowSuggestions(false);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { description, dueDate, assignedTo, priority } = createTasks;
        const payload = {
            description,
            dueDate,
            assignedTo,
            priority,
            projectId
        };

        try {
            const res = await axios.post(`${baseUrl}/api/v1/project/${projectId}/createtask`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });

            setCreateTasks({ description: "", dueDate: "", assignedTo: "", priority: "" });
            setSearchQuery("");
            setSearchResults([]);
            setShowSuggestions(false);
            setTaskChanged(prev => !prev);
            setShowCreateTask(false);
            showSuccess(res.data.message);
        } catch (err) {
            console.error("Task creation failed:", err);
            showError(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleCancel = () => {
        setShowCreateTask(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCreateTasks({ ...createTasks, [name]: value });

        if (name === "assignedTo") {
            setSearchQuery(value);
        }
    };

    const handleUserSelect = (user) => {
        const userName = user.name || user.username || user.email;
        const userId = user.id || user._id;

        setCreateTasks({
            ...createTasks,
            assignedTo: userId
        });
        setSearchQuery(userName);
        setShowSuggestions(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-all duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-md w-full mx-auto relative overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base">New Task</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                                    {taskColumn}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Create and assign a deliverable</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Description Field */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Task Description
                        </label>
                        <textarea
                            name="description"
                            value={createTasks.description}
                            onChange={handleChange}
                            placeholder="What needs to be done?"
                            rows="2"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Due Date
                            </label>
                            <input
                                name="dueDate"
                                value={createTasks.dueDate}
                                onChange={handleChange}
                                type="date"
                                required
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 transition-all bg-slate-50/50 hover:bg-white"
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={createTasks.priority}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 transition-all bg-slate-50/50 hover:bg-white"
                            >
                                <option value="" disabled>Select priority</option>
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                    </div>

                    {/* Assigned To Field */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Assignee
                        </label>
                        <div className="relative">
                            <input
                                ref={searchRef}
                                name="assignedTo"
                                value={searchQuery}
                                onChange={handleChange}
                                placeholder="Search team member..."
                                type="text"
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white pr-8"
                                autoComplete="off"
                            />
                            {isLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent"></div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchResults.length > 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100"
                            >
                                {searchResults.map((user, index) => (
                                    <div
                                        key={user.id || user._id || index}
                                        onClick={() => handleUserSelect(user)}
                                        className="p-2.5 hover:bg-indigo-50/60 cursor-pointer transition-colors flex items-center justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-semibold text-slate-900 text-xs truncate">
                                                {user.name || user.username || 'Unknown User'}
                                            </div>
                                            {user.email && (
                                                <div className="text-[11px] text-slate-400 truncate">
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showSuggestions && searchQuery && !isLoading && searchResults.length === 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 text-slate-400 text-xs text-center"
                            >
                                No matching members
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTask;