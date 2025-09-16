import api from './config';

// Get team members for a manager
export const getTeamMembers = async () => {
  try {
    const response = await api.get('/team/members');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

// Get detailed information about a team member
export const getTeamMember = async (userId) => {
  try {
    const response = await api.get(`/team/members/${userId}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
};

// Get team progress overview
export const getTeamProgress = async () => {
  try {
    const response = await api.get('/team/progress');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching team progress:', error);
    throw error;
  }
};

// Get team member's course progress
export const getMemberCourseProgress = async (userId, courseId) => {
  try {
    const response = await api.get(`/team/members/${userId}/courses/${courseId}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching member course progress:', error);
    throw error;
  }
};

// Assign course to team members
export const assignCourseToTeam = async (courseId, userIds) => {
  try {
    const response = await api.post('/team/assign-course', {
      courseId,
      userIds
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning course:', error);
    throw error;
  }
};

// Send reminder to team member
export const sendReminder = async (userId, courseId, message) => {
  try {
    const response = await api.post('/team/send-reminder', {
      userId,
      courseId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
};

// Get team analytics
export const getTeamAnalytics = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/team/analytics', { params });
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    throw error;
  }
};

// Update team member role
export const updateMemberRole = async (userId, newRole) => {
  try {
    const response = await api.put(`/team/members/${userId}/role`, { role: newRole });
    return response.data;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// Remove team member
export const removeTeamMember = async (userId) => {
  try {
    const response = await api.delete(`/team/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
};

// Invite new team member
export const inviteTeamMember = async (email, name, role, departmentId) => {
  try {
    const response = await api.post('/team/invite', {
      email,
      name,
      role,
      departmentId
    });
    return response.data;
  } catch (error) {
    console.error('Error inviting team member:', error);
    throw error;
  }
};