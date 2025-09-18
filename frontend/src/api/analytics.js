import api from './config';

const analyticsApi = {
    // Get prompt analytics
    getPromptAnalytics: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.company_id) queryParams.append('company_id', params.company_id);
        if (params.department_id) queryParams.append('department_id', params.department_id);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.period) queryParams.append('period', params.period);

        const queryString = queryParams.toString();
        const url = `/analytics/prompts${queryString ? `?${queryString}` : ''}`;

        return api.get(url);
    },

    // Get company analytics
    getCompanyAnalytics: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.period) queryParams.append('period', params.period);

        const queryString = queryParams.toString();
        const url = `/analytics/company${queryString ? `?${queryString}` : ''}`;

        return api.get(url);
    }
};

export default analyticsApi;
