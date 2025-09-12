import './OurMission.scss';
import { NavLink } from 'react-router';
import ArrowIcon from '../../../../assets/icons/arrow-up-right.svg';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import classNames from 'classnames';

export interface OurMissionProps {
    details: string;
    className?: string;
    navigate?: boolean;
}

export const OurMission = ({ details, className, navigate = true }: OurMissionProps) => {
    return (
        <div className={classNames('our-mission-block', className)}>
            <div className="what-we-do">
                <h2 className="mission-title">{ABOUT_US_DATA.WHAT_WE_DO}</h2>
                <div className="details-block">
                    <p className="mission-details">{details}</p>
                    <NavLink to={navigate ? PUBLIC_ROUTES.PROGRAMS.FULL : ''} className="link-to-programs">
                        <div className="link-block">
                            <span className="link-title">{ABOUT_US_DATA.GO_TO_PROGRAMS}</span>
                            <img src={ArrowIcon} alt="" />
                        </div>
                    </NavLink>
                </div>
            </div>
        </div>
    );
};
