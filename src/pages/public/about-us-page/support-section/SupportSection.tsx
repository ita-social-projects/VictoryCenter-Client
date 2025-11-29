import { useTranslation } from 'react-i18next';
import { SupportSectionTablet } from './components/support-section-tablet/SupportSectionTablet';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SupportCard } from './components/support-card/SupportCard';
import styles from './SupportSection.module.scss';
import { AboutUsContent } from '../../../../types/public/about-us-page';

export interface SupportSectionProps {
    content: AboutUsContent[] | null;
}

const SWIPER_CONFIG = {
    slidesPerView: 1,
    breakpoints: {
        1025: { slidesPerView: 3 },
    },
} as const;

export const SupportSection = ({ content }: SupportSectionProps) => {
    const { t } = useTranslation('aboutUsPage');
    const isTablet = useMediaQuery('(min-width:768px) and (max-width:1024px)');

    if (isTablet) return <SupportSectionTablet content={content} stylesModule={styles} />;

    return (
        <div className={styles['support-block']}>
            <Swiper
                items={content}
                {...SWIPER_CONFIG}
                stylesModule={styles}
                renderItem={(item, index) => (
                    <>
                        {index === 0 && (
                            <div className={styles['main-values-title']}>
                                <h2>{t('SUPPORT_TITLE')}</h2>
                            </div>
                        )}
                        <SupportCard card={item} index={index} stylesModule={styles} />
                    </>
                )}
            />
        </div>
    );
};
