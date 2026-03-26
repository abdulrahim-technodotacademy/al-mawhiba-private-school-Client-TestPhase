/**
 * utility to handle dynamic file URLs by prepending the backend host if necessary.
 */
export const getFullUrl = (fileUrl: any): string => {
  if (!fileUrl || typeof fileUrl !== 'string') return "";
  
  // If it's a blob URL (temporary local upload), return it exactly as is
  if (fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) return fileUrl;
  
  // Extract path and query from absolute URLs to handle them correctly
  let path = fileUrl;
  if (fileUrl.startsWith('http')) {
    try {
      const urlObj = new URL(fileUrl);
      path = urlObj.pathname + urlObj.search;
    } catch (e) {
      // Fallback to original string if URL parsing fails
      return fileUrl;
    }
  }
  
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  // Use VITE_DOMAIN if available, fallback to extracting from VITE_API_BASE_URL
  let baseUrl = (import.meta.env.VITE_DOMAIN || "").trim();
  
  if (!baseUrl) {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
    // Remove /api/v1 or similar suffix from the base URL
    baseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  }
  
  // Ensure we don't end with a slash as cleanPath starts with one
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  return `${baseUrl}${cleanPath}`;
};
