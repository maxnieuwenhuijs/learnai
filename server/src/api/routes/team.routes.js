const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');

// All team routes require authentication and manager role minimum
router.use(authMiddleware);

// List team members - managers and above only
router.get(
    '/members',
    requireRole('manager', 'admin', 'super_admin'),
    teamController.getTeamMembers
);

// Get specific team member details with progress
router.get(
    '/members/:userId',
    requireRole('manager', 'admin', 'super_admin'),
    teamController.getTeamMemberDetails
);

// Assign course to team members
router.post(
    '/assign-course',
    requireRole('manager', 'admin', 'super_admin'),
    teamController.assignCourseToTeam
);

// Get team progress overview
router.get(
    '/progress',
    requireRole('manager', 'admin', 'super_admin'),
    teamController.getTeamProgress
);

// Get team performance analytics
router.get(
    '/analytics',
    requireRole('manager', 'admin', 'super_admin'),
    teamController.getTeamAnalytics
);

// Update team member's department (admin only)
router.put(
    '/members/:userId/department',
    requireRole('admin', 'super_admin'),
    teamController.updateMemberDepartment
);

// Remove course assignment from team member
router.delete(
    '/members/:userId/courses/:courseId',
    requireRole('manager', 'admin', 'super_admin'),
    teamController.removeCourseAssignment
);

module.exports = router;