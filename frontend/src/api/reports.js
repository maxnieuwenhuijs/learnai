import api from './config';

export const reportsApi = {
  // Get team progress (for managers)
  getTeamProgress: async () => {
    const response = await api.get('/reports/team');
    return response.data;
  }
};