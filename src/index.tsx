import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/mulish';
import { AppRouter } from './routes/app-router/AppRouter';
import './locales/i18n';
import './index.css';
import './assets/fonts/fonts.styles.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <AppRouter />
    </React.StrictMode>,
);
