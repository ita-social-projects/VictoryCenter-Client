import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import background from '../../../../assets/images/public/about-us-page/background.jpg';
import './IntroSection.scss';

export const AboutUsIntro = () => {
    return (
        <div className="about-us-block">
            <img src={background} className="background-img" alt="Man and Horse" />
            <img src={background} className="color-overlay" alt="Man and Horse" />
            <h1 className="about-us-main-title">
                <span className="highlighted">{ABOUT_US_DATA.INTRO_TITLE.FIRST_HIGHLIGHT}</span>
                {ABOUT_US_DATA.INTRO_TITLE.MIDDLE_PART}
                <span className="highlighted">{ABOUT_US_DATA.INTRO_TITLE.SECOND_HIGHLIGHT}</span>
            </h1>
            <div className="title-details">
                <p>{ABOUT_US_DATA.INTRO_DETAILS.FIRST_LINE}</p>
                <p>{ABOUT_US_DATA.INTRO_DETAILS.SECOND_LINE}</p>
                <p>{ABOUT_US_DATA.INTRO_DETAILS.THIRD_LINE}</p>
                <p className="paragraph-break">{ABOUT_US_DATA.INTRO_DETAILS.FOURTH_LINE}</p>
                <p>{ABOUT_US_DATA.INTRO_DETAILS.FIFTH_LINE}</p>
            </div>
        </div>
    );
};
