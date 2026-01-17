import React from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import styles from './DetailedProgramPageContent.module.scss';
import { ReactComponent as MapPin } from '@/assets/icons/map-pin.svg';
import { ReactComponent as UsersRound } from '@/assets/icons/users-round.svg';
import { ReactComponent as CalendarDays } from '@/assets/icons/calendar-days.svg';
import { useProgramBySlug } from '@/hooks/common/use-get-program-by-slug/useGetProgramBySlug';

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
                            src={
                                'url' in program.backgroundImage
                                    ? program.backgroundImage.url
                                    : `data:${program.backgroundImage.mimeType};base64,${program.backgroundImage.base64}`
                            }
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
                                    {program.location && (
                                        <span className={styles['info-item']}>
                                            <MapPin width={24} height={24} />
                                            {program.location}
                                        </span>
                                    )}
                                    {program.participantsCount && (
                                        <span className={styles['info-item']}>
                                            <UsersRound width={24} height={24} />
                                            {program.participantsCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            {program.meetingsCount && (
                                <div className={styles['program-meetings']}>
                                    <span className={styles['info-item']}>
                                        <CalendarDays width={24} height={24} />
                                        {program.meetingsCount}
                                    </span>
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
