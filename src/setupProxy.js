const { createProxyMiddleware } = require('http-proxy-middleware');
const { getEnvVariable } = require('./src/utils/functions/getEnvVariable');

module.exports = (app) => {
    const backendUrl = getEnvVariable('REACT_APP_BACKEND_URL');
    const targetUrl = getEnvVariable('REACT_APP_PROXY_TARGET');

    app.use(
        backendUrl,
        createProxyMiddleware({
            target: targetUrl,
            changeOrigin: true,
            secure: false,
        })
    );
};
