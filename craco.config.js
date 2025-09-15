module.exports = {
    jest: {
        configure: (jestConfig) => {
            const newTransform = {
                '\\.svg$': '<rootDir>/src/jest/svgTransformer.js',
                ...jestConfig.transform,
            };

            jestConfig.transform = newTransform;

            return jestConfig;
        },
    },
};
