import './OurMission.scss';
import { NavLink } from 'react-router';
import { ReactComponent as ArrowIcon } from '../../../../assets/icons/arrow-up-right.svg';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import classNames from 'classnames';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';

export interface OurMissionProps {
    content?: AboutUsContent[] | null;
    description?: string;
    navigate?: boolean;
    className?: string;
}

export const OurMission = ({ content, description, className, navigate = true }: OurMissionProps) => {
    const descriptionValue = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    return (
        <div className={classNames('our-mission-block', className)}>
            <div className="what-we-do">
                <h2 className="mission-title">{ABOUT_US_DATA.WHAT_WE_DO}</h2>
                <div className="details-block">
                    <p className="mission-details">{description ?? descriptionValue}</p>
                    <NavLink to={navigate ? PUBLIC_ROUTES.PROGRAMS.FULL : ''} className="link-to-programs">
                        <div className="link-block">
                            <span className="link-title">{ABOUT_US_DATA.GO_TO_PROGRAMS}</span>
                            <ArrowIcon className="arrow-icon" />
                        </div>
                    </NavLink>
                </div>
            </div>
        </div>
    );
};
