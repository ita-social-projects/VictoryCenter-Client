import './OurTeam.scss';
import ourTeam from '../../../../assets/images/public/about-us-page/our-team.jpg';
import { NavLink } from 'react-router';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';

export const OurTeam = () => {
    return (
        <div className="our-team-block">
            <img src={ourTeam} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">{ABOUT_US_DATA.TEAM_DETAILS}</p>
                <NavLink to={PUBLIC_ROUTES.TEAM.FULL} className="link-to-team">
                    {ABOUT_US_DATA.GO_TO_TEAM}
                </NavLink>
            </div>
        </div>
    );
};
