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
                <p>{INTRO_DETAILS.FIRST_LINE}</p>
                <p>{INTRO_DETAILS.SECOND_LINE}</p>
                <p>{INTRO_DETAILS.THIRD_LINE}</p>
                <p className="paragraph-break">{INTRO_DETAILS.FOURTH_LINE}</p>
                <p>{INTRO_DETAILS.FIFTH_LINE}</p>
            </div>
        </div>
    );
};
