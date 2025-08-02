import { getEnvVariable } from '../../../utils/functions/get-env-variable/get-env-variable';

export const API_ROUTES = {
    BASE: getEnvVariable('REACT_APP_BACKEND_URL'),
    AUTH: {
        LOGIN: 'auth/login',
        REFRESH_TOKEN: 'auth/refresh-token',
    },
    TEAM: {
        BASE: 'TeamMembers',
        REORDER: 'TeamMembers/reorder',
        CATEGORIES: 'Categories',
        PUBLISHED: 'team/published',
    },
    FAQ: {
        PUBLISHED_SLUG: 'faq/published',
    },
    PAYMENTS: {
        DONATE: 'payments/donate',
    },
    IMAGE: {
        BASE: 'Image',
    },
};
