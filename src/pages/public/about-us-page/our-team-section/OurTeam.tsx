import './OurTeam.scss';
import { NavLink } from 'react-router';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';

export interface OurTeamProps {
    content?: AboutUsContent[] | null;
}

export const OurTeam = ({ content }: OurTeamProps) => {
    const imageUrl =
        content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? ABOUT_US_DATA.TEAM_DETAILS.IMG;
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    return (
        <div className="our-team-block">
            <img src={imageUrl} alt="Our Team" className="our-team-image" />
            <div className="team-info">
                <p className="team-description">{description}</p>
                <NavLink to={PUBLIC_ROUTES.TEAM.FULL} className="link-ro-team">
                    {ABOUT_US_DATA.GO_TO_TEAM}
                </NavLink>
            </div>
        </div>
    );
};
