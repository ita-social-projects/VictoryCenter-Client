import { SafeHtml } from '@/components/common/safe-html';
import introImg from '@/assets/images/public/hippotherapy/intro.jpg';
import { HippotherapyIntroData } from '@/types/public/hippotherapy-page';
import styles from './HippotherapyIntro.module.scss';

export const HippotherapyIntro = ({ introData }: { introData: HippotherapyIntroData }) => {
    const { imgURL, imgAlternativeText, title, description } = introData;
    return (
        <>
            <section className={styles.root}>
                <img src={imgURL || introImg} alt={imgAlternativeText} className={styles.image} />
                <div className={styles.info}>
                    <SafeHtml as="h1" html={title ?? ''} className={styles.title} />
                    <SafeHtml as="p" html={description ?? ''} className={styles.description} />
                </div>
            </section>
        </>
    );
};
