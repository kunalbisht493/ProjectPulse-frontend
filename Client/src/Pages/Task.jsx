import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { Plus, Calendar, User, BarChart3, Target, CheckCircle2, Clock, FolderKanban, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { showError } from "../Utils/Toast";
import CreateTask from "./CreateTask";
import TaskCard from "../Components/TaskCard";
import SortableTaskCard from "../Components/SortableTaskCard";
import Loader from "../Components/Loader";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Optimized Droppable Column Component
function DroppableColumn({ id, title, status, tasks, color, dotColor, badgeBg, onAddTask, setTasks, userRole }) {
    const { isOver, setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div
            className={`bg-slate-100/75 backdrop-blur-md rounded-2xl border border-slate-200/80 flex flex-col transition-all duration-200 ${
                isOver ? 'ring-2 ring-indigo-400 bg-indigo-50/40 border-indigo-300' : ''
            }`}
        >
            {/* Column Header */}
            <div className="p-4 border-b border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${status === 'inprogress' ? 'animate-pulse' : ''}`}></span>
                    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeBg}`}>
                        {tasks.length}
                    </span>
                </div>

                {(userRole === 'manager' || userRole === 'admin') && (
                    <button
                        onClick={onAddTask}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200/70 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title={`Add task to ${title}`}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Droppable Area */}
            <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`p-3 space-y-2.5 min-h-[420px] flex-1 flex flex-col transition-colors duration-200 ${
                        isOver ? 'bg-indigo-50/20' : ''
                    }`}
                    data-status={status}
                >
                    {tasks.map(task => (
                        <SortableTaskCard setTasks={setTasks} key={task._id} task={task} />
                    ))}

                    {tasks.length === 0 && (
                        <div className={`flex-1 flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl ${
                            isOver ? 'border-indigo-400 bg-indigo-50/40 text-indigo-600' : 'border-slate-300/80 text-slate-400'
                        } text-xs text-center transition-all duration-200`}>
                            <p className="font-medium">
                                {status === 'todo' ? 'No tasks yet' :
                                    status === 'inprogress' ? 'No tasks in progress' :
                                        'No completed tasks'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Drag tasks here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

function Task() {
    const { projectDetails, currentProject, setProjectDetails, setCurrentProject, taskChanged, setTaskChanged, showCreateTask, setShowCreateTask, setTaskColumn } = useContext(AppContext);
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_API_URL;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch user role from API
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const res = await axios.get(`${baseUrl}/api/v1/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserRole(res.data.user.role);
            } catch (error) {
                console.error("Failed to fetch user role:", error);
            }
        };
        if (token) {
            fetchUserRole();
        }
    }, [token]);

    // Get current project by ID from URL
    useEffect(() => {
        const fetchProject = async () => {
            if (projectDetails && projectDetails.length > 0) {
                const project = projectDetails.find(p => p._id === projectId);
                setCurrentProject(project);
            } else {
                try {
                    const res = await axios.get(`${baseUrl}/api/v1/project/getproject/${projectId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setCurrentProject(res.data.project);
                } catch (error) {
                    showError(error.response?.data?.message || "Failed to load project.");
                }
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId, projectDetails, token]);

    // Fetch tasks for this project
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get(`${baseUrl}/api/v1/project/task/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTasks(res.data.tasks || []);
            } catch (err) {
                showError(err.response?.data?.message || "Something went wrong");
            }
        };

        if (projectId) {
            fetchTasks();
        }
    }, [projectId, token, taskChanged]);

    const handleCreateTask = (status) => {
        setTaskColumn(status);
        setShowCreateTask(true);
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        const task = tasks.find(task => task._id === active.id);
        setActiveTask(task);
    };

    const handleDragOver = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        const activeTask = tasks.find(task => task._id === activeId);
        if (!activeTask) return;

        let targetStatus;
        if (['todo', 'inprogress', 'completed'].includes(overId)) {
            targetStatus = overId;
        } else {
            const overTask = tasks.find(task => task._id === overId);
            if (overTask) {
                targetStatus = overTask.status;
            }
        }

        if (!targetStatus || activeTask.status === targetStatus) return;
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveId(null);
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        const activeTask = tasks.find(task => task._id === activeId);
        if (!activeTask) return;

        let finalStatus;
        if (['todo', 'inprogress', 'completed'].includes(overId)) {
            finalStatus = overId;
        } else {
            const overTask = tasks.find(task => task._id === overId);
            if (overTask) {
                finalStatus = overTask.status;
            }
        }

        if (finalStatus && activeTask.status !== finalStatus) {
            await updateTaskStatus(activeId, finalStatus);
        }

        if (finalStatus === activeTask.status && activeId !== overId) {
            setTasks(prevTasks => {
                const activeIndex = prevTasks.findIndex(task => task._id === activeId);
                const overIndex = prevTasks.findIndex(task => task._id === overId);

                if (activeIndex !== -1 && overIndex !== -1) {
                    return arrayMove(prevTasks, activeIndex, overIndex);
                }
                return prevTasks;
            });
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            setTasks(prevTasks => {
                return prevTasks.map(task =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                );
            });

            await axios.put(
                `${baseUrl}/api/v1/project/taskupdate/${taskId}`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
        } catch (error) {
            showError(error.response?.data?.message || "Failed to update task status");
            setTasks(prevTasks => {
                return prevTasks.map(task =>
                    task._id === taskId ? { ...task, status: task.status } : task
                );
            });
        }
    };

    // Calculate task statistics
    const totalTasks = tasks.length;
    const todoTasks = getTasksByStatus('todo').length;
    const inProgressTasks = getTasksByStatus('inprogress').length;
    const completedTasks = getTasksByStatus('completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (!currentProject) {
        return <Loader />;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Project Header Banner */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                    {/* Top Row: Back button, Name, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <button
                                onClick={() => navigate('/project')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-1 cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Projects</span>
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {currentProject.name}
                            </h1>
                            {currentProject.description && (
                                <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                    {currentProject.description}
                                </p>
                            )}
                        </div>

                        {/* Project Manager and Deadline Pills */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/70 text-xs font-medium">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase leading-none">Deadline</span>
                                    <span className="font-semibold text-slate-800">
                                        {new Date(currentProject.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/70 text-xs font-medium">
                                <User className="w-4 h-4 text-emerald-500" />
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase leading-none">Manager</span>
                                    <span className="font-semibold text-slate-800">
                                        {currentProject.ProjectManager?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar & KPI metrics */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                            <span className="text-xs text-slate-400 font-medium block">Total Tasks</span>
                            <span className="text-lg sm:text-xl font-bold text-slate-800">{totalTasks}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                            <span className="text-xs text-slate-400 font-medium block">To Do</span>
                            <span className="text-lg sm:text-xl font-bold text-slate-700">{todoTasks}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                            <span className="text-xs text-blue-500 font-medium block">In Progress</span>
                            <span className="text-lg sm:text-xl font-bold text-blue-700">{inProgressTasks}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                            <span className="text-xs text-emerald-500 font-medium block">Completed</span>
                            <span className="text-lg sm:text-xl font-bold text-emerald-700">{completedTasks}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>Project Completion</span>
                            <span className="text-indigo-600">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Add Task Button for Managers/Admins */}
                {(userRole === 'manager' || userRole === 'admin') && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleCreateTask('todo')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Add New Task</span>
                        </button>
                    </div>
                )}

                {/* Kanban Board Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <DroppableColumn
                        id="todo"
                        title="To Do"
                        status="todo"
                        tasks={getTasksByStatus('todo')}
                        dotColor="bg-slate-400"
                        badgeBg="bg-slate-200 text-slate-700"
                        setTasks={setTasks}
                        userRole={userRole}
                        onAddTask={() => handleCreateTask('todo')}
                    />

                    <DroppableColumn
                        id="inprogress"
                        title="In Progress"
                        status="inprogress"
                        tasks={getTasksByStatus('inprogress')}
                        dotColor="bg-blue-500"
                        badgeBg="bg-blue-100 text-blue-700"
                        setTasks={setTasks}
                        userRole={userRole}
                        onAddTask={() => handleCreateTask('inprogress')}
                    />

                    <DroppableColumn
                        id="completed"
                        title="Completed"
                        status="completed"
                        tasks={getTasksByStatus('completed')}
                        dotColor="bg-emerald-500"
                        badgeBg="bg-emerald-100 text-emerald-700"
                        setTasks={setTasks}
                        userRole={userRole}
                        onAddTask={() => handleCreateTask('completed')}
                    />
                </div>

                {/* Create Task Modal */}
                {showCreateTask && <CreateTask />}

                {/* Drag Overlay for smooth dragging preview */}
                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-95 transform rotate-2 scale-105 shadow-2xl">
                            <TaskCard task={activeTask} setTasks={setTasks} isDragOverlay={true} />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}

export default Task;