import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../Context/AppContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../Utils/Toast";

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

                // Filter users to show only those whose names start with the typed letters
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

        // Debounce the search
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
        console.log("Payload for task creation:", payload);

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

        // Handle search input separately
        if (name === "assignedTo") {
            setSearchQuery(value);
            return;
        }
        setCreateTasks({ ...createTasks, [name]: value });
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Create Task in {taskColumn}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Description Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <input
                            name="description"
                            value={createTasks.description}
                            onChange={handleChange}
                            placeholder="Enter task description"
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                        />
                    </div>

                    {/* Due Date Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            name="dueDate"
                            value={createTasks.dueDate}
                            onChange={handleChange}
                            type="date"
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                        />
                    </div>

                    {/* Priority Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            name="priority"
                            value={createTasks.priority}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                        >
                            <option value="" disabled>Select priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Assigned To Field with Search Suggestions */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assigned To
                        </label>
                        <input
                            ref={searchRef}
                            name="assignedTo"
                            value={searchQuery}
                            onChange={handleChange}
                            placeholder="Search and select a user"
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                            autoComplete="off"
                        />

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="absolute right-3 top-12 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchResults.length > 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                            >
                                {searchResults.map((user, index) => (
                                    <div
                                        key={user.id || user._id || index}
                                        onClick={() => handleUserSelect(user)}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {user.name || user.username || 'Unknown User'}
                                        </div>
                                        {user.email && (
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        )}
                                        <div className="font-sm text-gray-500">{user.role}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No results message */}
                        {showSuggestions && searchQuery && !isLoading && searchResults.length === 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-gray-500 text-sm"
                            >
                                No users found
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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