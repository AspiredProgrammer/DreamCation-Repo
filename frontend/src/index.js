import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handler to suppress browser extension errors
window.addEventListener('error', (event) => {
	// Suppress errors from browser extensions (content_script.js)
	if (
		event.filename && 
		(event.filename.includes('content_script.js') || 
		 event.filename.includes('extension://') ||
		 event.message && event.message.includes('content_script'))
	) {
		event.preventDefault();
		// Optionally log for debugging (remove in production)
		if (process.env.NODE_ENV === 'development') {
			console.warn('Browser extension error suppressed:', event.message);
		}
		return false;
	}
}, true);

// Suppress unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
	if (
		event.reason && 
		typeof event.reason === 'string' &&
		(event.reason.includes('content_script') || 
		 event.reason.includes('extension'))
	) {
		event.preventDefault();
		if (process.env.NODE_ENV === 'development') {
			console.warn('Browser extension promise rejection suppressed:', event.reason);
		}
		return false;
	}
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
