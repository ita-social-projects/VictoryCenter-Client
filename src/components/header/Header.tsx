import React from 'react';
import {Link} from 'react-router';
import {routes} from '../../const/routers/routes';
import {ReactComponent as VictoryCenterLogo} from '../../assets/images/header/VictoryCenterLogo.svg'
import './Header.scss'

const {userPageRoutes: {page1Route, page2Route}} = routes;

export const Header = () => {
    const onContactUsClick = () => {
        console.log('CONTACT USED!');
    }

    const onDonateClick = () => {
        console.log('DONATE!');
    }

    return (
        <div className="headerBlock">
            <div className="leftContainer">
                <Link to="/">
                    <VictoryCenterLogo className="logo"/>
                </Link>
            </div>

            <div className="middleContainer">
                <nav>
                    <Link to={page1Route}>Про нас</Link>
                    <Link to={page2Route}>Програми</Link>
                    <Link to={page2Route}>Звітність</Link>
                    <Link to={page2Route}>Як підтримати?</Link>
                </nav>
            </div>

            <div className="rightContainer">
                <button className="contactUsButton" onClick={onContactUsClick}>Зв' язатись</button>
                <button className="donateButton" onClick={onDonateClick}>Донатити</button>
            </div>
        </div>
    )
};
