import api from './config';

export const reportsApi = {
  // Get team progress (for managers)
  getTeamProgress: async () => {
    const response = await api.get('/reports/team');
    return response.data;
  },

  // Get compliance report
  getComplianceReport: async (params = {}) => {
    const response = await api.get('/reports/compliance', { params });
    return response.data;
  },

  // Get department analytics
  getDepartmentAnalytics: async (departmentId, params = {}) => {
    const response = await api.get(`/reports/departments/${departmentId}`, { params });
    return response.data;
  },

  // Get course analytics
  getCourseAnalytics: async (courseId, params = {}) => {
    const response = await api.get(`/reports/courses/${courseId}`, { params });
    return response.data;
  },

  // Get overall statistics
  getOverallStatistics: async (params = {}) => {
    const response = await api.get('/reports/statistics', { params });
    return response.data;
  },

  // Export report as PDF
  exportReportPDF: async (reportType, params = {}) => {
    const response = await api.get(`/reports/export/${reportType}/pdf`, {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportType}-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  },

  // Export report as Excel
  exportReportExcel: async (reportType, params = {}) => {
    const response = await api.get(`/reports/export/${reportType}/excel`, {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportType}-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  },

  // Get time series data for charts
  getTimeSeriesData: async (metric, params = {}) => {
    const response = await api.get(`/reports/timeseries/${metric}`, { params });
    return response.data;
  }
};