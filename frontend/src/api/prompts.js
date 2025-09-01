import api from './config';

export const promptsApi = {
  // Categories
  getCategories: async () => {
    const response = await api.get('/prompts/categories');
    return response;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/prompts/categories', categoryData);
    return response;
  },

  // Prompts
  getPrompts: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await api.get(`/prompts?${searchParams}`);
    return response;
  },
  
  getPromptById: async (id) => {
    const response = await api.get(`/prompts/${id}`);
    return response;
  },
  
  createPrompt: async (promptData) => {
    const response = await api.post('/prompts', promptData);
    return response;
  },
  
  updatePrompt: async (id, promptData) => {
    const response = await api.put(`/prompts/${id}`, promptData);
    return response;
  },
  
  deletePrompt: async (id) => {
    const response = await api.delete(`/prompts/${id}`);
    return response;
  },

  // Generation & Usage
  generateContent: async (id, variables, context) => {
    const response = await api.post(`/prompts/${id}/generate`, { variables, context });
    return response;
  },
  
  getAnalytics: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await api.get(`/prompts/analytics/usage?${searchParams}`);
    return response;
  },

  // Approval Workflow
  getApprovalRequests: async (status = 'pending') => {
    const response = await api.get(`/prompts/approvals/requests?status=${status}`);
    return response;
  },
  
  processApproval: async (id, action, reviewerComments) => {
    const response = await api.put(`/prompts/approvals/${id}`, { action, reviewer_comments: reviewerComments });
    return response;
  },

  // Search and filtering helpers
  searchPrompts: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    return await promptsApi.getPrompts(params);
  },

  getTemplates: async (categoryId = null) => {
    const params = { is_template: 'true' };
    if (categoryId) params.category_id = categoryId;
    return await promptsApi.getPrompts(params);
  },

  getPromptsByCategory: async (categoryId, filters = {}) => {
    const params = {
      category_id: categoryId,
      ...filters
    };
    return await promptsApi.getPrompts(params);
  },

  getPromptsByTag: async (tags, filters = {}) => {
    const params = {
      tags: Array.isArray(tags) ? tags.join(',') : tags,
      ...filters
    };
    return await promptsApi.getPrompts(params);
  }
};

export default promptsApi;