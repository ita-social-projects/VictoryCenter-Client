import { getEnvVariable } from '@/utils/functions/get-env-variable/get-env-variable';

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
        PUBLISHED: 'team/published',
    },
    TEAM_CATEGORIES: {
        BASE: 'TeamCategories',
    },
    PROGRAMS: {
        BASE: 'HippotherapyPrograms',
        SEARCH: 'HippotherapyPrograms/search',
        PUBLISHED: 'HippotherapyPrograms/published',
        BY_SLUG: 'HippotherapyPrograms/slug',
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
        SEARCH: 'faq/search',
        PUBLISHED_BY_SLUG: 'faq/published',
        REORDER: 'faq/reorder',
        PAGES: 'faq/pages',
    },
    DONATE: {
        SUPPORT_OPTIONS: 'SupportOptions',
        BANK_DETAILS_UAH: 'UahBankDetails',
        BANK_DETAILS_FOREIGN: 'ForeignBankDetails',
        CORRESPONDENT_BANK_DETAILS: 'CorrespondentBankDetails',

        PUBLIC: {
            BANK_DETAILS_UAH: 'UahBankDetails/published',
            BANK_DETAILS_FOREIGN: 'ForeignBankDetails/published',
            SUPPORT_OPTIONS: 'SupportOptions/published',
        },
    },
    WHO_WE_ARE: {
        BASE: 'WhoWeAre',
        PREVIEWS: 'WhoWeAre/previews',
        PUBLIC: 'WhoWeArePage',
    },
    LOCALIZATION_LANGUAGE: {
        BASE: 'LocalizationLanguage',
    },
    TEAM_MEMBER_LOCALIZATIONS: {
        BASE: 'TeamMemberLocalizations',
        PUBLIC: {
            TEAM_MEMBER_ID: 'TeamMemberLocalizations/entityId',
            LANGUAGE_ID: 'TeamMemberLocalizations/languageId',
        },
    },
    TEAM_CATEGORY_LOCALIZATIONS: {
        BASE: 'TeamCategoryLocalizations',
    },
    PARTNERS: {
        BASE: 'Partners',
        BANNER: 'Partners/banner',
        SECTIONS: 'Partners/sections',
        PAGE: 'Partners/page',
    },
    REPORTS: {
        MEDIA_SETTINGS: 'Report/report',
        BASE: 'Report',
        FUNDS_EXPENDITURES: {
            SETTINGS: 'ReportFundsExpendituresSettings',
            RECORDS: 'ReportFundsExpendituresRecords',
            CATEGORIES: 'ReportFundsExpendituresCategories',
        },
    },
    PDF_SECTION: {
        BASE: 'PdfSection',
    },
    PDF_REPORTS: {
        BASE: 'PdfReports',
    },
    FAQ_LOCALIZATIONS: {
        BASE: 'FaqQuestionLocalizations',
    },
};
