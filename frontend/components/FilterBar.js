'use client';

/**
 * FilterBar Component
 * Provides filtering options for tasks
 */

export default function FilterBar({ filters, onFilterChange }) {
    const handleStatusChange = (e) => {
        onFilterChange({ ...filters, status: e.target.value || undefined });
    };

    const handlePriorityChange = (e) => {
        onFilterChange({ ...filters, priority: e.target.value || undefined });
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = filters.status || filters.priority;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-sm font-semibold text-gray-700">Filters:</h3>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="filter-status" className="text-sm text-gray-600">
                        Status:
                    </label>
                    <select
                        id="filter-status"
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="filter-priority" className="text-sm text-gray-600">
                        Priority:
                    </label>
                    <select
                        id="filter-priority"
                        value={filters.priority || ''}
                        onChange={handlePriorityChange}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                        <option value="">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="ml-auto px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
}
