import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  Users, FolderOpen, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Calendar, User, Settings, Bell, Search,
  Filter, Download, Eye, Edit, Trash2, Plus, Target,
  Activity, Award, Briefcase
} from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../Context/AppContext';
import { showError, showSuccess } from '../Utils/Toast';
import { NavLink, useParams } from 'react-router-dom';
import Loader from '../Components/Loader';

const Dashboard = () => {
  // Get data from your existing context
  const { projectDetails, setProjectDetails, currentUser, setCurrentUser } = useContext(AppContext);
  const baseUrl = import.meta.env.VITE_API_URL;

  // State management
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

  // 1. Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 2. Fetch dashboard data once currentUser is available
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
      // If endpoint doesn't exist, create a mock user
      setCurrentUser({
        id: '1',
        name: 'Current User',
        email: 'user@example.com',
        role: 'admin' // or 'user'
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Use existing projects from context if available, otherwise fetch
      let userProjects = projectDetails;

      if (!projectDetails || projectDetails.length === 0) {
        const projectsRes = await axios.get(`${baseUrl}/api/v1/project/getprojects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        userProjects = projectsRes.data.projects || [];
        setProjectDetails(userProjects);
      }

      // Filter projects based on user role
      if (currentUser?.role !== 'admin') {
        // For regular users, show only projects they're assigned to or managing
        userProjects = userProjects.filter(project =>
          project.assignedUsers?.includes(currentUser?.id) ||
          project.ProjectManager?.id === currentUser?.id ||
          project.ProjectManager?._id === currentUser?.id
        );
      }

      // Fetch users (admin only)
      if (currentUser?.role === 'admin') {
        try {
          const usersRes = await axios.get(`${baseUrl}/api/v1/user/search`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(usersRes.data.users || []);
          console.log("Fetched users:", usersRes.data.users);
        } catch (error) {
          // Handle case where endpoint doesn't exist yet
          console.log("Users endpoint not available");
        }
      }

      // Fetch all tasks for visible projects
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

      // Calculate statistics
      calculateStats(userProjects, allTasks);

    } catch (error) {
      showError(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // DELETE USER FROM DATABASE
  const handleDelete = async (e,usersId) => {
    e.preventDefault();
    try{
      setLoading(true)
      const confirmDelete = window.confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) return;

      axios.delete(`${baseUrl}/api/v1/user/delete/${usersId}`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingUserId(usersId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== usersId && user.id !== usersId));
      setLoading(false)
    }catch (error) {
      console.error("Error deleting user:", error);
      showError("Failed to delete user");
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

  // Get projects visible to current user - MEMOIZED
  const visibleProjects = useMemo(() => {
    if (!currentUser || !projectDetails) return [];

    if (currentUser.role === 'admin') {
      return projectDetails;
    }

    // For regular users, show only projects they're assigned to or managing
    return projectDetails.filter(project =>
      project.assignedUsers?.includes(currentUser.id) ||
      project.ProjectManager?.id === currentUser.id ||
      project.ProjectManager?._id === currentUser.id
    );
  }, [currentUser, projectDetails]);

  // Chart data calculations - MEMOIZED
  const projectStatusData = useMemo(() => {
    return [
      { name: 'In Progress', value: visibleProjects.filter(p => p.status === 'inprogress').length, color: '#3b82f6' },
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

  // Recalculate stats whenever projects or tasks change
  useEffect(() => {
    if (visibleProjects.length > 0 || tasks.length > 0) {
      calculateStats(visibleProjects, tasks);
    }
  }, [visibleProjects, tasks]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color.replace('from-', 'bg-').replace('-500', '-100').replace(' to-', ' text-').replace('-600', '-600')}`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // Project Card Component - MEMOIZED calculations
  const ProjectCard = ({ project }) => {
    const projectTasks = useMemo(() =>
      tasks.filter(task => task.projectId === project._id),
      [tasks, project._id]
    );

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
        case 'inprogress': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    return (
      <NavLink to={`/task/${project._id}`} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {project.description || "No description available"}
            </p>
          </div>
          {isOverdue && (
            <div className="bg-red-100 text-red-600 p-2 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-600">
              📅 {new Date(project.deadline).toLocaleDateString()}
            </span>
            <span className="text-gray-600">
              👤 {project.ProjectManager?.name || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Target size={14} />
            <span>{totalTasks} tasks</span>
          </div>
        </div>
      </NavLink>
    );
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-60">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-indigo-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/10 to-purple-200/8 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                {currentUser?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back, {currentUser?.name || 'User'}! Here's your project overview.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-white/20 inline-flex">
            {['overview', 'projects', ...(currentUser?.role === 'admin' ? ['users', 'analytics'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Briefcase}
                title="Total Projects"
                value={stats.totalProjects}
                subtitle={`${stats.activeProjects} active`}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Activity}
                title="Active Tasks"
                value={stats.inProgressTasks}
                subtitle={`${stats.totalTasks} total tasks`}
                color="from-indigo-500 to-indigo-600"
              />
              <StatCard
                icon={CheckCircle}
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                subtitle={`${stats.completedTasks} completed`}
                color="from-green-500 to-green-600"
              />
              <StatCard
                icon={AlertTriangle}
                title="Overdue"
                value={stats.overdueTasks}
                subtitle="Projects past deadline"
                color="from-red-500 to-red-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Status Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Project Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Task Progress Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Task Progress by Project</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="todo" stackId="a" fill="#64748b" name="To Do" />
                    <Bar dataKey="inprogress" stackId="a" fill="#3b82f6" name="In Progress" />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Recent Projects</h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProjects.slice(0, 3).map(project => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">All Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProjects.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Users Tab (Admin Only) */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                Add User
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-9 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-4 px-9 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-8 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-4 px-9 font-semibold text-gray-700">Projects</th>
                      <th className="text-left py-4 px-7 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => {
                      const isCurrentUser = user._id === currentUser?._id || user.id === currentUser?.id;
                      const isDeleting = deletingUserId === user._id || deletingUserId === user.id;

                      return (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="font-medium text-blue-600">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">{user.name}</span>
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{user.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : user.role === 'manager'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{user.projectsCount || 0}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-yellow-100 rounded-lg transition-colors">
                                <Edit size={16} className="text-yellow-600" />
                              </button>

                              {user.role != 'admin' && <button className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                onClick={(e) => handleDelete(e,user._id || user.id, user.name)}>
                                <Trash2 size={16} className="text-red-600" />
                              </button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab (Admin Only) */}
        {activeTab === 'analytics' && currentUser?.role === 'admin' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Team Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Completion Rate</span>
                    <span className="font-bold text-green-600">{stats.completionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Projects On Time</span>
                    <span className="font-bold text-blue-600">
                      {stats.totalProjects > 0 ? Math.round(((stats.totalProjects - stats.overdueTasks) / stats.totalProjects) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Team Members</span>
                    <span className="font-bold text-purple-600">{users.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;





