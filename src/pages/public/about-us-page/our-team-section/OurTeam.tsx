import './OurTeam.scss';
import { NavLink } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@const/public/routes';
import { AboutUsContent } from '@app-types/public/about-us-page';
import { ContentType } from '@app-types/common/about-us';
import { useTranslation } from 'react-i18next';
import defaultOurTeamImage from '@assets/images/public/about-us-page/our-team.jpg';

export interface OurTeamProps {
    content?: AboutUsContent[] | null;
}

export const OurTeam = ({ content }: OurTeamProps) => {
    const { t } = useTranslation('aboutUsPage');

    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? defaultOurTeamImage;
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    return (
        <div className="our-team-block">
            <img src={imageUrl} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">{description}</p>
                <NavLink to={PUBLIC_ROUTES.TEAM.FULL} className="link-to-team">
                    {t('GO_TO_TEAM')}
                </NavLink>
            </div>
        </div>
    );
};
