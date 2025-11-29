import React from 'react';
import styles from './NotFoundMessage.module.scss';
import { DESCRIPTION, TEXT, GO_BACK_BUTTON } from '../../../../const/public/notfound-page';
import { ReactComponent as ArrowIcon } from '../../../../assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { NavLink } from 'react-router-dom';

export const NotFoundMessage = () => {
    return (
        <div className={styles['not-found-message-container']}>
            <div className={styles['not-found-message-text']}>
                <h1>{TEXT}</h1>
            </div>
            <div className={styles['not-found-message-description']}>
                <p>{DESCRIPTION}</p>
                <NavLink to={PUBLIC_ROUTES.ABOUT_US.FULL} className={styles['link-to-main']}>
                    <div className={styles['link-block']}>
                        <span className={styles['link-title']}>{GO_BACK_BUTTON}</span>
                        <ArrowIcon />
                    </div>
                </NavLink>
            </div>
        </div>
    );
};
