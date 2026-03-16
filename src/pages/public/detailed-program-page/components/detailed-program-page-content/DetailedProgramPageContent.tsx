import React from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import styles from './DetailedProgramPageContent.module.scss';
import { NotFound } from '@/pages/public/not-found-page/NotFound';
import { BackgroundMedia } from '@/components/public/background-media/BackgroundMedia';
import { ReactComponent as MapPin } from '@/assets/icons/map-pin.svg';
import { ReactComponent as UsersRound } from '@/assets/icons/users-round.svg';
import { ReactComponent as CalendarDays } from '@/assets/icons/calendar-days.svg';
import { useProgramBySlug } from '@/hooks/common/use-get-program-by-slug/useGetProgramBySlug';
import { InfoItem } from '../info-item/InfoItem';
import { DetailedProgramSection } from '@/components/public/detailed-program-section/DetailedProgramSection';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import outroVideo from '@/assets/videos/public/detailed-program-page/support_program_background.mp4';
import { useTranslation } from 'react-i18next';

export const DetailedProgramPageContent: React.FC = () => {
    const { t } = useTranslation('detailedProgramPage');

    const { slug } = useParams<{ slug: string }>();

    const { program, isLoading, error } = useProgramBySlug(slug);

    if (isLoading || (!program && !error)) {
        return (
            <div className={styles['detailed-program-page-content']}>
                <LinearProgress />
            </div>
        );
    }

    if (error || !program) {
        return <NotFound />;
    }

    const hasSections = program.sections && program.sections.length > 0;

    return (
        <div className={styles['detailed-program-page-content']}>
            <div className={styles['background-section']}>
                {program.backgroundImage && (
                    <div className={styles['background-media-wrapper']}>
                        <BackgroundMedia
                            mediaUrl={program.backgroundImage.url}
                            className={styles['background-gradient']}
                        />
                        <div className={styles['content-container']}>
                            <div className={styles['left-section']}>
                                <div>
                                    <h1 className={styles['program-name']}>{program.name}</h1>
                                    <div className={styles['program-info']}>
                                        {program.location && <InfoItem icon={MapPin} text={program.location} />}
                                        {program.participantsCount && (
                                            <InfoItem icon={UsersRound} text={program.participantsCount} />
                                        )}
                                    </div>
                                    <div className={styles['program-meetings']}>
                                        {program.meetingsCount && (
                                            <InfoItem icon={CalendarDays} text={program.meetingsCount} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles['right-section']}>
                                <p className={styles['description']}>{program.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {hasSections && (
                <div className={styles['sections-list']}>
                    {program.sections.map((section, index) => (
                        <DetailedProgramSection key={section.id ?? `${section.template}-${index}`} section={section} />
                    ))}
                </div>
            )}
            <CtaSection
                title={t('SUPPORT_PROGRAM_TITLE')}
                description={t('SUPPORT_PROGRAM_DETAILS')}
                mediaUrl={outroVideo}
                buttons={[
                    { label: t('DONATE'), href: PUBLIC_ROUTES.DONATE.FULL },
                    { label: t('BECOME_PARTNER'), href: PUBLIC_ROUTES.DONATE.FULL },
                ]}
            />
        </div>
    );
};
