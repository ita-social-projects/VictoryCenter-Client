import background from '@/assets/images/man-facing-horse-forehead.webp';
import styles from './IntroSection.module.scss';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import { SafeHtml } from '@/components/common/safe-html';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';

export interface AboutUsIntroProps {
    content?: AboutUsContent[] | null;
}

export const AboutUsIntro = ({ content }: AboutUsIntroProps) => {
    const titleContent = content?.find((x) => x.contentType === ContentType.Title);
    const { title } = useGetLocalization(titleContent?.localizations, {
        title: titleContent?.title,
    });

    const descriptionContent = content?.find((x) => x.contentType === ContentType.Description);
    const { description } = useGetLocalization(descriptionContent?.localizations, {
        description: descriptionContent?.description,
    });

    const imageUrl = content?.find((x) => x.contentType === ContentType.Image)?.image?.url ?? background;

    return (
        <section className={styles.root}>
            <img src={imageUrl} className={styles.image} alt="Men and Horse" />
            <img src={imageUrl} className={styles.overlay} alt="Men and Horse" />
            <div className={styles.info}>
                <SafeHtml as="h1" className={styles.title} html={title ?? ''} />
                <SafeHtml as="p" className={styles.description} html={description ?? ''} />
            </div>
        </section>
    );
};
