import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../Utils/Toast";
import axios from "axios";
import { Trash, ArchiveRestoreIcon } from "lucide-react";
import Loader from "../Components/Loader";

function TrashProject() {
    const { trashProject, setTrashProject, projectDetails, setProjectDetails } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const checkRoleAndFetchTrash = async () => {
            try {
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Check user role first
                const userRes = await axios.get(`${baseUrl}/api/v1/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const userRole = userRes.data.user.role;

                // Only allow managers and admins to access trash
                if (userRole !== 'manager' && userRole !== 'admin') {
                    showError('Access denied');
                    navigate('/project');
                    return;
                }

                // Fetch trashed projects
                const res = await axios.get(`${baseUrl}/api/v1/project/getTrashedProject`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setTrashProject(res.data.projects);
                setLoading(false);
            } catch (err) {
                console.log("Error in trash", err);
                showError(err.response?.data?.message || 'Error fetching data');
                navigate('/project');
            }
        };

        checkRoleAndFetchTrash();
    }, [token, navigate, setTrashProject]);

    // FOR RECOVERY
    const handleRecover = async (projectId) => {
        try {
            const res = await axios.put(`${baseUrl}/api/v1/project/${projectId}/restoreProject`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTrashProject(prevTrash => prevTrash.filter(trash => trash._id !== projectId));
            setProjectDetails(prev => [...prev, res.data.project]);
            showSuccess(res.data.message);
        } catch (err) {
            showError(err.response?.data?.message || 'unable to restore');
        }
    };

    // FOR PERMANENT DELETE
    const handlePermanentDelete = async (projectId) => {
        const confirmed = window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.");

        if (!confirmed) return;

        try {
            const res = await axios.delete(`${baseUrl}/api/v1/project/trash/deleteproject/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTrashProject(prevTrash => prevTrash.filter(trash => trash._id !== projectId));
            showSuccess(res.data.message);
        } catch (err) {
            showError(err.response?.data?.message || 'unable to delete');
        }
    };

    // If loading, show a loader
    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 relative overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-100/20 to-orange-100/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-100/15 to-red-100/15 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-red-200/10 to-orange-200/10 rounded-full blur-2xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">🗑️ Trash</h1>
                            <p className="text-gray-600">Manage deleted projects - recover or permanently delete</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-100/50">
                            <span className="text-sm text-gray-600">Trashed Projects: </span>
                            <span className="font-semibold text-red-600">{trashProject?.length || 0}</span>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-t-xl border border-gray-200/50 p-4">
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            <div className="flex-1 text-center">Project Name</div>
                            <div className="flex-1 text-center">Deadline</div>
                            <div className="flex-1 text-center">Manager</div>
                            <div className="flex-1 text-center">Actions</div>
                        </div>
                    </div>
                </div>

                {/* Deleted Projects List */}
                <div className="space-y-2">
                    {trashProject && trashProject.length > 0 ? (
                        trashProject.map((project, index) => (
                            <div
                                key={project._id || index}
                                className="group bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md rounded-lg border border-gray-200/50 hover:border-red-200/50 transition-all duration-300 hover:bg-white/90 transform hover:-translate-y-0.5"
                            >
                                <div className="flex items-center justify-between p-4">
                                    {/* Project Name */}
                                    <div className="flex-1 text-center">
                                        <div className="font-medium text-gray-800 group-hover:text-red-600 transition-colors duration-200">
                                            {project.name || 'Unnamed Project'}
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="flex-1 text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50/50 text-red-700 border border-red-100/50">
                                            📅 {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                                        </div>
                                    </div>

                                    {/* Manager */}
                                    <div className="flex-1 text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-50/50 text-orange-700 border border-orange-100/50">
                                            👤 {project.ProjectManager?.name || project.manager || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-1 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Recover Button */}
                                            <button
                                                onClick={() => handleRecover(project._id)}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50/50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all duration-200 hover:scale-110 group-hover:shadow-md border border-green-100/50 hover:border-green-200"
                                                title="Recover Project"
                                            >
                                                <ArchiveRestoreIcon size={16} />
                                            </button>

                                            {/* Permanent Delete Button */}
                                            <button
                                                onClick={() => handlePermanentDelete(project._id)}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50/50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:scale-110 group-hover:shadow-md border border-red-100/50 hover:border-red-200"
                                                title="Permanently Delete"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 max-w-md mx-auto">
                                <div className="text-6xl mb-4">🗑️</div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Trash is Empty</h3>
                                <p className="text-gray-500 text-sm">No deleted projects found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrashProject;