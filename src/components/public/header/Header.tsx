import './Header.scss';
import { Link } from 'react-router';
import { ReactComponent as VictoryCenterLogo } from '../../../assets/icons/logo-wth-text.svg';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
import { ABOUT_US, CONTACT_US, DONATE, HOW_TO_SUPPORT, PROGRAMS, REPORTING } from '../../../const/public/header';

export const Header = () => {
    const onContactUsClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('CONTACT USED!');
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
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{ABOUT_US}</Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{PROGRAMS}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {REPORTING}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {HOW_TO_SUPPORT}
                    </Link>
                </nav>
            </div>

            <div className="buttonContainer">
                <button className="contactUsButton" onClick={onContactUsClick}>
                    {CONTACT_US}
                </button>
                <Link to={PUBLIC_ROUTES.DONATE.FULL} className="button donateButton">
                    {DONATE}
                </Link>
            </div>
        </div>
    );
};
