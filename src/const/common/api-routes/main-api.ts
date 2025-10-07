import { getEnvVariable } from '../../../utils/functions/get-env-variable/get-env-variable';

export const API_ROUTES = {
    BASE: getEnvVariable('REACT_APP_BACKEND_URL'),
    AUTH: {
        LOGIN: 'auth/login',
        LOGOUT: 'auth/logout',
        REFRESH_TOKEN: 'auth/refresh-token',
    },
    TEAM: {
        BASE: 'TeamMembers',
        REORDER: 'TeamMembers/reorder',
        CATEGORIES: 'Categories',
        PUBLISHED: 'team/published',
    },
    PROGRAMS: {
        BASE: 'Programs',
        PUBLISHED: 'Programs/published',
    },
    PROGRAMCATEGORY: {
        BASE: 'ProgramCategory',
    },
    PAYMENTS: {
        DONATE: 'payments/donate',
    },
    IMAGE: {
        BASE: 'Image',
    },
    FAQ: {
        BASE: 'faq',
        PUBLISHED_BY_SLUG: 'faq/published',
        REORDER: 'faq/reorder',
        PAGES: 'faq/pages',
    },
    WHO_WE_ARE: {
        BASE: 'WhoWeAre',
        PUBLIC: 'WhoWeArePage',
    },
};
