import background from '@/assets/images/public/about-us-page/background.jpg';
import styles from './IntroSection.module.scss';
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

    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? background;

    return (
        <section className={styles.root}>
            <img src={imageUrl} className={styles.image} alt="Men and Horse" />
            <img src={imageUrl} className={styles.overlay} alt="Men and Horse" />
            <div className={styles.info}>
                <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
                <p className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
            </div>
        </section>
    );
};
