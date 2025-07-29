import './OurTeam.scss';
import ourTeam from '../../../assets/images/public/about-us-images/our-team.jpg';
import { NavLink } from 'react-router';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { publicRoutes } from '../../../../const/routes/public-routes';

export const OurTeam = () => {
    return (
        <div className="our-team-block">
            <img src={ourTeam} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">
                    {ABOUT_US_DATA.TEAM_DETAILS.FIRST_PART}
                    <br />
                    <br />
                    {ABOUT_US_DATA.TEAM_DETAILS.SECOND_PART}
                </p>
                <NavLink to={publicRoutes.TEAM.FULL} className="link-ro-team">
                    {ABOUT_US_DATA.GO_TO_TEAM}
                </NavLink>
            </div>
        </div>
    );
};
