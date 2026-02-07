'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { getAllDocuments, createDocument, deleteDocument, getStorageInsights } from '@/lib/api';

export default function DocumentsPage() {
    const { user, loading: authLoading, getToken, logout } = useAuth();
    const router = useRouter();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState('all'); // all, recent, shared, starred, template
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Doc State
    const [newDocTitle, setNewDocTitle] = useState('');

    // View and Sort State
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [sortBy, setSortBy] = useState('updatedAt'); // name, updatedAt, createdAt, size, type
    const [sortOrder, setSortOrder] = useState('desc'); // asc or desc
    const [typeFilter, setTypeFilter] = useState(''); // '', 'doc', 'spreadsheet', 'pdf', 'slide'

    // Selection State
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Context stats
    const { storageStats, refreshStorageStats } = useAuth();

    // Share State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingDoc, setSharingDoc] = useState(null);
    const [shareEmail, setShareEmail] = useState('');
    const [sharingLoading, setSharingLoading] = useState(false);

    // Preview State
    const [previewDoc, setPreviewDoc] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchDocuments();
            refreshStorageStats();
        }
    }, [user, authLoading, filterTab, sortBy, sortOrder, typeFilter]);
    // Note: search usually requires debounce, here we might just filter client side or trigger on enter

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const filters = {
                sortBy,
                sortOrder
            };
            if (filterTab === 'recent') filters.tab = 'recent';
            if (filterTab === 'shared') filters.tab = 'shared';
            if (filterTab === 'starred') filters.isStarred = 'true';
            if (filterTab === 'template') filters.isTemplate = 'true';
            if (search) filters.search = search;
            if (typeFilter) filters.type = typeFilter;

            const docs = await getAllDocuments(filters, token);
            setDocuments(docs || []);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };


    const handleCreateDocument = async (e) => {
        e.preventDefault();

        console.log('=== FORM SUBMISSION ===');
        console.log('newDocTitle state:', newDocTitle);
        console.log('newDocTitle length:', newDocTitle?.length);

        // Client-side validation
        if (!newDocTitle || newDocTitle.trim() === '') {
            alert('Please enter a document title');
            return;
        }

        try {
            const token = await getToken();
            const docData = {
                title: newDocTitle.trim(),
                type: 'doc', // Always create documents
                content: '' // Empty for now
            };

            console.log('Creating document with data:', JSON.stringify(docData, null, 2));
            console.log('Token:', token ? 'Present' : 'Missing');

            await createDocument(docData, token);
            closeModal();
            fetchDocuments();
            refreshStorageStats();
        } catch (error) {
            const errorMessage = error.message || 'Failed to create document';
            alert(errorMessage);
            console.error('Document creation error:', error);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!confirm('Delete this document?')) return;
        try {
            const token = await getToken();
            await deleteDocument(id, token);
            setDocuments(prev => prev.filter(d => d.id !== id));
            refreshStorageStats();
        } catch (error) {
            console.error(error);
        }
    }

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setNewDocTitle('');
    };

    const handleShareDocument = async (e) => {
        e.preventDefault();
        if (!shareEmail || !sharingDoc) return;

        try {
            setSharingLoading(true);
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/documents/${sharingDoc.id}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: shareEmail })
            });

            if (!response.ok) throw new Error('Failed to share document');

            alert(`Shared with ${shareEmail}`);
            setShareEmail('');
            setIsShareModalOpen(false);
            fetchDocuments(); // Refresh to see updated list
        } catch (error) {
            console.error(error);
            alert('Failed to share document');
        } finally {
            setSharingLoading(false);
        }
    };

    const handleToggleStar = async (doc) => {
        const newStarred = !doc.isStarred;
        // Optimistic update
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isStarred: newStarred } : d));

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/documents/${doc.id}/star`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isStarred: newStarred })
            });

            if (!response.ok) {
                throw new Error('Failed to update star status');
            }
        } catch (error) {
            console.error(error);
            // Revert on error
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isStarred: !newStarred } : d));
        }
    };

    const toggleDocSelection = (docId) => {
        setSelectedDocs(prev =>
            prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
        );
    };

    const selectAll = () => {
        if (selectedDocs.length === documents.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(documents.map(d => d.id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedDocs.length} documents?`)) return;

        try {
            const token = await getToken();
            await Promise.all(selectedDocs.map(id => deleteDocument(id, token)));
            setDocuments(prev => prev.filter(d => !selectedDocs.includes(d.id)));
            setSelectedDocs([]);
            setIsSelectionMode(false);
            refreshStorageStats();
        } catch (error) {
            console.error(error);
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'doc': return '📄';
            case 'spreadsheet': return '📊';
            case 'pdf': return '📕';
            case 'slide': return '📽️';
            default: return '📄';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 KB';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (authLoading || !user) return null;

    const recentDocs = documents.slice(0, 5); // Last 5 for recent activity

    const handleInvite = async (email) => {
        // Placeholder for invite functionality
        console.log('Invite sent to:', email);
        alert(`Invite sent to ${email}`);
    };

    return (
        <div className="flex h-screen bg-[#f3f4f6] font-sans text-slate-600 p-4 gap-4 overflow-hidden">
            <DashboardSidebar
                user={user}
                onLogout={() => { logout(); router.push('/'); }}
                onNewItem={() => setIsCreateModalOpen(true)}
                onInvite={handleInvite}
                storageStats={storageStats}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl shadow-sm border border-white/50 overflow-hidden relative">
                {/* Header */}
                <header className="px-8 py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Create New
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Filters and Controls */}
                    <div className="flex items-center justify-between mb-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b border-gray-100 pb-1">
                            {['all', 'recent', 'shared', 'starred', 'template'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterTab(tab)}
                                    className={`pb-3 text-sm font-medium capitalize transition-all relative ${filterTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    {tab}
                                    {filterTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                                </button>
                            ))}
                        </div>

                        {/* View Controls */}
                        <div className="flex items-center gap-3">
                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="updatedAt">Date Modified</option>
                                <option value="createdAt">Date Created</option>
                                <option value="name">Name</option>
                                <option value="size">Size</option>
                                <option value="type">Type</option>
                            </select>

                            {/* Sort Order */}
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                <svg className={`w-5 h-5 text-gray-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            </button>

                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>

                            {/* Selection Mode Toggle */}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(!isSelectionMode);
                                    if (isSelectionMode) setSelectedDocs([]);
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSelectionMode ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                            >
                                {isSelectionMode ? 'Cancel' : 'Select'}
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {isSelectionMode && selectedDocs.length > 0 && (
                        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">{selectedDocs.length} selected</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Select All */}
                    {isSelectionMode && documents.length > 0 && (
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedDocs.length === documents.length}
                                    onChange={selectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Select All
                            </label>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading documents...</div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="max-w-md mx-auto">
                                {filterTab === 'all' && (
                                    <>
                                        <div className="text-6xl mb-4">📄</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No documents yet</h3>
                                        <p className="text-gray-600 mb-6">Get started by creating your first document or uploading files</p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                            >
                                                Create Document
                                            </button>
                                            <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                                Upload Files
                                            </button>
                                        </div>

                                        {/* Quick Templates */}
                                        <div className="mt-8">
                                            <p className="text-sm text-gray-500 mb-3">Or start with a template:</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Meeting Notes', 'Project Plan', 'Budget Sheet'].map(template => (
                                                    <button
                                                        key={template}
                                                        onClick={() => {
                                                            setNewDocTitle(template);
                                                            setIsCreateModalOpen(true);
                                                        }}
                                                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all text-sm font-medium text-gray-700"
                                                    >
                                                        {template}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {filterTab === 'recent' && (
                                    <>
                                        <div className="text-6xl mb-4">🕐</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No recent documents</h3>
                                        <p className="text-gray-600 mb-6">Documents you've recently opened or edited will appear here</p>
                                        <button
                                            onClick={() => setFilterTab('all')}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                        >
                                            View All Documents
                                        </button>
                                    </>
                                )}

                                {filterTab === 'shared' && (
                                    <>
                                        <div className="text-6xl mb-4">👥</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No shared documents yet</h3>
                                        <p className="text-gray-600">Documents shared with you by others will appear here</p>
                                    </>
                                )}

                                {filterTab === 'starred' && (
                                    <>
                                        <div className="text-6xl mb-4">⭐</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No starred documents yet</h3>
                                        <p className="text-gray-600 mb-6">Star important documents to quickly find them here</p>
                                        <button
                                            onClick={() => setFilterTab('all')}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                        >
                                            Browse Documents
                                        </button>
                                    </>
                                )}

                                {filterTab === 'template' && (
                                    <>
                                        <div className="text-6xl mb-4">📋</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No templates available</h3>
                                        <p className="text-gray-600 mb-6">Create reusable templates from your documents</p>
                                        <button
                                            onClick={() => setFilterTab('all')}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                        >
                                            Browse Documents
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-6">
                            {/* Documents List/Grid */}
                            <div className={`flex-1 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-2'}`}>
                                {documents.map(doc => (
                                    viewMode === 'grid' ? (
                                        // Grid View
                                        <div
                                            key={doc.id}
                                            className={`group bg-white border ${doc.isStarred ? 'border-yellow-200' : 'border-gray-200'} rounded-2xl p-4 hover:shadow-lg transition-all hover:border-blue-200 cursor-pointer relative flex flex-col`}
                                            onClick={() => router.push(`/documents/${doc.id}`)}
                                        >
                                            {isSelectionMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocs.includes(doc.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleDocSelection(doc.id);
                                                    }}
                                                    className="absolute top-4 left-4 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 z-10"
                                                />
                                            )}

                                            <div className="h-32 bg-gray-50 rounded-xl mb-4 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                                                {doc.content ? (
                                                    <div
                                                        className="p-4 text-[10px] leading-tight text-gray-400 select-none overflow-hidden h-full w-full opacity-60 prose prose-xs max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: doc.content.slice(0, 300) }}
                                                    />
                                                ) : (
                                                    <div className="text-5xl text-blue-100">
                                                        {getFileIcon(doc.type)}
                                                    </div>
                                                )}

                                                {/* Star Badge */}
                                                {doc.isStarred && (
                                                    <div className="absolute top-2 right-2 text-yellow-500 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-yellow-100 shadow-sm">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 truncate mb-1 flex items-center gap-2">
                                                    {doc.title}
                                                </h3>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {user?.displayName?.charAt(0) || 'U'}
                                                        </div>
                                                        <span className="text-xs text-gray-500">{formatDate(doc.updatedAt)}</span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                                        {formatFileSize(doc.size)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Actions Hover */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg border border-gray-100 rounded-lg p-1 z-20">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStar(doc); }}
                                                    className={`p-1.5 rounded hover:bg-gray-50 ${doc.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                                                    title={doc.isStarred ? "Unstar" : "Star"}
                                                >
                                                    <svg className="w-4 h-4" fill={doc.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSharingDoc(doc); setIsShareModalOpen(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Share"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // List View
                                        <div
                                            key={doc.id}
                                            className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                                            onClick={() => router.push(`/documents/${doc.id}`)}
                                        >
                                            {isSelectionMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocs.includes(doc.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleDocSelection(doc.id);
                                                    }}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            )}

                                            <div className="text-3xl">{getFileIcon(doc.type)}</div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                                                <p className="text-sm text-gray-500">{formatDate(doc.updatedAt)}</p>
                                            </div>

                                            <div className="text-sm text-gray-500 w-24 text-right">{formatFileSize(doc.size)}</div>
                                            <div className="text-sm text-gray-500 w-32 capitalize">{doc.type || 'Document'}</div>

                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStar(doc); }}
                                                    className={`p-2 rounded hover:bg-gray-50 ${doc.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                                                >
                                                    <svg className="w-5 h-5" fill={doc.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Preview Pane */}
                            {previewDoc && (
                                <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{previewDoc.title}</h3>
                                        <button
                                            onClick={() => setPreviewDoc(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <div className="h-48 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl mb-4 flex items-center justify-center text-6xl">
                                        {getFileIcon(previewDoc.type)}
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Type:</span>
                                            <span className="ml-2 font-medium capitalize">{previewDoc.type || 'Document'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Size:</span>
                                            <span className="ml-2 font-medium">{formatFileSize(previewDoc.size)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Modified:</span>
                                            <span className="ml-2 font-medium">{formatDate(previewDoc.updatedAt)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Created:</span>
                                            <span className="ml-2 font-medium">{formatDate(previewDoc.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                                            Open
                                        </button>
                                        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleToggleStar(previewDoc)}
                                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            {previewDoc.isStarred ? 'Unstar' : 'Star'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeleteDocument(previewDoc.id);
                                                setPreviewDoc(null);
                                            }}
                                            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Storage Indicator */}
                    {documents.length > 0 && (
                        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Storage</span>
                                <span className="text-sm text-gray-500">{storageStats.used}% used</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${storageStats.used > 90 ? 'bg-red-500' : storageStats.used > 75 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                    style={{ width: `${storageStats.used}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Recent Activity Sidebar */}
            {recentDocs.length > 0 && (
                <div className="w-64 bg-white rounded-3xl shadow-sm border border-white/50 p-6 overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentDocs.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setPreviewDoc(doc)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="text-2xl">{getFileIcon(doc.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                                    <p className="text-xs text-gray-500">{formatDate(doc.updatedAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create Document</h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateDocument} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={newDocTitle}
                                    onChange={(e) => setNewDocTitle(e.target.value)}
                                    placeholder="Project Plan..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Share Modal */}
            {isShareModalOpen && sharingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Share "{sharingDoc.title}"</h2>
                            <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleShareDocument} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="friend@example.com"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={shareEmail}
                                    onChange={e => setShareEmail(e.target.value)}
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Already has access:</h4>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold">O</div>
                                        <span>{user?.email} (Owner)</span>
                                    </div>
                                    {(sharingDoc.sharedWith || []).map(email => (
                                        <div key={email} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">{email[0].toUpperCase()}</div>
                                            <span>{email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsShareModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={sharingLoading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {sharingLoading ? 'Sharing...' : 'Share'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
