import './Header.scss';
import { Link } from 'react-router';
import { ReactComponent as VictoryCenterLogo } from '../../assets/icons/VictoryCenterLogo.svg';
import { publicRoutes } from '../../../const/routes/public-routes';
import { ABOUT_US, CONTACT_US, DONATE, HOW_TO_SUPPORT, PROGRAMS, REPORTING } from '../../../const/public/header';

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
                    <Link to={publicRoutes.ABOUT_US.FULL}>{ABOUT_US}</Link>
                    <Link to={publicRoutes.PROGRAMS.FULL}>{PROGRAMS}</Link>
                    <Link to={publicRoutes.MOCK.FULL}>{REPORTING}</Link>
                    <Link to={publicRoutes.MOCK.FULL}>{HOW_TO_SUPPORT}</Link>
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
