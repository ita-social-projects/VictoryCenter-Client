import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../const/routers/routes';
import { ReactComponent as VictoryCenterLogo } from '../../assets/images/header/VictoryCenterLogo.svg';
import { ABOUT_US, PROGRAMS, REPORTING, HOW_TO_SUPPORT, CONTACT_US, DONATE } from '../../const/header/header';
import './Header.scss';

const {
    userPageRoutes: { teamPageRoute, page2Route },
} = routes;

export const Header = () => {
    const onContactUsClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('CONTACT USED!');
    };

    const onDonateClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('DONATE!');
    };

    return (
        <div className="headerBlock">
            <div className="logoContainer">
                <Link to="/">
                    <VictoryCenterLogo className="logo" />
                </Link>
            </div>

            <div className="linkContainer">
                <nav>
                    <Link to={teamPageRoute}>{ABOUT_US}</Link>
                    <Link to={page2Route}>{PROGRAMS}</Link>
                    <Link to={page2Route}>{REPORTING}</Link>
                    <Link to={page2Route}>{HOW_TO_SUPPORT}</Link>
                </nav>
            </div>

            <div className="buttonContainer">
                <button className="contactUsButton" onClick={onContactUsClick}>
                    {CONTACT_US}
                </button>
                <button className="donateButton" onClick={onDonateClick}>
                    {DONATE}
                </button>
            </div>
        </div>
    );
};
