import './OurMission.scss';
import { NavLink } from 'react-router';
import ArrowIcon from '../../../../assets/icons/arrow-up-right.svg';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { PUBLIC_ROUTES } from '../../../../const/public/routes';
import { ScrollableFrame } from './scrollable-frame/ScrollableFrame';

interface OurMissionProps {
    mainText?: string;
}
export const OurMission = ({ mainText = ABOUT_US_DATA.WHAT_WE_DO_DETAILS }: OurMissionProps) => {
    return (
        <div className="our-mission-block">
            <div className="what-we-do">
                <h2 className="mission-title">{ABOUT_US_DATA.WHAT_WE_DO}</h2>
                <div className="details-block">
                    <p className="mission-details">{mainText}</p>
                    <NavLink to={PUBLIC_ROUTES.PROGRAMS.FULL} className="link-to-programs">
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
