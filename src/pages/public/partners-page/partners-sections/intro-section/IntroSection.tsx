import { useMemo } from 'react';
import styles from './IntroSection.module.scss';
import background from '@/assets/images/horses.webp';
import { PartnersBanner } from '@/types/public/partners-page';
import DOMPurify from 'dompurify';
import { SafeHtml } from '@/components/common/safe-html';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

export interface IntroSectionProps {
    banner: PartnersBanner | null;
}

export const IntroSection = ({ banner }: IntroSectionProps) => {
    const normalizedLocalizations = useMemo(
        () => (banner?.localizations ?? []).map((localization) => mapLocalizationDtoToModel(localization)),
        [banner?.localizations],
    );

    const { title, description } = useGetLocalization(normalizedLocalizations, {
        title: banner?.title ?? '',
        description: banner?.description ?? '',
    });

    if (!banner) {
        return null;
    }

    const imageUrl = getImageSrc(banner.image) || background;

    const sanitizedTitle = DOMPurify.sanitize(title, {
        ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br'],
        ALLOWED_ATTR: [],
    });

    return (
        <div className={styles['intro-block']}>
            <img src={imageUrl} className={styles['bg-img']} alt="Horses" />
            <div className={styles.overlay}>
                <SafeHtml as="h1" className={styles.title} html={sanitizedTitle} />
                <p className={styles.subtitle}>{description}</p>
            </div>
        </div>
    );
};
