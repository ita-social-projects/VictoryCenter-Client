import background from '@/assets/images/public/about-us-page/background.jpg';
import styles from './IntroSection.module.scss';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';

export interface AboutUsIntroProps {
    content?: AboutUsContent[] | null;
}

export const AboutUsIntro = ({ content }: AboutUsIntroProps) => {
    // TODO: Replace with real title when rich text component is implemented
    const title = content?.find((x) => x.contentType === ContentType.Title)?.title;
    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? background;
    const description = content?.find((x) => x.contentType === ContentType.Description)?.description;

    return (
        <section className={styles.root}>
            <img src={imageUrl} className={styles.image} alt="Men and Horse" />
            <img src={imageUrl} className={styles.overlay} alt="Men and Horse" />
            <div className={styles.info}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.description}>{description}</p>
            </div>
        </section>
    );
};
