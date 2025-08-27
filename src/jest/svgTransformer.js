const path = require('path');

module.exports = {
    process(src, filename) {
        const iconName = path.basename(filename, '.svg');
        return {
            code: `
        const React = require('react');
        module.exports = {
          __esModule: true,
          default: ${JSON.stringify(iconName + '-icon')},
          ReactComponent: (props) => React.createElement('svg', { ...props, 'data-testid': ${JSON.stringify(iconName + '-icon')} })
        };
      `,
        };
    },
};
