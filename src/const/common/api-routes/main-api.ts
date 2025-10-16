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
    PAYMENTS: {
        DONATE: 'payments/donate',
    },
    IMAGE: {
        BASE: 'Image',
    },
    FAQ: {
        PUBLISHED_BY_SLUG: 'faq/published',
    },
    DONATE: {
        SUPPORT_OPTIONS: 'SupportOptions',
        BANK_DETAILS_UAH: 'UahBankDetails',
        BANK_DETAILS_FOREIGN: 'ForeignBankDetails',
        CORRESPONDENT_BANK_DETAILS: 'CorrespondentBankDetails',
    },
};
