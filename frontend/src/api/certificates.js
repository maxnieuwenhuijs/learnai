import api from './config';

// Get all certificates for the current user
export const getUserCertificates = async () => {
  try {
    const response = await api.get('/certificates');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

// Get a specific certificate by ID
export const getCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/${certificateId}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
};

// Download certificate as PDF
export const downloadCertificatePDF = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate-${certificateId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

// Verify a certificate
export const verifyCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/certificates/verify/${certificateId}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

// Generate a new certificate (for completed courses)
export const generateCertificate = async (courseId) => {
  try {
    const response = await api.post('/certificates/generate', { courseId });
    return response.data.data || null;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

// Share certificate via email
export const shareCertificate = async (certificateId, email) => {
  try {
    const response = await api.post(`/certificates/${certificateId}/share`, { email });
    return response.data.data || null;
  } catch (error) {
    console.error('Error sharing certificate:', error);
    throw error;
  }
};