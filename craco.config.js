const customJestConfig = require('./jest.config.js');
const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@const': path.resolve(__dirname, 'src/const'),
            '@contexts': path.resolve(__dirname, 'src/contexts'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@app-types': path.resolve(__dirname, 'src/types'),
            '@validation': path.resolve(__dirname, 'src/validation'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@api': path.resolve(__dirname, 'src/services/api'),
            '@services': path.resolve(__dirname, 'src/services/'),
            '@locales': path.resolve(__dirname, 'src/locales/'),
        },
    },
    jest: {
        configure: (defaultJestConfig) => {
            const mergedConfig = {
                ...defaultJestConfig,
                ...customJestConfig,

                moduleNameMapper: {
                    ...defaultJestConfig.moduleNameMapper,
                    ...customJestConfig.moduleNameMapper,

                    '^@components/(.*)$': '<rootDir>/src/components/$1',
                    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
                    '^@const/(.*)$': '<rootDir>/src/const/$1',
                    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
                    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
                    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
                    '^@app-types/(.*)$': '<rootDir>/src/types/$1',
                    '^@validation/(.*)$': '<rootDir>/src/validation/$1',
                    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
                    '^@api/(.*)$': '<rootDir>/src/services/api/$1',
                    '^@services/(.*)$': '<rootDir>/src/services/$1',
                    '^@locales/(.*)$': '<rootDir>/src/locales/$1',
                },
            };

            mergedConfig.transform = {
                '\\.svg$': '<rootDir>/src/jest/svgTransformer.js',
                ...mergedConfig.transform,
            };

            return mergedConfig;
        },
    },
};
