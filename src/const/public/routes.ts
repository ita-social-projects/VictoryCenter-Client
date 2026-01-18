export const PUBLIC_ROUTES = {
    ROOT: '/',
    TEAM: {
        PATH: 'team',
        FULL: '/team',
    },
    PARTNERS: {
        PATH: 'partners-page',
        FULL: '/partners-page',
    },
    ABOUT_US: {
        PATH: 'about-us',
        FULL: '/about-us',
    },
    PROGRAMS: {
        PATH: 'programs',
        FULL: '/programs',
    },
    PROGRAM_DETAIL: {
        PATH: 'programs/:slug',
        FULL: '/programs/:slug',
        getPath: (slug: string) => `/programs/${slug}`,
    },
    DONATE: {
        PATH: 'donate',
        FULL: '/donate',
    },
    REPORTS: {
        PATH: 'reports',
        FULL: '/reports',
    },
    MOCK: {
        PATH: 'about-us',
        FULL: '/about-us',
    },
};
