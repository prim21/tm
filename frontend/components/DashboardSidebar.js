'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar({
    user,
    invitations = [],
    onInvite,
    projects = [],
    activeProject,
    setActiveProject,
    onCreateProject,
    onDeleteProject,
    onLogout,
    onNewItem, // Generic "New" action
    onUploadProfilePicture,
    storageStats = { used: 75 }, // Default mock
    isProjectModalOpen,
    setIsProjectModalOpen
}) {
    const pathname = usePathname();
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        onInvite(inviteEmail);
        setInviteEmail('');
        setIsAddAccountModalOpen(false);
    };

    return (
        <aside className="w-72 bg-white rounded-3xl flex flex-col flex-shrink-0 shadow-sm border border-white/50 z-30 h-full">
            {/* Workspace / Profile Header */}
            <div className="p-6 pb-6">
                {/* Window Controls */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50"></div>
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/50"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50"></div>
                </div>

                {/* New Item Button */}
                <button
                    onClick={onNewItem}
                    className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors mb-6 group w-full"
                >
                    <div className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-gray-300 group-hover:text-gray-600 transition-all bg-white shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-9-6V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    </div>
                    <span className="font-semibold text-gray-600 group-hover:text-gray-900">New Item</span>
                </button>

                {/* Profile Section */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <label className="cursor-pointer relative group">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden relative border border-gray-100 group-hover:border-gray-300 transition-colors">
                                <img
                                    src={user?.photoURL || "https://api.dicebear.com/7.x/miniavs/svg?seed=guineapig"}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                    Edit
                                </div>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={onUploadProfilePicture}
                                disabled={!onUploadProfilePicture}
                            />
                        </label>
                        <span className="font-bold text-gray-900 text-sm truncate">{user?.displayName?.split(' ')[0] || 'User'}'s Space</span>
                    </div>

                    {/* Team Section */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex -space-x-2 relative z-10">
                            {invitations.slice(0, 3).map((invite) => (
                                <div
                                    key={invite.id}
                                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden z-0"
                                    title={`Invited: ${invite.email}`}
                                >
                                    <img
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${invite.email}`}
                                        alt={invite.email}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => setIsAddAccountModalOpen(true)}
                                className="w-8 h-8 rounded-full bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all z-10"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
                <div className="space-y-1 py-2">
                    <Link href="/documents" className={`w-full flex items-center gap-3 px-3 py-2.5 font-medium rounded-xl transition-colors ${pathname === '/documents' ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        All Documents
                    </Link>
                    <Link href="/tasks" className={`w-full flex items-center gap-3 px-3 py-2.5 font-medium rounded-xl transition-colors ${pathname === '/tasks' ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Tasks
                    </Link>
                    <Link href="/calendar" className={`w-full flex items-center gap-3 px-3 py-2.5 font-medium rounded-xl transition-colors ${pathname === '/calendar' ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Calendar
                    </Link>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        <span>Lists</span>
                        <button
                            onClick={() => setIsProjectModalOpen && setIsProjectModalOpen(true)}
                            className="hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>

                    <div
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl cursor-pointer transition-colors ${activeProject === null ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setActiveProject && setActiveProject(null)}
                    >
                        <span className={`w-2 h-2 rounded-full ${activeProject === null ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                        My Tasks
                    </div>
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl cursor-pointer transition-colors ${activeProject === project.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setActiveProject && setActiveProject(project.id)}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeProject === project.id ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                                <span className="truncate">{project.name}</span>
                            </div>
                            {onDeleteProject && (
                                <button
                                    onClick={(e) => onDeleteProject(project.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Storage / Logout */}
            <div className="p-4 mt-auto">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage</span>
                        <span className="text-[10px] font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                            {storageStats.used || 0}%
                        </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-1000 ${storageStats.used > 90 ? 'bg-red-500' :
                                    storageStats.used > 70 ? 'bg-orange-500' : 'bg-blue-600'
                                }`}
                            style={{ width: `${storageStats.used || 0}%` }}
                        ></div>
                    </div>

                    <p className="text-[10px] text-gray-500 mb-4">
                        <span className="font-bold text-gray-700">
                            {storageStats.usedBytes ? (storageStats.usedBytes / (1024 * 1024)).toFixed(1) : '0'} MB
                        </span>
                        {' '}of 1 GB used
                    </p>

                    <div className="pt-3 border-t border-gray-100">
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 group w-full text-left"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all border border-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </div>
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-red-600 transition-colors">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Invite Modal (Mini) */}
            {isAddAccountModalOpen && (
                <div className="absolute top-20 left-6 bg-white shadow-xl border rounded-xl p-4 z-50 w-64">
                    <form onSubmit={handleInviteSubmit}>
                        <h3 className="text-sm font-bold mb-2">Invite Member</h3>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full border rounded p-1 text-sm mb-2"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAddAccountModalOpen(false)} className="text-xs text-gray-500">Cancel</button>
                            <button type="submit" className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Invite</button>
                        </div>
                    </form>
                </div>
            )}
        </aside>
    );
}
