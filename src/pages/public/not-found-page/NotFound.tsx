import React from 'react';
import { NotFoundMessage } from './not-found-message/NotFoundMessage';
import { NotFoundIntro } from './not-found-intro/NotFoundIntro';
import './NotFound.scss';
export const NotFound = () => {
    return (
        <div className="not-found-page-container">
            <NotFoundIntro />
            <NotFoundMessage />
        </div>
    );
};
