import { BackgroundMedia } from '@/components/public/background-media/BackgroundMedia';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { InfoItem } from '@/pages/public/detailed-program-page/components/info-item/InfoItem';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { DetailedProgramDto } from '@/types/public/programs-page';
import { ReactComponent as MapPin } from '@/assets/icons/map-pin.svg';
import { ReactComponent as UsersRound } from '@/assets/icons/users-round.svg';
import { ReactComponent as CalendarDays } from '@/assets/icons/calendar-days.svg';
import styles from './DetailedProgramHeader.module.scss';

export const DetailedProgramHeader: React.FC<{ program: DetailedProgramDto }> = ({ program }) => {
    const normalizedLocalizations = (program?.localizations ?? []).map((localization) =>
        mapLocalizationDtoToModel(localization),
    );

    const { name, description, partCount, meetingCount, location } = useGetLocalization(normalizedLocalizations, {
        name: program?.name,
        description: program?.description,
        partCount: program?.participantsCount,
        meetingCount: program?.meetingsCount,
        location: program?.location,
    });
    return (
        <div className={styles['background-section']}>
            {program.backgroundImage && (
                <div className={styles['background-media-wrapper']}>
                    <BackgroundMedia
                        mediaUrl={getImageSrc(program.backgroundImage)}
                        className={styles['background-gradient']}
                    />
                    <div className={styles['content-container']}>
                        <div className={styles['left-section']}>
                            <div>
                                <h1 className={styles['program-name']}>{name}</h1>
                                <div className={styles['program-info']}>
                                    {location && <InfoItem icon={MapPin} text={location} />}
                                    {partCount && <InfoItem icon={UsersRound} text={partCount} />}
                                </div>
                                <div className={styles['program-meetings']}>
                                    {meetingCount && <InfoItem icon={CalendarDays} text={meetingCount} />}
                                </div>
                            </div>
                        </div>
                        <div className={styles['right-section']}>
                            <p className={styles['description']}>{description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
