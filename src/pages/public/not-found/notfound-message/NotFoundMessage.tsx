import React from 'react';
import './NotFoundMessage.scss';
import { ERROR_404_DESCRIPTION, ERROR_404_TEXT, ERROR_404_GO_BACK } from '../../../../const/public/notfound-page';
import ArrowIcon from '../../../../assets/icons/arrow-up-right.svg';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { NavLink } from 'react-router';

export const NotFoundMessage = () => {
    return (
        <div className="not-found-message-container">
            <div className="not-found-message-text">
                <h1>{ERROR_404_TEXT}</h1>
            </div>
            <div className="not-found-message-description">
                <p>{ERROR_404_DESCRIPTION.FIRST_PART}</p>
                <p>{ERROR_404_DESCRIPTION.SECOND_PART}</p>
                <NavLink to={PUBLIC_ROUTES.ABOUT_US.FULL} className="link-to-main">
                    <div className="link-block">
                        <span className="link-title">{ERROR_404_GO_BACK}</span>
                        <img src={ArrowIcon} alt="" />
                    </div>
                </NavLink>
            </div>
        </div>
    );
};
