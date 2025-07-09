import { NavLink } from 'react-router';
import { ScrollableFrame } from '../../../components/common/scrollable-program-frame/ScrollableFrame';
import ArrowIcon from '../../../assets/program_page_images/icons/arrow-up-black.png';
import { WHAT_WE_DO, WHAT_WE_DO_DETAILS, GO_TO_PROGRAMS } from '../../../const/about-us-page/about-us-page';
import { programPage } from '../../../const/routers/routes';
import './our-mission.scss';

export const OurMission = () => {
    
    return (
        <div className="our-mission-block">
            <div className="what-we-do">
                <h2 className="mission-title">{WHAT_WE_DO}</h2>
                <div className="details-block">
                    <p className="mission-details">
                        {WHAT_WE_DO_DETAILS}
                    </p>
                    <NavLink to={programPage} className="link-to-programs">
                        <div className="link-block">
                            <span className="link-title">{GO_TO_PROGRAMS}</span>
                            <img src={ArrowIcon} alt=""/>
                        </div>
                    </NavLink>
                </div>
            </div>
            <ScrollableFrame/>
        </div>
    );
};
