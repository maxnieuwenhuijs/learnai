import api from './config';

export const certificatesApi = {
  // Get user's certificates
  getUserCertificates: async () => {
    const response = await api.get('/certificates');
    return response.data;
  },

  // Get specific certificate
  getCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}`);
    return response.data;
  },

  // Verify certificate
  verifyCertificate: async (verificationCode) => {
    const response = await api.get(`/certificates/verify/${verificationCode}`);
    return response.data;
  },

  // Download certificate PDF
  downloadCertificatePDF: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Generate certificate for completed course
  generateCertificate: async (courseId) => {
    const response = await api.post('/certificates/generate', { courseId });
    return response.data;
  }
};

// Export individual functions for convenience
export const {
  getUserCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificatePDF,
  generateCertificate
} = certificatesApi;