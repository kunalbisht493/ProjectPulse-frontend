
import { useState, useEffect, useContext, useRef } from "react";
import { showError, showSuccess } from "../Utils/Toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { X, FolderPlus, User, Calendar, FileText, Search, Check } from "lucide-react";

function CreateProject({ onClose }) {
    const { projectData, setProjectData } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const navigate = useNavigate();
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

    // Popup animation state
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    // Submitting project to backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, ProjectManager, deadline } = projectData;
        const payload = { name, description, ProjectManager, deadline };
        try {
            const URL = `${baseUrl}/api/v1/project/createproject`;
            const res = await axios.post(URL, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            showSuccess(res.data.message);
            setProjectData(res.data);
            setProjectData({ name: "", description: "", ProjectManager: "", deadline: "" });
            setSearchQuery("");
            setSearchResults([]);
            setShowSuggestions(false);
            navigate('/Project');
            onClose();
        } catch (err) {
            console.error("Project creation failed:", err);
            showError(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleInputChange = (e) => {
        if (e.target.name === "ProjectManager") {
            setSearchQuery(e.target.value);
        }
        setProjectData({ ...projectData, [e.target.name]: e.target.value });
    };

    const handleUserSelect = (user) => {
        const userName = user.name || user.username || user.email;
        const userId = user.id || user._id;

        setProjectData({
            ...projectData,
            ProjectManager: userId
        });
        setSearchQuery(userName);
        setShowSuggestions(false);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
            isVisible ? 'bg-slate-900/40 backdrop-blur-xs' : 'bg-slate-900/0'
        }`}>
            <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-xl w-full mx-auto relative overflow-hidden transition-all duration-200 ${
                isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FolderPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Create New Project</h2>
                            <p className="text-xs text-slate-500">Configure deliverables, milestone deadline, and lead manager</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Project Name
                        </label>
                        <input
                            name="name"
                            value={projectData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Q3 Mobile App Redesign"
                            type="text"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Project Manager Autocomplete */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Lead Manager
                            </label>
                            <div className="relative">
                                <input
                                    ref={searchRef}
                                    name="ProjectManager"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="Search manager..."
                                    type="text"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white pr-8"
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
                                    className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100"
                                >
                                    {searchResults.map((user, index) => (
                                        <div
                                            key={user.id || user._id || index}
                                            onClick={() => handleUserSelect(user)}
                                            className="p-2.5 hover:bg-indigo-50/60 cursor-pointer transition-colors flex items-center justify-between"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <div className="font-semibold text-slate-900 text-xs truncate">
                                                    {user.name || user.username || 'Unknown User'}
                                                </div>
                                                {user.email && (
                                                    <div className="text-[11px] text-slate-400 truncate">
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showSuggestions && searchQuery && !isLoading && searchResults.length === 0 && (
                                <div
                                    ref={suggestionsRef}
                                    className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-slate-400 text-xs text-center"
                                >
                                    No users found
                                </div>
                            )}
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Target Deadline
                            </label>
                            <input
                                name="deadline"
                                value={projectData.deadline}
                                onChange={handleInputChange}
                                type="date"
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900 transition-all bg-slate-50/50 hover:bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={projectData.description}
                            onChange={handleInputChange}
                            placeholder="Provide details about objectives and milestones..."
                            rows="3"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-white resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateProject;