const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(
        process.env.REACT_APP_BACKEND_URL,
        createProxyMiddleware({
            target: 'https://staging-api.victorycenter.com',
            changeOrigin: true,
            secure: false,
        })
    );
};
