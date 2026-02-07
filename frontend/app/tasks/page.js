'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

const API_URL = 'http://localhost:3000/api';

const COLUMNS = [
    { id: 'todo', label: 'Not started', color: 'bg-gray-100 text-gray-600' },
    { id: 'in-progress', label: 'In progress', color: 'bg-blue-50 text-blue-600' },
    { id: 'in-review', label: 'In review', color: 'bg-yellow-50 text-yellow-600' },
    { id: 'blocked', label: 'Completed', color: 'bg-green-50 text-green-600' }
];

export default function TasksPage() {
    const { user, loading: authLoading, getToken, logout, updatePreferences, updateProfile, storageStats } = useAuth();
    const router = useRouter();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Filter & Sort State
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'priority',
        sortOrder: 'asc',
        category: ''
    });

    // View Customization State
    const [cardOptions, setCardOptions] = useState({
        showDescription: true,
        showPriority: true,
        showDate: true,
        showCategory: true
    });

    const [colorMode, setColorMode] = useState('none'); // 'none', 'priority', 'category'

    // Sync preferences from user profile
    useEffect(() => {
        if (user?.preferences) {
            if (user.preferences.cardOptions) {
                setCardOptions(prev => ({ ...prev, ...user.preferences.cardOptions }));
            }
            if (user.preferences.colorMode) {
                setColorMode(user.preferences.colorMode);
            }
        }
    }, [user]);

    const updateCardOption = (key, value) => {
        const newOptions = { ...cardOptions, [key]: value };
        setCardOptions(newOptions);
        updatePreferences({ cardOptions: newOptions });
    };

    const updateColorMode = (mode) => {
        setColorMode(mode);
        updatePreferences({ colorMode: mode });
    };

    // Helper for dynamic card colors
    const getCardColorClass = (task) => {
        if (colorMode === 'none') return 'border-gray-100/50 hover:shadow-md';

        if (colorMode === 'priority') {
            const colors = {
                high: 'border-red-200 bg-red-50/30 hover:shadow-red-100',
                medium: 'border-amber-200 bg-amber-50/30 hover:shadow-amber-100',
                low: 'border-blue-200 bg-blue-50/30 hover:shadow-blue-100'
            };
            return colors[task.priority] || 'border-gray-200';
        }

        if (colorMode === 'category') {
            const colors = {
                'Development': 'border-cyan-200 bg-cyan-50/30 hover:shadow-cyan-100',
                'Design': 'border-purple-200 bg-purple-50/30 hover:shadow-purple-100',
                'Business': 'border-emerald-200 bg-emerald-50/30 hover:shadow-emerald-100'
            };
            return colors[task.category] || 'border-gray-200';
        }
        return 'border-gray-100/50';
    };

    // Edit Mode State
    const [editingTask, setEditingTask] = useState(null);

    // New Task Form State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        category: 'Development'
    });

    const [workspaces, setWorkspaces] = useState([]);
    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // Projects (Sub-items for My Tasks)
    const [projects, setProjects] = useState([]);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isMyTasksExpanded, setIsMyTasksExpanded] = useState(true);
    const [activeProject, setActiveProject] = useState(null); // null means "All My Tasks"

    // Team/Workspace Switcher State
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

    // Add Account / Invite State
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitations, setInvitations] = useState([]);

    const fetchInvitations = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/auth/invites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setInvitations(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch invitations', err);
        }
    };

    const handleUploadProfilePicture = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = await getToken();
            const response = await fetch(`${API_URL}/upload/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                // Update local state by forcing a profile refresh with the new URL
                await updateProfile({ photoURL: data.data.url });
                alert('Profile picture updated!');
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload profile picture');
        }
    };

    const handleInviteUser = async (email) => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/auth/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                alert(`Invitation sent to ${email}`);
                fetchInvitations();
            } else {
                alert(data.message || 'Failed to populate invitation');
            }
        } catch (err) {
            console.error('Failed to send invitation', err);
            alert('Failed to send invitation. Please try again.');
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchTasks(); // Fetch initially
            fetchProjects();
            fetchWorkspaces();
            fetchInvitations();
        }
    }, [user, authLoading, router]);

    const fetchProjects = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProjects(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch projects', err);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newProjectName })
            });
            const data = await response.json();
            if (data.success) {
                setProjects(prev => [data.data, ...prev]);
                setNewProjectName('');
                setIsProjectModalOpen(false);
                setIsMyTasksExpanded(true); // Auto expand
            }
        } catch (err) {
            console.error('Failed to create project', err);
        }
    };

    const handleDeleteProject = async (projectId, e) => {
        e.stopPropagation();
        if (!confirm('Delete this project? Tasks will remain but be unassigned.')) return;

        // Optimistic
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (activeProject === projectId) setActiveProject(null);

        try {
            const token = await getToken();
            await fetch(`${API_URL}/projects/${projectId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
            fetchProjects(); // Revert
        }
    }

    const fetchWorkspaces = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/workspaces`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setWorkspaces(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch workspaces', err);
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/workspaces`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newWorkspaceName })
            });
            const data = await response.json();
            if (data.success) {
                setWorkspaces(prev => [data.data, ...prev]);
                setNewWorkspaceName('');
                setNewWorkspaceName('');
                setNewWorkspaceName('');
                setIsWorkspaceModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to create workspace', err);
        }
    };

    const handleDeleteWorkspace = async (workspaceId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this team?')) return;

        // Optimistic update
        const previousWorkspaces = workspaces;
        const previousCurrentWorkspace = currentWorkspace;

        setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
        if (currentWorkspace?.id === workspaceId) {
            setCurrentWorkspace(null);
        }

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete workspace');
            }
        } catch (err) {
            console.error('Failed to delete workspace', err);
            // Revert state
            setWorkspaces(previousWorkspaces);
            setCurrentWorkspace(previousCurrentWorkspace);
            alert('Failed to delete team. Please try again.');
        }
    };

    // Refetch when filters changes (Removed currentWorkspace dependency)
    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [filters, activeProject]);

    const fetchTasks = async () => {
        try {
            const token = await getToken();
            // Build query string
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            params.append('sortBy', filters.sortBy);
            params.append('sortOrder', filters.sortOrder);

            if (activeProject) {
                params.append('projectId', activeProject);
            } else {
                // If activeProject is null (My Tasks view), filter for tasks NOT in any project
                params.append('projectId', 'null');
            }

            // Removed workspaceId filter

            const response = await fetch(`${API_URL}/tasks?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setTasks(data.data);
            } else {
                setError('Failed to fetch tasks');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching tasks');
        } finally {
            setLoading(false);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Add a dragging class for visual feedback
        e.target.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        if (!taskId) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === newStatus) return;

        // Optimistic update
        const updatedTask = { ...task, status: newStatus };
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

        try {
            const token = await getToken();
            await fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error(err);
            // Revert on error
            setTasks(prev => prev.map(t => t.id === taskId ? task : t));
            alert('Failed to move task');
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        setError('');
        setCreateLoading(true);

        try {
            // Prepare payload
            const payload = { ...newTask };
            // Remove empty date string to avoid validation error
            if (!payload.dueDate) {
                delete payload.dueDate;
            }
            if (activeProject) {
                payload.projectId = activeProject;
            }

            // Removed workspaceId attachment

            const token = await getToken();
            const isEditing = !!editingTask;
            const url = isEditing ? `${API_URL}/tasks/${editingTask.id}` : `${API_URL}/tasks`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                const savedTask = data.data;
                if (isEditing) {
                    setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
                } else {
                    setTasks(prev => [...prev, savedTask]);
                }
                closeModal();
            } else {
                // Handle validation errors from backend
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMsg = data.errors.map(err => err.message).join('. ');
                    setError(errorMsg);
                } else {
                    setError(data.message || 'Failed to save task');
                }
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setTasks(prev => prev.filter(t => t.id !== taskId));
            } else {
                alert(data.message || 'Failed to delete task');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting task');
        }
    };

    const handleMoveTask = async (task, direction) => {
        const currentIndex = COLUMNS.findIndex(c => c.id === task.status);
        let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex < 0 || newIndex >= COLUMNS.length) return;

        const newStatus = COLUMNS[newIndex].id;

        // Optimistic update
        const updatedTask = { ...task, status: newStatus };
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));

        try {
            const token = await getToken();
            await fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error(err);
            // Revert on error
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
            alert('Failed to move task');
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            category: task.category || 'General'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            dueDate: '',
            category: 'Development'
        });
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // Format date like "Feb 15"
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f3f4f6] font-sans text-slate-600 p-4 gap-4 overflow-hidden">
            {/* Sidebar - Floating Card Style */}
            {/* Sidebar - Floating Card Style */}
            <DashboardSidebar
                user={user}
                invitations={invitations}
                onInvite={(email) => handleInviteUser(email)}
                projects={projects}
                activeProject={activeProject}
                setActiveProject={setActiveProject}
                onCreateProject={() => setIsProjectModalOpen(true)}
                onDeleteProject={handleDeleteProject}
                onLogout={handleLogout}
                onNewItem={() => {
                    setNewTask(prev => ({ ...prev, status: 'todo' }));
                    setIsModalOpen(true);
                }}
                onUploadProfilePicture={handleUploadProfilePicture}
                isProjectModalOpen={isProjectModalOpen}
                setIsProjectModalOpen={setIsProjectModalOpen}
                storageStats={storageStats}
            />



            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl shadow-sm border border-white/50 overflow-hidden relative">
                {/* Header */}
                <header className="px-8 py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {activeProject ? (projects.find(p => p.id === activeProject)?.name || 'Project') : 'My Tasks'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-64 bg-gray-100/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <button
                            onClick={() => {
                                setNewTask(prev => ({ ...prev, status: 'todo' }));
                                setIsModalOpen(true);
                            }}
                            className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                </header >

                <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
                    <div className="p-8 pb-0">


                        {/* Tasks Section */}
                        <div className="flex-1 flex flex-col min-h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-800">Tasks</h2>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Kanban Board Container */}
                            <div className="flex-1 overflow-x-auto pb-4 -mx-8 px-8">
                                <div className="flex gap-8 min-w-max">
                                    <div className="flex gap-8 h-full min-w-max">
                                        {COLUMNS.map(column => {
                                            const columnTasks = getTasksByStatus(column.id);
                                            return (
                                                <div
                                                    key={column.id}
                                                    className="w-[320px] flex-shrink-0 flex flex-col h-full"
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, column.id)}
                                                >
                                                    {/* Column Header */}
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${column.color}`}>
                                                            {column.label}
                                                        </div>
                                                        <span className="text-gray-400 text-xs font-medium">{columnTasks.length}</span>
                                                    </div>

                                                    {/* Tasks */}
                                                    <div className="flex flex-col gap-4">
                                                        {columnTasks.map(task => (
                                                            <div
                                                                key={task.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                                onDragEnd={handleDragEnd}
                                                                className={`rounded-xl p-6 shadow-sm border transition-all group relative cursor-move ${getCardColorClass(task)}`}
                                                            >
                                                                {/* Hover Quick Actions */}
                                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-1 z-10">
                                                                    {/* Edit */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                    </button>

                                                                    {/* View */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                                                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded"
                                                                        title="View Details"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                    </button>

                                                                    {/* Delete */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                                        title="Delete"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                </div>

                                                                {cardOptions.showCategory && (
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm ${task.category === 'Design' ? 'bg-purple-50 text-purple-600' :
                                                                            task.category === 'Business' ? 'bg-blue-50 text-blue-600' :
                                                                                task.category === 'Development' ? 'bg-orange-50 text-orange-600' :
                                                                                    'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {task.category || 'General'}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <h4 className="font-medium text-gray-900 mb-2 text-base leading-snug">{task.title}</h4>

                                                                {cardOptions.showDescription && task.description && (
                                                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{task.description}</p>
                                                                )}

                                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                                    {cardOptions.showPriority ? (
                                                                        <div className="flex items-center gap-2">
                                                                            {/* Priority Indicator */}
                                                                            <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                                                                task.priority === 'medium' ? 'bg-yellow-500' :
                                                                                    'bg-green-500'
                                                                                }`} title={`Priority: ${task.priority}`}></div>
                                                                            <span className="text-xs text-gray-400 font-medium capitalize">{task.priority}</span>
                                                                        </div>
                                                                    ) : <div></div>}

                                                                    {cardOptions.showDate && task.dueDate && (
                                                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded">
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                            {formatDate(task.dueDate)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Add Task Button (Ghost Style) */}
                                                        <button
                                                            onClick={() => {
                                                                setNewTask(prev => ({ ...prev, status: column.id }));
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="w-full py-3 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                            Add task
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* Create/Edit Task Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                <h3 className="text-lg font-medium text-gray-900">{editingTask ? 'Edit Task' : 'New Task'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSaveTask} className="p-6 space-y-5">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm transition-all"
                                        placeholder="Make it productive..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Description</label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm resize-none transition-all"
                                        placeholder="Add context..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Category</label>
                                        <select
                                            value={newTask.category}
                                            onChange={(e) => {
                                                const cat = e.target.value;
                                                // Auto-select project if name matches category
                                                const matchingProject = projects.find(p => p.name === cat);
                                                setNewTask({
                                                    ...newTask,
                                                    category: cat,
                                                    projectId: matchingProject ? matchingProject.id : newTask.projectId
                                                });
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Development">Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Business">Business</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">List</label>
                                        <select
                                            value={newTask.projectId || ''}
                                            onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value || null })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">My Tasks</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            value={newTask.dueDate}
                                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-200 text-sm"
                                    >
                                        {createLoading ? 'Saving...' : (editingTask ? 'Save Changes' : 'Create Task')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }
            {/* Create Project Modal */}
            {
                isProjectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                <h3 className="text-lg font-medium text-gray-900">New List</h3>
                                <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">List Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm transition-all"
                                        placeholder="e.g. Personal, Work..."
                                        autoFocus
                                    />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsProjectModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-200 text-sm"
                                    >
                                        Create List
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


        </div >
    );
}
