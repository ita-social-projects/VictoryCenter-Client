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
        SEARCH: 'TeamMembers/search',
        REORDER: 'TeamMembers/reorder',
        CATEGORIES: 'teamcategories',
        PUBLISHED: 'team/published',
    },
    PROGRAMS: {
        BASE: 'HippotherapyPrograms',
        PUBLISHED: 'HippotherapyPrograms/published',
    },
    PROGRAMCATEGORY: {
        BASE: 'HippotherapyProgramCategories',
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
        PREVIEWS: 'WhoWeAre/previews',
        PUBLIC: 'WhoWeArePage',
    },
    PARTNERS: {
        BASE: 'Partners',
        BANNER: 'Partners/banner',
        SECTIONS: 'Partners/section',
    },
};
