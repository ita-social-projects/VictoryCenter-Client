import background from '@/assets/images/public/about-us-page/background.jpg';
import './IntroSection.scss';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import DOMPurify from 'dompurify';

export interface AboutUsIntroProps {
    content?: AboutUsContent[] | null;
}

export const AboutUsIntro = ({ content }: AboutUsIntroProps) => {
    const title = content?.find((x) => x.contentType === ContentType.Title)?.title;

    const sanitizedTitle =
        DOMPurify.sanitize(title ?? '', {
            ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br'],
            ALLOWED_ATTR: [],
        }) || '';

    const description = content?.find((x) => x.contentType === ContentType.Description)?.description;

    const sanitizedDescription =
        DOMPurify.sanitize(description ?? '', {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br'],
            ALLOWED_ATTR: [],
        }) || '';

    // TODO: Replace with real title when rich text component is implemented
    // const title = content?.find((x) => x.contentType === ContentType.Title)?.title;
    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? background;

    return (
        <section className="about-us-block">
            <img src={imageUrl} className="background-img" alt="Men and Horse" />
            <img src={imageUrl} className="color-overlay" alt="Men and Horse" />
            <div className="about-us-info">
                <h1 className="about-us-main-title" dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
                <p className="title-details" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
            </div>
        </section>
    );
};
