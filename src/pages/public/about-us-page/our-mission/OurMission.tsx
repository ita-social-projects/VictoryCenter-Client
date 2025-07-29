import './OurMission.scss';
import { NavLink } from 'react-router';
import ArrowIcon from '../../../assets/icons/arrow-up-right.svg';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { ScrollableFrame } from '../../../../components/common/scrollable-frame/ScrollableFrame';
import { publicRoutes } from '../../../../const/routes/public-routes';

export const OurMission = () => {
    return (
        <div className="our-mission-block">
            <div className="what-we-do">
                <h2 className="mission-title">{ABOUT_US_DATA.WHAT_WE_DO}</h2>
                <div className="details-block">
                    <p className="mission-details">{ABOUT_US_DATA.WHAT_WE_DO_DETAILS}</p>
                    <NavLink to={publicRoutes.PROGRAMS.FULL} className="link-to-programs">
                        <div className="link-block">
                            <span className="link-title">{ABOUT_US_DATA.GO_TO_PROGRAMS}</span>
                            <img src={ArrowIcon} alt="" />
                        </div>
                    </NavLink>
                </div>
            </div>
            <ScrollableFrame />
        </div>
    );
};
