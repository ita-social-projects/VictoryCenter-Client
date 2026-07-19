import { SafeHtml } from '@/components/common/safe-html';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/public/ui/button';
import { DonateSection } from '../../../public/donate-page/donate-section/DonateSection';
import horseVideo from '@/assets/videos/quote-background.webm';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import styles from './DonationSection.module.scss';
import { MainDonationDto } from '@/types/public/main-page';

interface DonationSectionProps {
    donationData: MainDonationDto | null | undefined;
}
export const DonationSection: React.FC<DonationSectionProps> = ({ donationData }) => {
    const { t } = useTranslation('mainPage');

    return (
        <div className={styles['donation-section']}>
            <div className={styles['video-background-container']}>
                {donationData?.image ? (
                    <img src={donationData?.image} alt="Donation Background" className={styles.backgroundImage} />
                ) : (
                    <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
                        <source src={horseVideo} type="video/webm" />
                    </video>
                )}
            </div>
            <div className={styles.overlay}>
                <div className={styles.heading}>
                    {donationData?.title && <SafeHtml as="h2" className={styles.title} html={donationData?.title} />}
                    {donationData?.description && (
                        <SafeHtml as="p" className={styles.description} html={donationData?.description} />
                    )}
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
