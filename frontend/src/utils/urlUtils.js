// Utility functions for URL handling

// Get the base URL for API calls and static assets
export const getBaseUrl = () => {
  // Check if we're in production (on the server)
  if (window.location.hostname === 'app.howtoworkwith.ai' || 
      window.location.hostname === 'h2ww.ai' ||
      window.location.hostname === 'marktplaat.h2ww.ai' ||
      window.location.hostname === 'marktplaats.howtoworkwith.ai') {
    // Production: use the same domain with the same protocol (HTTP/HTTPS)
    const protocol = window.location.protocol;
    return `${protocol}//${window.location.hostname}`;
  }
  
  // Development: use localhost
  return 'http://localhost:5000';
};

// Get the API base URL
export const getApiBaseUrl = () => {
  return `${getBaseUrl()}/api`;
};

// Get the full URL for an image or static asset
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${getBaseUrl()}/${cleanPath}`;
};

// Get the full URL for a company logo
export const getCompanyLogoUrl = (logoUrl) => {
  if (!logoUrl) return '';
  
  // If it's already a full URL, return as is
  if (logoUrl.startsWith('http')) {
    return logoUrl;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = logoUrl.startsWith('/') ? logoUrl.slice(1) : logoUrl;
  
  return `${getBaseUrl()}/${cleanPath}`;
};
