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
    EVENTS_AND_NEWS: {
        PATH: 'events-and-news',
        FULL: '/events-and-news',
    },
    HIPPOTHERAPY: {
        PATH: 'hippotherapy',
        FULL: '/hippotherapy',
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
    CONTACT_US: {
        PATH: 'contact-us',
        FULL: '/contact-us',
    },
    SUPPORT_US: {
        PATH: 'support-us',
        FULL: '/support-us',
    },
    MOCK: {
        PATH: 'about-us',
        FULL: '/about-us',
    },
};
