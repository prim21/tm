'use client';

/**
 * StatsCard Component
 * Displays task statistics in a card format
 */

export default function StatsCard({ stats, loading }) {
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
                <div className="h-12 bg-white/20 rounded w-20 mb-6"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded"></div>
                    <div className="h-4 bg-white/20 rounded"></div>
                    <div className="h-4 bg-white/20 rounded"></div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const statusData = [
        { label: 'Pending', value: stats.byStatus.pending, color: 'text-yellow-300' },
        { label: 'In Progress', value: stats.byStatus['in-progress'], color: 'text-blue-300' },
        { label: 'Completed', value: stats.byStatus.completed, color: 'text-green-300' },
    ];

    const priorityData = [
        { label: 'Low', value: stats.byPriority.low, color: 'text-gray-300' },
        { label: 'Medium', value: stats.byPriority.medium, color: 'text-orange-300' },
        { label: 'High', value: stats.byPriority.high, color: 'text-red-300' },
    ];

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-2 opacity-90">Task Statistics</h2>
            <div className="text-4xl font-bold mb-6">{stats.total}</div>

            {/* Status Breakdown */}
            <div className="mb-6">
                <h3 className="text-sm font-medium opacity-75 mb-3">By Status</h3>
                <div className="space-y-2">
                    {statusData.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className={`text-sm ${item.color}`}>{item.label}</span>
                            <span className="text-sm font-semibold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Priority Breakdown */}
            <div>
                <h3 className="text-sm font-medium opacity-75 mb-3">By Priority</h3>
                <div className="space-y-2">
                    {priorityData.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className={`text-sm ${item.color}`}>{item.label}</span>
                            <span className="text-sm font-semibold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
