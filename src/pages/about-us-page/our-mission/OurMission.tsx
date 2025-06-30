import {Link} from 'react-router-dom';
import ArrowIcon from '../../../assets/program_page_images/icons/arrow-up-black.png';
import {ScrollableFrame} from "../../../components/common/scrollable-program-frame/ScrollableFrame";
import './our-mission.scss';
export const OurMission = () => {
    
    return (
        <div className="our-mission-block">
            <div className="what-we-do">
                <h2 className="mission-title">Що ми робимо</h2>
                <div className="details-block">
                    <p className="mission-details">
                        Ми створюємо терапевтичні програми, які поєднують взаємодію
                        з кіньми, тілесні практики, контакт із природою, психологічний
                        супровід, спільноту підтримки. Кожна програма адаптується під
                        індивідуальні запити учасників/ць групи.
                    </p>
                    <Link to="/" className="link-to-programs">
                        <div className="link-block">
                            <span className="link-title">Перейти до програм</span>
                            <img src={ArrowIcon} alt=""/>
                        </div>
                    </Link>
                </div>
            </div>
            <ScrollableFrame/>
        </div>
    );
};
