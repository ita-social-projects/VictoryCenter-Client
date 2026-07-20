import { getEnvVariable } from '@/utils/functions/get-env-variable/get-env-variable';

export const API_ROUTES = {
    BASE: getEnvVariable('REACT_APP_BACKEND_URL'),
    AUTH: {
        LOGIN: 'auth/login',
        LOGOUT: 'auth/logout',
        REFRESH_TOKEN: 'auth/refresh-token',
    },
    MAIN_PAGE: {
        BASE: 'MainPage',
        PUBLIC: 'MainPage',
    },
    MAIN_PAGE_LOCALIZATIONS: {
        BASE: 'MainPageLocalizations',
    },
    COMPANY_PROFILE: {
        BASE: 'CompanyProfile',
        PUBLIC: 'CompanyProfile',
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
    WHO_WE_ARE_CONTENT_LOCALIZATIONS: {
        BASE: 'WhoWeAreContentLocalizations',
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
    PROGRAM_LOCALIZATIONS: {
        BASE: 'HippotherapyProgramLocalizations',
        PUBLIC: {
            PROGRAM_ID: 'HippotherapyProgramLocalizations/entityId',
            LANGUAGE_ID: 'HippotherapyProgramLocalizations/languageId',
        },
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
            SUMMARY: 'ReportFundsExpendituresRecords/summary',
            CATEGORIES: 'ReportFundsExpendituresCategories',
            PUBLISH: 'admin/report-funds-expenditures/publish',
            PUBLIC: 'ReportFundsExpenditures',
        },
        PROGRAM_EXPENDITURES_RECORDS: 'ReportProgramExpendituresRecords',
    },
    PDF_SECTION: {
        BASE: 'PdfSection',
        CONTENT: 'PdfSection/pdf-section',
    },
    PDF_SECTION_LOCALIZATIONS: {
        BASE: 'PdfSectionLocalizations',
    },
    PDF_REPORTS: {
        BASE: 'PdfReports',
        BY_LANGUAGE_ID: 'PdfReports/languageId',
    },
    FAQ_LOCALIZATIONS: {
        BASE: 'FaqQuestionLocalizations',
    },
    REPORT_FUNDS_EXPENDITURES_CATEGORY_LOCALIZATIONS: {
        BASE: 'ReportFundsExpendituresCategoryLocalizations',
    },
    REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS: {
        BASE: 'ReportFundsExpendituresSettingsLocalizations',
    },
    HISTORY: {
        BASE: 'History',
        PUBLIC: 'History',
    },
    CONTACT_US: 'ContactUs',

    HISTORY_LOCALIZATIONS: {
        BASE: 'HistoryLocalizations',
    },
};
