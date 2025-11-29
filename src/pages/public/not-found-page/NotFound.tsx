import React from 'react';
import { NotFoundMessage } from './not-found-message/NotFoundMessage';
import { NotFoundIntro } from './not-found-intro/NotFoundIntro';
import styles from './NotFound.module.scss';
export const NotFound = () => {
    return (
        <div className={styles['not-found-page-container']}>
            <NotFoundIntro />
            <NotFoundMessage />
        </div>
    );
};
