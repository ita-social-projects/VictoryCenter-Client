const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@components': path.resolve(__dirname, 'src/components')
        },
    },
};