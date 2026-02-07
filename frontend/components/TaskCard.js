'use client';

/**
 * TaskCard Component
 * Displays individual task with actions
 */

export default function TaskCard({ task, onUpdate, onDelete }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-700 border-gray-300',
        medium: 'bg-orange-100 text-orange-700 border-orange-300',
        high: 'bg-red-100 text-red-700 border-red-300',
    };

    const handleStatusChange = (newStatus) => {
        onUpdate(task.id, { status: newStatus });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-300">
            {/* Priority Badge */}
            <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
            </div>

            {/* Task Content */}
            <div className="pr-16">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {task.title}
                </h3>
                {task.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-gray-500">Status:</span>
                <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-xs font-medium px-3 py-1 rounded-full border cursor-pointer transition-all ${statusColors[task.status]} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Created: {formatDate(task.createdAt)}</span>
                {task.updatedAt !== task.createdAt && (
                    <span>Updated: {formatDate(task.updatedAt)}</span>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onDelete(task.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
