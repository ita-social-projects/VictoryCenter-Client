import './OurTeam.scss';
import { NavLink } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { useTranslation } from 'react-i18next';
import defaultOurTeamImage from '@/assets/images/public/about-us-page/our-team.jpg';
import DOMPurify from 'dompurify';

export interface OurTeamProps {
    content?: AboutUsContent[] | null;
}

export const OurTeam = ({ content }: OurTeamProps) => {
    const { t } = useTranslation('aboutUsPage');

    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? defaultOurTeamImage;
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    const sanitizedDescription =
        DOMPurify.sanitize(description ?? '', {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
            ALLOWED_ATTR: [],
        }) || '';

    return (
        <div className="our-team-block">
            <img src={imageUrl} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                <NavLink to={PUBLIC_ROUTES.TEAM.FULL} className="link-to-team">
                    {t('GO_TO_TEAM')}
                </NavLink>
            </div>
        </div>
    );
};
