'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { getEvents, createEvent, getSchedulingSuggestions } from '@/lib/api';

export default function CalendarPage() {
    const { user, loading: authLoading, getToken, logout, storageStats } = useAuth();
    const router = useRouter();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // month, week, day
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Event State
    const [newEvent, setNewEvent] = useState({
        title: '',
        startDate: '',
        endDate: '',
        type: 'meeting',
        color: '#3b82f6'
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchEvents();
        }
    }, [user, authLoading, currentDate, view]); // simple refetch on nav

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            // Calculate range based on view
            // For simplicity, just fetch broad range
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

            const data = await getEvents({ startDate: start, endDate: end }, token);
            setEvents(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            await createEvent(newEvent, token);
            setIsCreateModalOpen(false);
            setNewEvent({ title: '', startDate: '', endDate: '', type: 'meeting', color: '#3b82f6' });
            fetchEvents();
        } catch (error) {
            console.error(error);
            alert('Failed to create event');
        }
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Calendar Grid Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday

        const daysArray = [];
        // Pad empty slots
        for (let i = 0; i < firstDay; i++) daysArray.push(null);
        // Days
        for (let i = 1; i <= days; i++) daysArray.push(new Date(year, month, i));

        return daysArray;
    };

    if (authLoading || !user) return null;

    const days = getDaysInMonth(currentDate);

    return (
        <div className="flex h-screen bg-[#f3f4f6] font-sans text-slate-600 p-4 gap-4 overflow-hidden">
            <DashboardSidebar
                user={user}
                onLogout={() => logout()}
                onNewItem={() => setIsCreateModalOpen(true)}
                storageStats={storageStats}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-white rounded-3xl shadow-sm border border-white/50 overflow-hidden relative">
                <header className="px-8 py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h1>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium hover:bg-white rounded-md transition-all">Today</button>
                            <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        {['Day', 'Week', 'Month'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v.toLowerCase())}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v.toLowerCase() ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">{day}</div>
                        ))}
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        {days.map((date, idx) => (
                            <div key={idx} className={`bg-white min-h-[120px] p-2 relative group ${!date ? 'bg-gray-50' : ''}`}>
                                {date && (
                                    <>
                                        <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                                            {date.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {events
                                                .filter(e => new Date(e.startDate).getDate() === date.getDate())
                                                .map(event => (
                                                    <div
                                                        key={event.id}
                                                        className="text-xs px-2 py-1 rounded-md text-white truncate cursor-pointer hover:opacity-90 transition-opacity"
                                                        style={{ backgroundColor: event.color }}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <button
                                            onClick={() => {
                                                setNewEvent(prev => ({ ...prev, startDate: date.toISOString().split('T')[0] }));
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="absolute bottom-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold"
                                        >
                                            +
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-xl"
                                placeholder="Meeting Title"
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Start</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                        value={newEvent.startDate}
                                        onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">End</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border rounded-xl text-sm"
                                        value={newEvent.endDate}
                                        onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Color</label>
                                <div className="flex gap-2">
                                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 ${newEvent.color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setNewEvent({ ...newEvent, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
