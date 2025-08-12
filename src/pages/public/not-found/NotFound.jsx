import React from 'react';
import { NotFoundMessage } from './notfound-message/NotFoundMessage';
import { NotFoundIntro } from './notfound-intro/NotFoundIntro';
import './NotFound.scss';
export const NotFound = () => {
    return (
        <div className="not-found-page-container">
            <NotFoundIntro />
            <NotFoundMessage />
        </div>
    );
};
