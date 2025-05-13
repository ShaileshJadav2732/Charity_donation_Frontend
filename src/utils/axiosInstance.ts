import axios from 'axios';
import Cookies from 'js-cookie';

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Redirect to login page if unauthorized
            if (typeof window !== 'undefined') {
                // Clear cookies
                Cookies.remove('token');
                Cookies.remove('authToken');

                // Redirect to login page
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);