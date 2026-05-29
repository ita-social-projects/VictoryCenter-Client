const customJestConfig = require('./jest.config.js');
const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    devServer: {
        proxy: {
            '/api': {
                target: 'https://localhost:5001/',
                changeOrigin: true,
                secure: false,
            },
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

                    '^@/(.*)$': '<rootDir>/src/$1',
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
