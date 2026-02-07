const ProjectService = require('../services/projectService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class ProjectController {
    static async createProject(req, res, next) {
        try {
            const { name } = req.body;
            const userId = req.user.uid;

            if (!name) {
                return ApiResponse.badRequest(res, 'Project name is required');
            }

            const project = await ProjectService.createProject(userId, name);
            return ApiResponse.created(res, project, 'Project created successfully');
        } catch (error) {
            logger.error('Error in createProject:', error);
            next(error);
        }
    }

    static async getProjects(req, res, next) {
        try {
            const userId = req.user.uid;

            const projects = await ProjectService.getProjects(userId);
            return ApiResponse.success(res, projects, 'Projects retrieved successfully');
        } catch (error) {
            logger.error('Error in getProjects:', error);
            next(error);
        }
    }

    static async deleteProject(req, res, next) {
        try {
            const userId = req.user.uid;
            const { id } = req.params;
            await ProjectService.deleteProject(userId, id);
            return ApiResponse.success(res, null, 'Project deleted successfully');
        } catch (error) {
            if (error.message === 'Project not found') return ApiResponse.notFound(res, 'Project not found');
            if (error.message === 'Unauthorized') return ApiResponse.forbidden(res, 'Unauthorized');
            next(error);
        }
    }
}

module.exports = ProjectController;
