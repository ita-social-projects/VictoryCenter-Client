module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '^swiper/react$': '<rootDir>/src/__mocks__/swiperReactMock.js',
        '^swiper/modules$': '<rootDir>/src/__mocks__/swiperModulesMock.js',
        '\\.(css|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
        '^swiper/css$': '<rootDir>/src/__mocks__/styleMock.js',
        '^swiper/css/navigation$': '<rootDir>/src/__mocks__/styleMock.js',
        '^swiper/css/pagination$': '<rootDir>/src/__mocks__/styleMock.js',
        '^swiper/css/scrollbar$': '<rootDir>/src/__mocks__/styleMock.js',
        '^react-router-dom$': '<rootDir>/src/__mocks__/reactRouterDomMock.js',
    },
    transformIgnorePatterns: ['node_modules/(?!axios)/'],
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
    coveragePathIgnorePatterns: [
        'src/utils/mock-data',
        'src/const',
        'index.ts',
        'index.tsx',
        'react-app-env.d.ts',
        'reportWebVitals.ts',
        '\\.config\\.ts$',
    ],
    coverageThreshold: {
        global: {
            statements: 94.1,
            branches: 87.0,
            functions: 93.4,
            lines: 95.4,
        },
    },
};
