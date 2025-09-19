import background from '../../../../assets/images/public/about-us-page/background.jpg';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import './AboutUsIntro.scss';

export interface AboutUsIntroProps {
    content?: AboutUsContent[] | null;
}

export const AboutUsIntro = ({ content }: AboutUsIntroProps) => {
    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? background;
    const title = content?.find((x) => x.contentType === ContentType.Title)?.title ?? '';
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description ?? '';

    return (
        <div className="about-us-block">
            <img src={imageUrl} className="background-img" alt="Men and Horse" />
            <img src={imageUrl} className="color-overlay" alt="Men and Horse" />
            <div className="about-us-info">
                <h1 className="about-us-main-title">{title}</h1>
                <div className="title-details">
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
};
