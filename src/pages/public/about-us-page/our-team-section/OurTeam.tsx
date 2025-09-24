import ourTeam from '../../../../assets/images/public/about-us-page/our-team.jpg';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import './OurTeam.scss';

export const OurTeam = () => {
    const { t } = useTranslation('aboutUsPage');

    return (
        <div className="our-team-block">
            <img src={ourTeam} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">
                    {t('TEAM_DETAILS.FIRST_PART')}
                    <br />
                    <br />
                    {t('TEAM_DETAILS.SECOND_PART')}
                </p>
                <NavLink to={PUBLIC_ROUTES.TEAM.FULL} className="link-ro-team">
                    {t('GO_TO_TEAM')}
                </NavLink>
            </div>
        </div>
    );
};
