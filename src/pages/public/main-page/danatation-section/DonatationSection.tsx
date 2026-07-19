import horseVideo from '@/assets/videos/quote-background.webm';
import styles from './DonationSection.module.scss';
import { MainDonationDto } from '@/types/public/main-page';

interface DonationSectionProps {
    donationData: MainDonationDto | null | undefined;
}
export const DonationSection: React.FC<DonationSectionProps> = ({ donationData }) => {
    return (
        <div className={styles.donationSection}>
            <div className={styles.videoBackgroundContainer}>
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
                    <h2 className={styles.title}>{donationData?.title}</h2>
                    <p className={styles.description}>{donationData?.description}</p>
                </div>
                <div className={styles.donation}></div>
            </div>
        </div>
    );
};
