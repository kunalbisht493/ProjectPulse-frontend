import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  Users, FolderKanban, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Calendar, User, Search, Filter,
  Trash2, Plus, Target, BarChart3, Activity, Award,
  Briefcase, ArrowUpRight, ShieldCheck, Sparkles, Layers
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../Context/AppContext';
import { showError, showSuccess } from '../Utils/Toast';
import { NavLink } from 'react-router-dom';
import Loader from '../Components/Loader';

const Dashboard = () => {
  const { projectDetails, setProjectDetails, currentUser, setCurrentUser } = useContext(AppContext);
  const baseUrl = import.meta.env.VITE_API_URL;

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.user);
    } catch (error) {
      setCurrentUser({
        id: '1',
        name: 'Current User',
        email: 'user@example.com',
        role: 'admin'
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let userProjects = projectDetails;

      if (!projectDetails || projectDetails.length === 0) {
        const projectsRes = await axios.get(`${baseUrl}/api/v1/project/getprojects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        userProjects = projectsRes.data.projects || [];
        setProjectDetails(userProjects);
      }

      if (currentUser?.role !== 'admin') {
        userProjects = userProjects.filter(project =>
          project.assignedUsers?.includes(currentUser?.id) ||
          project.ProjectManager?.id === currentUser?.id ||
          project.ProjectManager?._id === currentUser?.id
        );
      }

      if (currentUser?.role === 'admin') {
        try {
          const usersRes = await axios.get(`${baseUrl}/api/v1/user/search`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(usersRes.data.users || []);
        } catch (error) {
          console.log("Users endpoint not available");
        }
      }

      const allTasks = [];
      for (const project of userProjects) {
        try {
          const tasksRes = await axios.get(`${baseUrl}/api/v1/project/task/${project._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          allTasks.push(...(tasksRes.data.tasks || []).map(task => ({
            ...task,
            projectId: project._id,
            projectName: project.name
          })));
        } catch (error) {
          console.log(`Error fetching tasks for project ${project._id}`);
        }
      }
      setTasks(allTasks);
      calculateStats(userProjects, allTasks);

    } catch (error) {
      showError(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, usersId) => {
    e.preventDefault();
    try {
      setLoading(true);
      const confirmDelete = window.confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) {
        setLoading(false);
        return;
      }

      await axios.delete(`${baseUrl}/api/v1/user/delete/${usersId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingUserId(usersId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== usersId && user.id !== usersId));
      showSuccess("User deleted successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      showError("Failed to delete user");
      setLoading(false);
    }
  };

  const calculateStats = (projectList, taskList) => {
    const now = new Date();

    const totalProjects = projectList.length;
    const activeProjects = projectList.filter(p => p.status === 'inprogress').length;
    const completedProjects = projectList.filter(p => p.status === 'completed').length;

    const totalTasks = taskList.length;
    const completedTasks = taskList.filter(t => t.status === 'completed').length;
    const inProgressTasks = taskList.filter(t => t.status === 'inprogress').length;
    const overdueTasks = projectList.filter(p =>
      new Date(p.deadline) < now && p.status !== 'completed'
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate
    });
  };

  const visibleProjects = useMemo(() => {
    if (!currentUser || !projectDetails) return [];

    if (currentUser.role === 'admin') {
      return projectDetails;
    }

    return projectDetails.filter(project =>
      project.assignedUsers?.includes(currentUser.id) ||
      project.ProjectManager?.id === currentUser.id ||
      project.ProjectManager?._id === currentUser.id
    );
  }, [currentUser, projectDetails]);

  const projectStatusData = useMemo(() => {
    return [
      { name: 'In Progress', value: visibleProjects.filter(p => p.status === 'inprogress').length, color: '#6366f1' },
      { name: 'Completed', value: visibleProjects.filter(p => p.status === 'completed').length, color: '#10b981' }
    ];
  }, [visibleProjects]);

  const taskProgressData = useMemo(() => {
    return visibleProjects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project._id);
      return {
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        inprogress: projectTasks.filter(t => t.status === 'inprogress').length,
        completed: projectTasks.filter(t => t.status === 'completed').length
      };
    });
  }, [visibleProjects, tasks]);

  useEffect(() => {
    if (visibleProjects.length > 0 || tasks.length > 0) {
      calculateStats(visibleProjects, tasks);
    }
  }, [visibleProjects, tasks]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgLight }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bgLight} flex items-center justify-center ${color} group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-0.5">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => {
    const projectTasks = useMemo(() =>
      tasks.filter(task => task.projectId === project._id),
      [tasks, project._id]
    );

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';

    const getStatusStyle = (status) => {
      switch (status) {
        case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        case 'inprogress': return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    };

    return (
      <NavLink
        to={`/task/${project._id}`}
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 group block"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">
              {project.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {project.description || "No description available"}
            </p>
          </div>
          {isOverdue && (
            <span className="p-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 shrink-0" title="Project is Overdue">
              <AlertCircle className="w-4 h-4" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(project.status)}`}>
            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Active'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Progress</span>
            <span className="text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{project.ProjectManager?.name || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{new Date(project.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </NavLink>
    );
  };

  if (loading) {
    return <Loader />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    ...(currentUser?.role === 'admin' ? [
      { id: 'users', label: 'Team Members' },
      { id: 'analytics', label: 'Analytics' }
    ] : [])
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentUser?.role === 'admin' ? 'Executive Dashboard' : 'Workspace Overview'}
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Welcome back, <span className="font-semibold text-slate-700">{currentUser?.name || 'User'}</span>! Here is your latest project pulse.
          </p>
        </div>

        {/* Tab Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Briefcase}
              title="Total Projects"
              value={stats.totalProjects}
              subtitle={`${stats.activeProjects} actively in progress`}
              color="text-indigo-600"
              bgLight="bg-indigo-50"
            />
            <StatCard
              icon={Layers}
              title="Active Tasks"
              value={stats.inProgressTasks}
              subtitle={`${stats.totalTasks} total tasks logged`}
              color="text-blue-600"
              bgLight="bg-blue-50"
            />
            <StatCard
              icon={CheckCircle2}
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              subtitle={`${stats.completedTasks} completed deliverables`}
              color="text-emerald-600"
              bgLight="bg-emerald-50"
            />
            <StatCard
              icon={AlertCircle}
              title="Overdue"
              value={stats.overdueTasks}
              subtitle="Requires immediate review"
              color="text-rose-600"
              bgLight="bg-rose-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Pie */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-600" />
                <span>Project Status Breakdown</span>
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Progress Bar Chart */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Task Distribution by Project</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="inprogress" stackId="a" fill="#6366f1" name="In Progress" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Projects</h3>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleProjects.slice(0, 3).map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">All Workspace Projects</h2>
            <span className="text-xs text-slate-500 font-medium">{visibleProjects.length} total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProjects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Users Tab (Admin Only) */}
      {activeTab === 'users' && currentUser?.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Team Members & Permissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage user access and assigned roles across the workspace</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {users.length} Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => {
                  const isCurrentUser = user._id === currentUser?._id || user.id === currentUser?.id;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-sm">{user.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : user.role === 'manager'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.role !== 'admin' && (
                          <button
                            onClick={(e) => handleDelete(e, user._id || user.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-all cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab (Admin Only) */}
      {activeTab === 'analytics' && currentUser?.role === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Performance & Velocity</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Task Completion</span>
                    <span className="text-emerald-600">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>On-Time Milestone Rate</span>
                    <span className="text-indigo-600">
                      {stats.totalProjects > 0 ? Math.round(((stats.totalProjects - stats.overdueTasks) / stats.totalProjects) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalProjects > 0 ? ((stats.totalProjects - stats.overdueTasks) / stats.totalProjects) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Upcoming Milestones</span>
              </h3>

              <div className="space-y-2">
                {visibleProjects.slice(0, 4).map((project) => {
                  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';
                  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={project._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="min-w-0 pr-3">
                        <h4 className="font-semibold text-slate-800 truncate">{project.name}</h4>
                        <span className="text-[11px] text-slate-400">
                          {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


