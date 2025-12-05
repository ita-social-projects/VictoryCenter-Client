const customJestConfig = require('./jest.config.js');

module.exports = {
    jest: {
        configure: (defaultJestConfig) => {
            const mergedConfig = {
                ...defaultJestConfig,
                ...customJestConfig,

                moduleNameMapper: {
                    ...defaultJestConfig.moduleNameMapper,
                    ...customJestConfig.moduleNameMapper,
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
