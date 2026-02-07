const WorkspaceService = require('../services/workspaceService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class WorkspaceController {
    static async createWorkspace(req, res, next) {
        try {
            const { name } = req.body;
            const userId = req.user.uid;

            if (!name) {
                return ApiResponse.badRequest(res, 'Workspace name is required');
            }

            const workspace = await WorkspaceService.createWorkspace(userId, name);
            return ApiResponse.created(res, workspace, 'Workspace created successfully');
        } catch (error) {
            logger.error('Error in createWorkspace:', error);
            next(error);
        }
    }

    static async getWorkspaces(req, res, next) {
        try {
            const userId = req.user.uid;
            const workspaces = await WorkspaceService.getWorkspaces(userId);
            return ApiResponse.success(res, workspaces, 'Workspaces retrieved successfully');
        } catch (error) {
            logger.error('Error in getWorkspaces:', error);
            next(error);
        }
    }

    static async deleteWorkspace(req, res, next) {
        try {
            const userId = req.user.uid;
            const { id } = req.params;

            await WorkspaceService.deleteWorkspace(userId, id);
            return ApiResponse.success(res, null, 'Workspace deleted successfully');
        } catch (error) {
            if (error.message === 'Workspace not found') {
                return ApiResponse.notFound(res, 'Workspace not found');
            }
            if (error.message === 'Unauthorized') {
                return ApiResponse.forbidden(res, 'Not authorized to delete this workspace');
            }
            logger.error('Error in deleteWorkspace:', error);
            next(error);
        }
    }
}

module.exports = WorkspaceController;
