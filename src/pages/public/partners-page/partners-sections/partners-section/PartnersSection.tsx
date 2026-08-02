import React, { useMemo } from 'react';
import { PartnerSection } from '@/types/public/partners-page';
import styles from './PartnersSection.module.scss';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

interface PartnersSectionProps {
    section: PartnerSection | null;
}

export const PartnersSection = ({ section }: PartnersSectionProps) => {
    const { currentLanguage } = useLocale();

    const normalizedLocalizations = useMemo(
        () => (section?.localizations ?? []).map((localization) => mapLocalizationDtoToModel(localization)),
        [section?.localizations],
    );

    const { title, description } = useGetLocalization(normalizedLocalizations, {
        title: section?.title ?? '',
        description: section?.description ?? '',
    });

    if (!section) {
        return null;
    }

    return (
        <section className={styles['partners-content-section']}>
            <div className={styles.container}>
                <div className={styles['partners-header']}>
                    <h2 className={styles['section-title']}>{title}</h2>
                    <p className={styles['section-description']}>{description}</p>
                </div>
                <div className={styles['partners-logos']}>
                    {section.partners.map((partner) => {
                        const translatedDescription = partner.localizations?.find(
                            (localization) => localization.localizationInfoDto?.code === currentLanguage,
                        )?.description;

                        return (
                            <div key={partner.id} className={styles['partner-item']}>
                                <img
                                    src={getImageSrc(partner.image)}
                                    alt={`${partner.id} logo`}
                                    className={styles['partner-logo']}
                                />
                                <p className={styles['partner-name']}>{translatedDescription ?? partner.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
