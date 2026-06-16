import { SafeHtml } from '@/components/common/safe-html';
import { Button } from '@/components/public/ui/button';
import { MainIntroData } from '@/types/public/main-page';

import styles from './IntroSection.module.scss';

interface IntroSectionProps {
    introData: MainIntroData;
    buttonHref: string;
}

export const IntroSection = ({ introData, buttonHref }: IntroSectionProps) => {
    return (
        <section className={styles.root}>
            <img src={introData.image} className={styles.image} alt="" aria-hidden="true" />
            <div className={styles.overlay} />
            <div className={styles.content}>
                <SafeHtml as="h1" className={styles.title} html={introData.title} />
                <div className={styles.bottomContent}>
                    <SafeHtml as="p" className={styles.description} html={introData.description} />
                    <Button href={buttonHref} variant="secondary-dark" className={styles.button}>
                        {introData.buttonText}
                    </Button>
                </div>
            </div>
        </section>
    );
};
