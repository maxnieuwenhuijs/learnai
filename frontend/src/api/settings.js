import api from './config';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/settings/profile');
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/settings/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user avatar
export const updateAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/settings/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/settings/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  try {
    const response = await api.get('/settings/notifications');
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/settings/notifications', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Get privacy settings
export const getPrivacySettings = async () => {
  try {
    const response = await api.get('/settings/privacy');
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (settings) => {
  try {
    const response = await api.put('/settings/privacy', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
};

// Get language preferences
export const getLanguagePreferences = async () => {
  try {
    const response = await api.get('/settings/language');
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching language preferences:', error);
    throw error;
  }
};

// Update language preference
export const updateLanguagePreference = async (language) => {
  try {
    const response = await api.put('/settings/language', { language });
    return response.data;
  } catch (error) {
    console.error('Error updating language preference:', error);
    throw error;
  }
};

// Get linked accounts (OAuth)
export const getLinkedAccounts = async () => {
  try {
    const response = await api.get('/settings/linked-accounts');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    throw error;
  }
};

// Link an OAuth account
export const linkAccount = async (provider) => {
  try {
    const response = await api.post('/settings/link-account', { provider });
    return response.data;
  } catch (error) {
    console.error('Error linking account:', error);
    throw error;
  }
};

// Unlink an OAuth account
export const unlinkAccount = async (provider) => {
  try {
    const response = await api.delete(`/settings/unlink-account/${provider}`);
    return response.data;
  } catch (error) {
    console.error('Error unlinking account:', error);
    throw error;
  }
};

// Export user data
export const exportUserData = async () => {
  try {
    const response = await api.get('/settings/export-data', {
      responseType: 'blob'
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'user-data-export.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

// Delete account
export const deleteAccount = async (confirmation) => {
  try {
    const response = await api.delete('/settings/account', {
      data: { confirmation }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};