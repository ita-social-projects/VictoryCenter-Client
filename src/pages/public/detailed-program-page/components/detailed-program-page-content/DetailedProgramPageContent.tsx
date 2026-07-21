import React from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import styles from './DetailedProgramPageContent.module.scss';
import { NotFound } from '@/pages/public/not-found-page/NotFound';
import { useProgramBySlug } from '@/hooks/common/use-get-program-by-slug/useGetProgramBySlug';
import { DetailedProgramSection } from '@/components/public/detailed-program-section/DetailedProgramSection';
import { CtaSection } from '@/components/public/cta';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import outroVideo from '@/assets/videos/child-riding-horse.webm';
import { useTranslation } from 'react-i18next';
import { fetchProgramBySlug } from '@/services/api/public/programs/programs-api';
import { DetailedProgramHeader } from '@/components/public/detailed-program-header/DetailedProgramHeader';
import { DetailedProgramDto } from '@/types/public/programs-page';

export const DetailedProgramPageContent: React.FC = () => {
    const { t } = useTranslation('detailedProgramPage');

    const { slug } = useParams<{ slug: string }>();

    const { program, isLoading, error } = useProgramBySlug<DetailedProgramDto>(fetchProgramBySlug, slug);

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
            <DetailedProgramHeader program={program} />
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
