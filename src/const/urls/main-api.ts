import { getEnvVariable } from '../../utils/functions/getEnvVariable';

export const API_ROUTES = {
    BASE: getEnvVariable('REACT_APP_BACKEND_URL'),
    AUTH: {
        LOGIN: 'auth/login',
        REFRESH_TOKEN: 'auth/refresh-token',
    },
};
