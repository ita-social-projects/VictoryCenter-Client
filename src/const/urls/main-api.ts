import { getEnvVariable } from '../../utils/functions/detEnvVariable/get-env-variable';

export const API_ROUTES = {
    BASE: getEnvVariable('REACT_APP_BACKEND_URL'),
    AUTH: {
        LOGIN: 'auth/login',
        REFRESH_TOKEN: 'auth/refresh-token',
    },
    TEAM: {
        PUBLISHED: 'team/published',
    },
    FAQ: {
        PUBLISHED_SLUG: 'faq/published',
    },
};
