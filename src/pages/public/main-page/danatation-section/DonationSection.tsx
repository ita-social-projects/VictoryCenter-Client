import { SafeHtml } from '@/components/common/safe-html';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/public/ui/button';
import { DonateSection } from '../../../public/donate-page/donate-section/DonateSection';
import horseVideo from '@/assets/videos/quote-background.webm';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import styles from './DonationSection.module.scss';
import { MainDonationDto } from '@/types/public/main-page';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

interface DonationSectionProps {
    donationData: MainDonationDto | null | undefined;
}

const getLocalizedDonationTitle = (donationData: MainDonationDto, currentLanguage: string): string => {
    const loc = donationData.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.title ?? donationData.title ?? '';
};

const getLocalizedDonationDescription = (donationData: MainDonationDto, currentLanguage: string): string => {
    const loc = donationData.localizations?.find((l) => l.localizationInfoDto?.code === currentLanguage);
    return loc?.description ?? donationData.description ?? '';
};

export const DonationSection: React.FC<DonationSectionProps> = ({ donationData }) => {
    const { t } = useTranslation('mainPage');
    const { currentLanguage } = useLocale();

    const title = donationData ? getLocalizedDonationTitle(donationData, currentLanguage) : '';
    const description = donationData ? getLocalizedDonationDescription(donationData, currentLanguage) : '';
    const imageSrc = getImageSrc(donationData?.image);

    return (
        <div className={styles['donation-section']}>
            <div className={styles['video-background-container']}>
                {imageSrc ? (
                    <img src={imageSrc} alt="Donation Background" className={styles.backgroundImage} />
                ) : (
                    <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
                        <source src={horseVideo} type="video/webm" />
                    </video>
                )}
            </div>
            <div className={styles.overlay}>
                <div className={styles.heading}>
                    {title && <SafeHtml as="h2" className={styles.title} html={title} />}
                    {description && <SafeHtml as="p" className={styles.description} html={description} />}
                </div>
                <div className={styles.donation}>
                    <DonateSection />
                    <Button
                        href={PUBLIC_ROUTES.DONATE.FULL}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary-light"
                        className={styles.button}
                    >
                        {t('VIEW')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
