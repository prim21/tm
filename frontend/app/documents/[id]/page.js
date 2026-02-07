'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getDocumentById, updateDocument } from '@/lib/api';

export default function DocumentEditorPage({ params }) {
    const unwrappedParams = use(params);
    const { user, loading: authLoading, getToken, refreshStorageStats } = useAuth();
    const router = useRouter();
    const editorRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    // Share State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharingLoading, setSharingLoading] = useState(false);

    // Formatting state
    const [selectedFormat, setSelectedFormat] = useState({
        bold: false,
        italic: false,
        underline: false,
        alignment: 'left'
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchDocument();
        }
    }, [user, authLoading, unwrappedParams.id]);

    const fetchDocument = async () => {
        try {
            const token = await getToken();
            const doc = await getDocumentById(unwrappedParams.id, token);
            setDocData(doc);
            setTitle(doc.title || '');
            setContent(doc.content || '');
            setLastSaved(new Date(doc.updatedAt));
        } catch (error) {
            console.error('Failed to fetch document:', error);
            alert('Failed to load document');
            router.push('/documents');
        } finally {
            setLoading(false);
        }
    };

    // Set initial content in editor
    useEffect(() => {
        if (editorRef.current && content && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    const saveDocument = async (newContent, newTitle) => {
        try {
            setIsSaving(true);
            const token = await getToken();
            await updateDocument(unwrappedParams.id, {
                content: newContent,
                title: newTitle,
                size: new Blob([newContent]).size
            }, token);
            setLastSaved(new Date());
            refreshStorageStats();
        } catch (error) {
            console.error('Failed to save document:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);

            // Auto-save after 2 seconds of inactivity
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                saveDocument(newContent, title);
            }, 2000);
        }
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        // Auto-save title
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveDocument(content, newTitle);
        }, 1000);
    };


    const handleShareDocument = async (e) => {
        e.preventDefault();
        if (!shareEmail || !docData) return;

        try {
            setSharingLoading(true);
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/documents/${unwrappedParams.id}/share`, {
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

            // Refresh doc data to update shared list
            const updatedDoc = await getDocumentById(unwrappedParams.id, token);
            setDocData(updatedDoc);
        } catch (error) {
            console.error(error);
            alert('Failed to share document');
        } finally {
            setSharingLoading(false);
        }
    };

    const execCommand = (command, value = null) => {
        console.log('execCommand called:', command, value);
        console.log('Editor ref:', editorRef.current);
        console.log('Selection:', window.getSelection().toString());

        try {
            const result = document.execCommand(command, false, value);
            console.log('execCommand result:', result);
            editorRef.current?.focus();
            updateFormatState();
        } catch (error) {
            console.error('execCommand error:', error);
        }
    };


    const updateFormatState = () => {
        setSelectedFormat({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            alignment: document.queryCommandValue('justifyLeft') ? 'left' :
                document.queryCommandValue('justifyCenter') ? 'center' :
                    document.queryCommandValue('justifyRight') ? 'right' : 'left'
        });
    };

    const formatDate = (date) => {
        if (!date) return '';
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);

        if (seconds < 10) return 'Saved just now';
        if (seconds < 60) return `Saved ${seconds}s ago`;
        if (minutes < 60) return `Saved ${minutes}m ago`;
        return `Saved at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading document...</p>
                </div>
            </div>
        );
    }

    if (!docData) return null;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => router.push('/documents')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to documents"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        <div className="flex-1 max-w-2xl">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    onBlur={() => setIsEditingTitle(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                                    className="text-lg font-semibold text-gray-900 border-b-2 border-blue-500 outline-none w-full"
                                    autoFocus
                                />
                            ) : (
                                <h1
                                    onClick={() => setIsEditingTitle(true)}
                                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                    {title || 'Untitled Document'}
                                </h1>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className={`flex items-center gap-1 ${isSaving ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {isSaving ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {formatDate(lastSaved)}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                        >
                            Share
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
                    {/* Undo/Redo */}
                    <button
                        onClick={() => execCommand('undo')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Undo"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => execCommand('redo')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Redo"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                        </svg>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Text Formatting */}
                    <select
                        onChange={(e) => execCommand('formatBlock', e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="p">Normal text</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                    </select>

                    <select
                        onChange={(e) => execCommand('fontName', e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                    </select>

                    <select
                        onChange={(e) => execCommand('fontSize', e.target.value)}
                        defaultValue="3"
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="1">Small</option>
                        <option value="3">Normal</option>
                        <option value="5">Large</option>
                        <option value="7">Huge</option>
                    </select>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Bold, Italic, Underline */}
                    <button
                        onClick={() => execCommand('bold')}
                        className={`p-2 rounded transition-colors ${selectedFormat.bold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Bold (Ctrl+B)"
                    >
                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => execCommand('italic')}
                        className={`p-2 rounded transition-colors ${selectedFormat.italic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Italic (Ctrl+I)"
                    >
                        <svg className="w-5 h-5 italic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M10 20h4M14 4L10 20" />
                        </svg>
                    </button>
                    <button
                        onClick={() => execCommand('underline')}
                        className={`p-2 rounded transition-colors ${selectedFormat.underline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Underline (Ctrl+U)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v8a6 6 0 0012 0V4M4 20h16" />
                        </svg>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Text Color */}
                    <input
                        type="color"
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                        title="Text color"
                    />

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Alignment */}
                    <button
                        onClick={() => execCommand('justifyLeft')}
                        className={`p-2 rounded transition-colors ${selectedFormat.alignment === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Align left"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => execCommand('justifyCenter')}
                        className={`p-2 rounded transition-colors ${selectedFormat.alignment === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Align center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => execCommand('justifyRight')}
                        className={`p-2 rounded transition-colors ${selectedFormat.alignment === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Align right"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                        </svg>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Lists */}
                    <button
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Bullet list"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Numbered list"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h12M9 12h12M9 19h12M3 5v4m0 0v4m0-4h.01M3 12v4m0 0v4m0-4h.01" />
                        </svg>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Link */}
                    <button
                        onClick={() => {
                            const url = prompt('Enter URL:');
                            if (url) execCommand('createLink', url);
                        }}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Insert link"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Editor */}
            <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg min-h-[calc(100vh-200px)]">
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleContentChange}
                        onMouseUp={updateFormatState}
                        onKeyUp={updateFormatState}
                        className="p-16 outline-none min-h-[calc(100vh-200px)] prose prose-lg max-w-none
                                   focus:ring-2 focus:ring-blue-500/20 rounded-lg
                                   [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mb-4
                                   [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mb-3
                                   [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mb-2
                                   [&>p]:mb-4 [&>p]:leading-relaxed
                                   [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
                                   [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
                        style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', lineHeight: '1.6', color: '#333' }}
                    />
                </div>
            </main>
            {/* Share Modal */}
            {isShareModalOpen && docData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Share Document</h2>
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
                                    {(docData.sharedWith || []).map(email => (
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
