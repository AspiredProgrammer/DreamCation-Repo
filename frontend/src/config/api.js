// API Configuration
// Use API Gateway endpoint for all requests
// In development, proxy handles it. In production, use full URL.

const getApiBaseUrl = () => {
	// In production, use the API Gateway endpoint from env
	if (process.env.NODE_ENV === 'production') {
		// Use REACT_APP_ prefixed env var (accessible in browser)
		let url = process.env.REACT_APP_API_GATEWAY_ENDPOINT || 'https://dreamcation-api-gateway.vercel.app';
		// Remove trailing slash if present (we'll add it with path)
		return url.endsWith('/') ? url.slice(0, -1) : url;
	}
	// In development, use relative paths (proxy handles it)
	return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to build full API URLs
export const apiUrl = (path) => {
	// Ensure path starts with /
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	// If no base URL (development), return path as-is (proxy handles it)
	if (!API_BASE_URL) {
		return cleanPath;
	}
	// In production, combine base URL with path
	return `${API_BASE_URL}${cleanPath}`;
};

