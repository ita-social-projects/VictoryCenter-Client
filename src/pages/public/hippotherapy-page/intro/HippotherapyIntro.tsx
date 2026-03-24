import { SafeHtml } from '@/components/common/safe-html';
import introImg from '@/assets/images/man-touching-white-horse-side.webp';
import { HippotherapyIntroData } from '@/types/public/hippotherapy-page';
import styles from './HippotherapyIntro.module.scss';

export const HippotherapyIntro = ({ imgURL, imgAlternativeText, title, description }: HippotherapyIntroData) => {
    return (
        <>
            <section className={styles.root}>
                <img src={imgURL || introImg} alt={imgAlternativeText ?? 'Людина і кінь'} className={styles.image} />
                <div className={styles.info}>
                    <SafeHtml as="h1" html={title ?? ''} className={styles.title} />
                    <SafeHtml as="p" html={description ?? ''} className={styles.description} />
                </div>
            </section>
        </>
    );
};
