/**
 * Custom React Hooks for Task Management
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';

/**
 * Hook to fetch and manage tasks
 */
export function useTasks(filters = {}) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAllTasks(filters);
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return { tasks, loading, error, refetch: fetchTasks };
}

/**
 * Hook to manage task statistics
 */
export function useTaskStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getTaskStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook for task operations (create, update, delete)
 */
export function useTaskOperations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createTask = async (taskData) => {
        try {
            setLoading(true);
            setError(null);
            const newTask = await api.createTask(taskData);
            return newTask;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (id, updates) => {
        try {
            setLoading(true);
            setError(null);
            const updatedTask = await api.updateTask(id, updates);
            return updatedTask;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (id) => {
        try {
            setLoading(true);
            setError(null);
            await api.deleteTask(id);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        createTask,
        updateTask,
        deleteTask,
        loading,
        error,
    };
}
