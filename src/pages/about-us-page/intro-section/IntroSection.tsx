import background from '../../../assets/about-us-images/images/background.jpg';
import {INTRO_TITLE, INTRO_DETAILS} from '../../../const/about-us-page/about-us-page';
import './intro-section.scss';

export const AboutUsIntro = () => {
    
    return (
        <div className="about-us-block">
            <img src={background} className="background-img" alt="Men and Horse"/>
            <img src={background} className="color-overlay" alt="Men and Horse"/>
            <h1 className="about-us-main-title">
                <span className="highlighted">
                    {INTRO_TITLE.FIRST_HIGHLIGHT}
                </span>
                {INTRO_TITLE.MIDDLE_PART}
                <span className="highlighted">
                    {INTRO_TITLE.SECOND_HIGHLIGHT}
                </span></h1>
            <div className="title-details">
                {INTRO_DETAILS.FIRST_LINE}<br/>
                {INTRO_DETAILS.SECOND_LINE}<br/>
                {INTRO_DETAILS.THIRD_LINE}<br/><br/>
                {INTRO_DETAILS.FOURTH_LINE}<br/>
                {INTRO_DETAILS.FIFTH_LINE}</div>
        </div>
    );
};
