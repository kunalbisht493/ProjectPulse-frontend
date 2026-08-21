import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { Trash2, Plus, Calendar, User, FolderKanban, Clock, ArrowUpRight } from "lucide-react";
import CreateProject from "./CreateProject";
import { showError, showSuccess } from "../Utils/Toast";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";

function Project() {
    const { projectDetails, setProjectDetails, showModal, setShowModal, showUpdate, setShowUpdate } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user profile to get role
                const userRes = await axios.get(`${baseUrl}/api/v1/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserRole(userRes.data.user.role);

                // Fetch projects
                const projectRes = await axios.get(`${baseUrl}/api/v1/project/getprojects`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProjectDetails(projectRes.data.projects || []);

                setLoading(false);
            } catch (err) {
                showError(err.response?.data?.message || 'Error fetching data');
                setLoading(false);
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token, setProjectDetails, navigate]);

    // TEMP DELETE A PROJECT - Only allow managers and admins to delete
    const handleDelete = async (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();

        if (userRole !== 'manager' && userRole !== 'admin') {
            showError('Only managers and admins can delete projects');
            return;
        }

        try {
            const res = await axios.put(`${baseUrl}/api/v1/project/${projectId}/softdelete`, {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setProjectDetails(prevProjects => prevProjects.filter(project => project._id !== projectId));
            showSuccess(res.data.message);
        } catch (err) {
            showError(err.response?.data?.message || 'unable to move to trash');
        }
    };

    // Close modal and reset editing state
    const handleCloseModal = () => {
        setShowModal(false);
        setShowUpdate(false);
    };

    // Format deadline with status indicator
    const getDeadlineStatus = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
            return { status: 'Overdue', dot: 'bg-rose-500', color: 'text-rose-700 bg-rose-50 border-rose-200/80' };
        } else if (daysUntil <= 3) {
            return { status: 'Due Soon', dot: 'bg-amber-500', color: 'text-amber-700 bg-amber-50 border-amber-200/80' };
        } else if (daysUntil <= 7) {
            return { status: 'This Week', dot: 'bg-indigo-500', color: 'text-indigo-700 bg-indigo-50 border-indigo-200/80' };
        } else {
            return { status: 'On Track', dot: 'bg-emerald-500', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80' };
        }
    };

    // If loading, show a loader
    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FolderKanban className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                            {projectDetails.length}
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm">
                        {(userRole === 'manager' || userRole === 'admin') ? 'Coordinate deliverables, team members, and timelines.' : 'View your active assigned projects.'}
                    </p>
                </div>

                {/* Only show Create Project button for managers and admins */}
                {(userRole === 'manager' || userRole === 'admin') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>New Project</span>
                    </button>
                )}
            </div>

            {/* Desktop Table Header - Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100/70 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Project Name</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Created</div>
                <div className="col-span-2 text-center">Deadline</div>
                <div className="col-span-2 text-right">Manager {(userRole === 'manager' || userRole === 'admin') && "& Actions"}</div>
            </div>

            {/* Projects List */}
            <div className="space-y-3">
                {projectDetails.length > 0 ? (
                    projectDetails.map((project) => {
                        const deadlineStatus = getDeadlineStatus(project.deadline);
                        return (
                            <div
                                key={project._id}
                                className="group bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all duration-200"
                            >
                                <NavLink to={`/task/${project._id}`} className="block p-4 sm:p-5">
                                    {/* Desktop Row */}
                                    <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-violet-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                                                {project.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1 truncate text-sm">
                                                    <span>{project.name}</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                {project.description && (
                                                    <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xs">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${deadlineStatus.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${deadlineStatus.dot}`}></span>
                                                {deadlineStatus.status}
                                            </span>
                                        </div>

                                        <div className="col-span-2 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>

                                        <div className="col-span-2 text-center text-xs text-slate-600 font-medium flex items-center justify-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>{new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-end gap-3">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60 max-w-[140px] truncate">
                                                <User className="w-3 h-3 text-slate-500 shrink-0" />
                                                <span className="truncate">{project.ProjectManager?.name || 'Unassigned'}</span>
                                            </div>

                                            {(userRole === 'manager' || userRole === 'admin') && (
                                                <button
                                                    onClick={(e) => handleDelete(e, project._id)}
                                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 flex items-center justify-center transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                                                    title="Move to trash"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile Card */}
                                    <div className="lg:hidden space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                                                    {project.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm truncate">
                                                        {project.name}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${deadlineStatus.color}`}>
                                                        <span className={`w-1 h-1 rounded-full ${deadlineStatus.dot}`}></span>
                                                        {deadlineStatus.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {(userRole === 'manager' || userRole === 'admin') && (
                                                <button
                                                    onClick={(e) => handleDelete(e, project._id)}
                                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer"
                                                    title="Move to trash"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>{new Date(project.deadline).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{project.ProjectManager?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </NavLink>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 p-8">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                            <FolderKanban className="w-7 h-7" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No Projects Found</h3>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-5">
                            {(userRole === 'manager' || userRole === 'admin')
                                ? 'Create your first project to organize tasks and assign team members.'
                                : 'No projects have been assigned to you yet.'
                            }
                        </p>
                        {(userRole === 'manager' || userRole === 'admin') && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                                <span>Create Project</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals - Only show for managers and admins */}
            {(userRole === 'manager' || userRole === 'admin') && showModal && (
                <CreateProject
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default Project;