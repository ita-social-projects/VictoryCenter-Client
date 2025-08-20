import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppRouter } from './routes/app-router/AppRouter';
import './assets/fonts/fonts.styles.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <AppRouter />
    </React.StrictMode>,
);
