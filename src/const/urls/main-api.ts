export const apiBase = process.env.REACT_APP_BACKEND_URL ?? '/api';

export const authEndpoints = {
    login: '/auth/login',
    refresh: '/auth/refresh-token',
};
