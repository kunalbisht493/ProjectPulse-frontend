import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../Utils/Toast";
import axios from "axios";
import { Trash2, RotateCcw, Clock, User, AlertTriangle } from "lucide-react";
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
                setTrashProject(res.data.projects || []);
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

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header Banner */}
            <div className="bg-white/80 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Trash & Archival
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            Manage soft-deleted projects. Restore to active workspace or delete permanently.
                        </p>
                    </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-700 w-fit">
                    <span>Trashed Projects: </span>
                    <span className="text-rose-600 font-bold ml-1">{trashProject?.length || 0}</span>
                </div>
            </div>

            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100/70 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Project Name</div>
                <div className="col-span-3 text-center">Deadline</div>
                <div className="col-span-3 text-center">Manager</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Deleted Projects List */}
            <div className="space-y-3">
                {trashProject && trashProject.length > 0 ? (
                    trashProject.map((project, index) => (
                        <div
                            key={project._id || index}
                            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all"
                        >
                            {/* Desktop Row */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                                        {(project.name || 'P').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-800 text-sm truncate">
                                            {project.name || 'Unnamed Project'}
                                        </div>
                                        <span className="text-xs text-rose-500 font-medium">Archived in trash</span>
                                    </div>
                                </div>

                                <div className="col-span-3 text-center">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                                    </span>
                                </div>

                                <div className="col-span-3 text-center">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        {project.ProjectManager?.name || project.manager || 'N/A'}
                                    </span>
                                </div>

                                <div className="col-span-2 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleRecover(project._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200/80 transition-colors cursor-pointer"
                                        title="Restore project"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Restore</span>
                                    </button>

                                    <button
                                        onClick={() => handlePermanentDelete(project._id)}
                                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-colors cursor-pointer"
                                        title="Permanently delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="lg:hidden space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                                            {(project.name || 'P').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                                                {project.name || 'Unnamed Project'}
                                            </h3>
                                            <span className="text-[11px] text-rose-500 font-medium">In trash</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleRecover(project._id)}
                                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                                            title="Restore project"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handlePermanentDelete(project._id)}
                                            className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                                            title="Permanently delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate">{project.ProjectManager?.name || project.manager || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                            <Trash2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">Trash is Empty</h3>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto">
                            No deleted or archived projects found in your workspace.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrashProject;