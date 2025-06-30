export const apiBase = 'https://localhost:5001/api';

export const authEndpoints = {
    login: `${apiBase}/auth/login`,
    refresh: `${apiBase}/auth/refresh-token`,
};
