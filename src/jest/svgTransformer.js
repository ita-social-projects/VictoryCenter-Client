module.exports = {
    process() {
        return {
            code: `
        			const React = require('react');
        			module.exports = {
          			__esModule: true,
          			default: "svg-mock",
          			ReactComponent: (props) => React.createElement('svg', props),
        			};	
     			 `,
        };
    },
};
