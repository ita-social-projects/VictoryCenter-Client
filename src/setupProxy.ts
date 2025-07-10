import { Application } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { getEnvVariable } from './utils/functions/getEnvVariable';

const backendUrl = getEnvVariable('REACT_APP_BACKEND_URL');
const targetUrl = getEnvVariable('REACT_APP_PROXY_TARGET');

module.exports = (app: Application) => {
    app.use(
        backendUrl,
        createProxyMiddleware({
            target: targetUrl,
            changeOrigin: true,
            secure: false,
        }),
    );
};
