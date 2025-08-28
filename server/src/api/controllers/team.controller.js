const teamService = require('../../services/team.service');
const { User, Department, Company } = require('../../models');

const getTeamMembers = async (req, res) => {
    try {
        const { page = 1, limit = 10, departmentId, search } = req.query;
        
        // Build filters based on user role and permissions
        const filters = teamService.buildTeamFilters(req.user, departmentId);
        
        const members = await teamService.getTeamMembers({
            filters,
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team members',
            error: error.message
        });
    }
};

const getTeamMemberDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verify manager has access to this user
        const hasAccess = await teamService.verifyTeamAccess(req.user, userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this team member'
            });
        }

        const memberDetails = await teamService.getMemberDetailsWithProgress(userId);
        
        if (!memberDetails) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: memberDetails
        });
    } catch (error) {
        console.error('Error fetching member details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch member details',
            error: error.message
        });
    }
};

const assignCourseToTeam = async (req, res) => {
    try {
        const { courseId, userIds, dueDate, mandatory = false } = req.body;

        // Validate input
        if (!courseId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course ID and user IDs are required'
            });
        }

        // Verify manager has access to all specified users
        for (const userId of userIds) {
            const hasAccess = await teamService.verifyTeamAccess(req.user, userId);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied to user ID ${userId}`
                });
            }
        }

        const assignments = await teamService.assignCourseToUsers({
            courseId,
            userIds,
            assignedBy: req.user.id,
            dueDate,
            mandatory
        });

        res.status(200).json({
            success: true,
            message: `Course assigned to ${assignments.length} team members`,
            data: assignments
        });
    } catch (error) {
        console.error('Error assigning course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign course',
            error: error.message
        });
    }
};

const getTeamProgress = async (req, res) => {
    try {
        const { startDate, endDate, courseId, departmentId } = req.query;
        
        const filters = teamService.buildTeamFilters(req.user, departmentId);
        
        const progressData = await teamService.getTeamProgressOverview({
            filters,
            startDate,
            endDate,
            courseId
        });

        res.status(200).json({
            success: true,
            data: progressData
        });
    } catch (error) {
        console.error('Error fetching team progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team progress',
            error: error.message
        });
    }
};

const getTeamAnalytics = async (req, res) => {
    try {
        const { period = '30d', departmentId, groupBy = 'course' } = req.query;
        
        const filters = teamService.buildTeamFilters(req.user, departmentId);
        
        const analytics = await teamService.getTeamAnalytics({
            filters,
            period,
            groupBy
        });

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching team analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team analytics',
            error: error.message
        });
    }
};

const updateMemberDepartment = async (req, res) => {
    try {
        const { userId } = req.params;
        const { departmentId } = req.body;

        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: 'Department ID is required'
            });
        }

        // Verify the department exists and belongs to user's company
        const department = await Department.findOne({
            where: {
                id: departmentId,
                company_id: req.user.company_id
            }
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found in your company'
            });
        }

        const updated = await teamService.updateUserDepartment(userId, departmentId);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Team member department updated',
            data: updated
        });
    } catch (error) {
        console.error('Error updating member department:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update member department',
            error: error.message
        });
    }
};

const removeCourseAssignment = async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        // Verify manager has access to this user
        const hasAccess = await teamService.verifyTeamAccess(req.user, userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this team member'
            });
        }

        const removed = await teamService.removeCourseAssignment(userId, courseId);

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Course assignment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course assignment removed successfully'
        });
    } catch (error) {
        console.error('Error removing course assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove course assignment',
            error: error.message
        });
    }
};

module.exports = {
    getTeamMembers,
    getTeamMemberDetails,
    assignCourseToTeam,
    getTeamProgress,
    getTeamAnalytics,
    updateMemberDepartment,
    removeCourseAssignment
};