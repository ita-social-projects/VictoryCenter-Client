import React from 'react';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Swiper } from '@/components/public/swiper/Swiper';
import { SUPPORT_US_DATA } from '@/const/public/support-us-page';
import { PartnersCard } from './partners-card/PartnersCard';
import styles from './PartnersSection.module.scss';

type PartnerData = (typeof SUPPORT_US_DATA.PARTNERS_DATA)[number];

const CAPTION_KEYS = [
    'PARTNERS.DESCRIPTION.FIRST_TEXT',
    'PARTNERS.DESCRIPTION.SECOND_TEXT',
    'PARTNERS.DESCRIPTION.THIRD_TEXT',
] as const;

const SWIPER_NAVIGATION_CONFIG = {
    prev: {
        className: styles.left,
    },
    next: {
        className: styles.right,
    },
};

export const PartnersSection: React.FC = () => {
    const { t } = useTranslation('supportUsPage');
    const isMobile = useMediaQuery('(max-width:559px)');

    const renderPartnerCard = (partner: PartnerData, index: number) => (
        <PartnersCard imageUrl={partner.IMG} altText={partner.ALT} caption={t(CAPTION_KEYS[index])} />
    );

    return (
        <section className={styles.root} aria-labelledby="partners-section-title">
            <h2 id="partners-section-title" className={styles.title}>
                {t('PARTNERS.TITLE')}
            </h2>
            {isMobile ? (
                <div className={styles['mobile-swiper']}>
                    <Swiper
                        items={SUPPORT_US_DATA.PARTNERS_DATA}
                        renderItem={renderPartnerCard}
                        classNameSwiperSlide={styles['swiper-slide']}
                        navigationButtons={SWIPER_NAVIGATION_CONFIG}
                    />
                </div>
            ) : (
                <ul className={styles.list}>
                    {SUPPORT_US_DATA.PARTNERS_DATA.map((partner, index) => (
                        <li key={partner.id} className={styles.item}>
                            <img className={styles.image} src={partner.IMG} alt={partner.ALT} />
                            <p className={styles.caption}>{t(CAPTION_KEYS[index])}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
