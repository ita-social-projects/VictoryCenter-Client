import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_US_DATA } from '@/const/public/support-us-page';
import styles from './PartnersSection.module.scss';

const CAPTION_KEYS = [
    'PARTNERS.DESCRIPTION.FIRST_TEXT',
    'PARTNERS.DESCRIPTION.SECOND_TEXT',
    'PARTNERS.DESCRIPTION.THIRD_TEXT',
] as const;

export const PartnersSection: React.FC = () => {
    const { t } = useTranslation('supportUsPage');

    return (
        <section className={styles.root} aria-labelledby="partners-section-title">
            <h2 id="partners-section-title" className={styles.title}>
                {t('PARTNERS.TITLE')}
            </h2>
            <ul className={styles.list}>
                {SUPPORT_US_DATA.PARTNERS_DATA.map((partner, index) => (
                    <li key={partner.id} className={styles.item}>
                        <img className={styles.image} src={partner.IMG} alt={partner.ALT} />
                        <p className={styles.caption}>{t(CAPTION_KEYS[index])}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};
