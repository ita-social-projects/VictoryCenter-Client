import background from '../../../../assets/images/public/about-us-page/background.jpg';
import './IntroSection.scss';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

export interface AboutUsIntroProps {
    content?: AboutUsContent[] | null;
}

export const AboutUsIntro = ({ content }: AboutUsIntroProps) => {
    // TODO: Replace with real title when rich text component is implemented
    // const title = content?.find((x) => x.contentType === ContentType.Title)?.title;

    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? background;
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description;

    return (
        <div className="about-us-block">
            <img src={imageUrl} className="background-img" alt="Men and Horse" />
            <img src={imageUrl} className="color-overlay" alt="Men and Horse" />
            <div className="about-us-info">
                <h1 className="about-us-main-title">
                    <span className="highlighted">{ABOUT_US_DATA.INTRO_TITLE.FIRST_HIGHLIGHT}</span>
                    {ABOUT_US_DATA.INTRO_TITLE.MIDDLE_PART}
                    <span className="highlighted">{ABOUT_US_DATA.INTRO_TITLE.SECOND_HIGHLIGHT}</span>
                </h1>
                <div className="title-details">
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
};
