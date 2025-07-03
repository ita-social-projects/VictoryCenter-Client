export const apiBase = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

export const authEndpoints = {
    login: '/auth/login',
    refresh: '/auth/refresh-token',
};
