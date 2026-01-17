import React from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import styles from './DetailedProgramPageContent.module.scss';
import { ReactComponent as MapPin } from '@/assets/icons/map-pin.svg';
import { ReactComponent as UsersRound } from '@/assets/icons/users-round.svg';
import { ReactComponent as CalendarDays } from '@/assets/icons/calendar-days.svg';
import { useProgramBySlug } from '@/hooks/common/use-get-program-by-slug/useGetProgramBySlug';
import { InfoItem } from '../info-item/InfoItem';

const getProgramImageUrl = (backgroundImage: { url: string } | { mimeType: string; base64: string }): string => {
    return 'url' in backgroundImage
        ? backgroundImage.url
        : `data:${backgroundImage.mimeType};base64,${backgroundImage.base64}`;
};

export const DetailedProgramPageContent: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const { program, isLoading, error } = useProgramBySlug(slug);

    if (isLoading) {
        return (
            <div className={styles['detailed-program-page-content']}>
                <LinearProgress />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className={styles['detailed-program-page-content']}>
                <div className={styles['error-message']} role="alert">
                    Failed to load program details
                </div>
            </div>
        );
    }

    return (
        <div className={styles['detailed-program-page-content']}>
            <div className={styles['background-section']}>
                {program.backgroundImage && (
                    <>
                        <img
                            src={getProgramImageUrl(program.backgroundImage)}
                            className={styles['background-image']}
                            alt={`${program.name} background`}
                        />
                        <div className={styles['overlay']} />
                    </>
                )}
                <div className={styles['content-container']}>
                    <div className={styles['left-section']}>
                        <div>
                            <h1 className={styles['program-name']}>{program.name}</h1>
                            {(program.location || program.participantsCount) && (
                                <div className={styles['program-info']}>
                                    {program.location && <InfoItem icon={MapPin} text={program.location} />}
                                    {program.participantsCount && (
                                        <InfoItem icon={UsersRound} text={program.participantsCount} />
                                    )}
                                </div>
                            )}
                            {program.meetingsCount && (
                                <div className={styles['program-meetings']}>
                                    <InfoItem icon={CalendarDays} text={program.meetingsCount} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles['right-section']}>
                        <p className={styles['description']}>{program.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
