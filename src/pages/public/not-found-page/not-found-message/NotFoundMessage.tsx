import React from 'react';
import './NotFoundMessage.scss';
import { DESCRIPTION, TEXT, GO_BACK_BUTTON } from '@/const/public/notfound-page';
import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { NavLink } from 'react-router-dom';

export const NotFoundMessage = () => {
    return (
        <div className="not-found-message-container">
            <div className="not-found-message-text">
                <h1>{TEXT}</h1>
            </div>
            <div className="not-found-message-description">
                <p>{DESCRIPTION}</p>
                <NavLink to={PUBLIC_ROUTES.ABOUT_US.FULL} className="link-to-main">
                    <div className="link-block">
                        <span className="link-title">{GO_BACK_BUTTON}</span>
                        <ArrowIcon />
                    </div>
                </NavLink>
            </div>
        </div>
    );
};
