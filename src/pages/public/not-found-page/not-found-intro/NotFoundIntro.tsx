import React from 'react';
import './NotFoundIntro.scss';
import { ERROR_404 } from '@/const/public/notfound-page';

export const NotFoundIntro = () => {
    return (
        <div className="not-found-page-intro-container">
            <div className="not-found-page-intro-content">
                <h1>{ERROR_404}</h1>
            </div>
        </div>
    );
};
