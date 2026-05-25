import React from 'react';
import { useTranslation } from 'react-i18next';
import veteransImg from '@/assets/images/support-veterans.webp';
import volunteersImg from '@/assets/images/support-volunteers.webp';
import childrenImg from '@/assets/images/support-children.webp';
import styles from './PartnerTypesSection.module.scss';

export const PartnerTypesSection: React.FC = () => {
    const { t } = useTranslation('support-us');

    const partners = [
        { img: veteransImg, text: t('partner1Text') },
        { img: volunteersImg, text: t('partner2Text') },
        { img: childrenImg, text: t('partner3Text') },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>{t('partnersSectionTitle')}</h2>
                <div className={styles.cards}>
                    {partners.map((partner, index) => (
                        <div key={index} className={styles.card} style={{ backgroundImage: `url(${partner.img})` }}>
                            <p className={styles.cardText}>{partner.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
