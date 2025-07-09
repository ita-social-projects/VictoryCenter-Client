import ourTeam from '../../../assets/about-us-images/images/our-team.jpg';
import { teamPageRoute } from '../../../const/routers/routes';
import { GO_TO_TEAM, TEAM_DETAILS } from '../../../const/about-us-page/about-us-page';
import { NavLink } from 'react-router';
import './our-team.scss';

export const OurTeam = () => {
    return (
        <div className="our-team-block">
            <img src={ourTeam} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">{TEAM_DETAILS.FIRST_PART}<br/><br/>{TEAM_DETAILS.SECOND_PART}</p>
                <NavLink to={teamPageRoute} className="link-ro-team">{GO_TO_TEAM}</NavLink>
            </div>
        </div>
    );
};
