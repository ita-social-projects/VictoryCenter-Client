import React from 'react';
import styles from './NotFoundIntro.module.scss';
import { ERROR_404 } from '../../../../const/public/notfound-page';

export const NotFoundIntro = () => {
    return (
        <div className={styles['not-found-page-intro-container']}>
            <div className={styles['not-found-page-intro-content']}>
                <h1>{ERROR_404}</h1>
            </div>
        </div>
    );
};
