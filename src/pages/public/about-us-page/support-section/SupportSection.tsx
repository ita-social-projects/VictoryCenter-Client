import { useTranslation } from 'react-i18next';
import { SupportSectionTablet } from './components/support-section-tablet/SupportSectionTablet';
import { Swiper } from '@/components/public/swiper/Swiper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SupportCard } from './components/support-card/SupportCard';
import styles from './SupportSection.module.scss';
import { AboutUsContent } from '@/types/public/about-us-page';
import { ReactComponent as ArrowRight } from '@/assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeft } from '@/assets/icons/arrow-left.svg';
export interface SupportSectionProps {
    content: AboutUsContent[] | null;
}

export const SupportSection = ({ content }: SupportSectionProps) => {
    const { t } = useTranslation('aboutUsPage');

    const isTablet = useMediaQuery('(min-width:560px) and (max-width:1439px)');

    if (isTablet) return <SupportSectionTablet content={content} />;

    return (
        <div className={styles.root}>
            <Swiper
                items={content}
                slidesPerView={'auto'}
                renderItem={(item, index) => (
                    <>
                        {index === 0 && (
                            <div className={styles.title}>
                                <h2>{t('SUPPORT_TITLE')}</h2>
                            </div>
                        )}
                        <SupportCard card={item} index={index} />
                    </>
                )}
                classNameSwiperSlide={styles[`swiper-slide`]}
                navigationButtons={{
                    prev: {
                        icon: ArrowLeft,
                        ariaLabel: 'back',
                        variant: 'primary-dark',
                        className: styles.left,
                    },
                    next: {
                        icon: ArrowRight,
                        ariaLabel: 'next',
                        variant: 'primary-dark',
                        className: styles.right,
                    },
                }}
            />
        </div>
    );
};
