
import { useState, useEffect, useContext, useRef } from "react";
import { showError, showSuccess } from "../Utils/Toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { Manager } from "socket.io-client";

function CreateProject({ onClose }) {
    const { projectData, setProjectData } = useContext(AppContext)
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_URL;

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
                console.log("All users from search:", allUsers);
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


    //FOR POPUP ANIMATION
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
            onClose();
        }, 300); // Reduced timeout to match animation duration
    };

    // SENDING RESPONSE TO BACKEND
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, description, ProjectManager, deadline } = projectData
        const payload = { name, description, ProjectManager, deadline }
        try {
            const URL = `${baseUrl}/api/v1/project/createproject`
            const res = await axios.post(URL, payload, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            showSuccess(res.data.message)
            console.log("Project created successfully:", res.data);
            setProjectData(res.data)
            setProjectData({ name: "", description: "", ProjectManager: "", deadline: "" })
            setSearchQuery("");
            setSearchResults([]);
            setShowSuggestions(false);
            navigate('/Project')
            onClose()
        } catch (err) {
            console.error("Project creation failed:", err);
            showError(err.response?.data?.message || "Something went wrong");
        }

    };

    const handleInputChange = (e) => {
        if (e.target.name === "ProjectManager") {
            setSearchQuery(e.target.value);
        }

        setProjectData({ ...projectData, [e.target.name]: e.target.value })
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
        <div className={`fixed inset-0 transition-all duration-300 ease-out flex items-center justify-center z-50 p-4 ${isVisible
            ? 'bg-black/50 backdrop-blur-sm'
            : 'bg-black/0 backdrop-blur-none'
            }`}>
            <div className={`bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/20 max-w-4xl w-full mx-auto relative transition-all duration-300 ease-out ${isVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
                }`}>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Project</h1>
                    <p className="text-gray-600 text-sm">Fill in the details below to start your project</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-left text-gray-700 mb-2">
                            Project Name
                        </label>
                        <input
                            name="name"
                            value={projectData.name}
                            onChange={handleInputChange}
                            placeholder="Enter project name"
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm text-left  font-medium text-gray-700 mb-2">
                            Manager Name
                        </label>
                        <input
                            ref={searchRef}
                            name="ProjectManager"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Enter manager name"
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
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


                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-left text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={projectData.description}
                            onChange={handleInputChange}
                            placeholder="Brief description of your project"
                            rows="2"
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 resize-none"
                        />

                    </div>

                    <div>
                        <label className="block text-sm font-medium text-left text-gray-700 mb-2">
                            Deadline
                        </label>
                        <input
                            name="deadline"
                            value={projectData.deadline}
                            onChange={handleInputChange}
                            type="date"
                            required
                            className="w-full p-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                        />
                    </div>

                    <div className="col-span-2 flex space-x-4 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            Create Project
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-gray-200/80 backdrop-blur-sm hover:bg-gray-300/80 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 border border-gray-300/50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateProject;