import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { Plus, Calendar, User } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { showError } from "../Utils/Toast";
import CreateTask from "./CreateTask";
import TaskCard from "../Components/TaskCard";
import SortableTaskCard from "../Components/SortableTaskCard";
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
function DroppableColumn({ id, title, status, tasks, color, dotColor, bgGradient, headerGradient, borderColor, onAddTask, setTasks }) {
    const { isOver, setNodeRef } = useDroppable({
        id: status,
    });


    return (
        <div
            className={`${bgGradient} rounded-2xl border ${borderColor} overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 ${isOver ? 'ring-2 ring-blue-400/40' : ''}`}
            style={{
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: isOver ? 'transform' : 'auto'
            }}
        >
            <div className={`${headerGradient} p-4 border-b ${borderColor.replace('border-', 'border-b-')} relative`}>
                <h3 className={`font-semibold ${color} flex items-center justify-between`}>
                    <span className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${dotColor} rounded-full shadow-sm ${status === 'inprogress' ? 'animate-pulse' : ''} relative`}>
                            {status === 'inprogress' && (
                                <div className={`absolute inset-0 ${dotColor} rounded-full animate-ping opacity-40`}></div>
                            )}
                        </div>
                        {title}
                    </span>
                    <span className={`${color.includes('slate') ? 'bg-slate-200/90 text-slate-700' :
                        color.includes('blue') ? 'bg-blue-200/90 text-blue-700' :
                            'bg-emerald-200/90 text-emerald-700'
                        } text-xs px-3 py-1.5 rounded-full font-medium shadow-sm border border-white/20`}>
                        {tasks.length}
                    </span>
                </h3>
            </div>

            <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`p-4 space-y-3 min-h-[420px] transition-colors duration-200 ${isOver ? 'bg-blue-50/30' : ''}`}
                    data-status={status}
                >
                    {tasks.map(task => (
                        <SortableTaskCard setTasks={setTasks} key={task._id} task={task} />
                    ))}

                    {tasks.length === 0 && (
                        <div className={`flex flex-col items-center justify-center py-16 ${color.includes('slate') ? 'text-slate-400' :
                            color.includes('blue') ? 'text-blue-400' :
                                'text-emerald-400'
                            } text-sm transition-all duration-200 ${isOver ? 'text-blue-600 scale-105' : ''}`}>
                            <div className="text-center">
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${color.includes('slate') ? 'bg-slate-100' :
                                    color.includes('blue') ? 'bg-blue-100' :
                                        'bg-emerald-100'
                                    } transition-transform duration-200 ${isOver ? 'scale-110' : ''}`}>
                                    <Plus size={20} className={`${color.includes('slate') ? 'text-slate-400' :
                                        color.includes('blue') ? 'text-blue-400' :
                                            'text-emerald-400'
                                        } transition-colors duration-200 ${isOver ? 'text-blue-600' : ''}`} />
                                </div>
                                <div className="font-medium">
                                    {status === 'todo' ? 'Drop tasks here or click "Add New Task"' :
                                        status === 'inprogress' ? 'Drag tasks here to start working' :
                                            'Drag completed tasks here'}
                                </div>
                            </div>
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
                console.error("Failed to fetch user role:", error)
            }
        }
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
                setTasks(res.data.tasks);
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


    if (!currentProject) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading project details...</p>
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="h-screen pt-20 bg-gradient-to-br overflow-y-auto scroll-smooth hide-scrollbar from-slate-50 via-blue-50/30 to-indigo-50/30 relative">
                {/* Simplified Background Elements - Fixed positioning */}
                <div className="fixed inset-0 pointer-events-none opacity-60">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-indigo-200/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/10 to-purple-200/8 rounded-full blur-3xl"></div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 p-6">
                    {/* Optimized Header */}
                    <div className="mb-8">
                        <div className="mb-6">
                            <div className="bg-white/80 rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-200 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                                        {currentProject.name}
                                    </h1>
                                    <p className="text-gray-600 mb-4 text-lg">
                                        {currentProject.description || "No description available"}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm flex-wrap">
                                        <div className="flex items-center gap-3 bg-white/90 rounded-xl px-5 py-3 border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow duration-150">
                                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                                <Calendar size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-xs">Deadline</span>
                                                <span className="font-semibold text-blue-700 text-sm">
                                                    {new Date(currentProject.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/90 rounded-xl px-5 py-3 border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow duration-150">
                                            <div className="p-1.5 bg-emerald-100 rounded-lg">
                                                <User size={16} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-xs">Manager</span>
                                                <span className="font-semibold text-emerald-700 text-sm">
                                                    {currentProject.ProjectManager?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Optimized Add Task Button */}
                    {(userRole == 'manager' || userRole == 'admin') && <div className="mb-8 flex justify-start">
                        <button
                            onClick={() => handleCreateTask('todo')}
                            className="bg-white/90 hover:bg-white border border-slate-200/60 hover:border-slate-300/80 rounded-xl px-6 py-4 transition-all duration-150 shadow-lg hover:shadow-xl relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 text-slate-600 hover:text-slate-800">
                                <div className="bg-slate-100 hover:bg-slate-200 rounded-xl p-2 transition-colors duration-150 shadow-sm">
                                    <Plus size={18} />
                                </div>
                                <span className="text-sm font-semibold">Add New Task</span>
                            </div>
                        </button>
                    </div>}


                    {/* Optimized Kanban Board */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <DroppableColumn
                            id="todo"
                            title="Todo"
                            status="todo"
                            tasks={getTasksByStatus('todo')}
                            color="text-slate-800"
                            dotColor="bg-slate-500"
                            bgGradient="bg-white/80"
                            headerGradient="bg-slate-50/80"
                            borderColor="border-slate-200/60"
                            setTasks={setTasks}
                            onAddTask={() => handleCreateTask('todo')}
                        />

                        <DroppableColumn
                            id="inprogress"
                            title="In Progress"
                            status="inprogress"
                            tasks={getTasksByStatus('inprogress')}
                            color="text-blue-900"
                            dotColor="bg-blue-500"
                            bgGradient="bg-white/80"
                            headerGradient="bg-blue-50/80"
                            borderColor="border-blue-200/60"
                            setTasks={setTasks}
                            onAddTask={() => handleCreateTask('inprogress')}
                        />

                        <DroppableColumn
                            id="completed"
                            title="Completed"
                            status="completed"
                            tasks={getTasksByStatus('completed')}
                            color="text-emerald-900"
                            dotColor="bg-emerald-500"
                            bgGradient="bg-white/80"
                            headerGradient="bg-emerald-50/80"
                            borderColor="border-emerald-200/60"
                            setTasks={setTasks}
                            onAddTask={() => handleCreateTask('completed')}
                        />
                    </div>
                </div>

                {/* Create Task Modal */}
                {showCreateTask && <CreateTask />}

                {/* Optimized Drag Overlay */}
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