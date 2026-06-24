import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { DetailedProgramHeader } from '@/components/public/detailed-program-header/DetailedProgramHeader';
import { NotFound } from '@/pages/public/not-found-page/NotFound';
import { DetailedProgramSection } from '@/components/public/detailed-program-section/DetailedProgramSection';
import { useProgramBySlug } from '@/hooks/common/use-get-program-by-slug/useGetProgramBySlug';
import { EventNewsApi } from '@/services/api/public/events-news/events-news-api';
import styles from './DetailedEventNewsPage.module.scss';

export const DetailedEventNewsPage = () => {
    const { slug } = useParams();

    const { program: eventNews, isLoading, error } = useProgramBySlug(EventNewsApi.get, slug);
    console.log('eventNews', eventNews);

    if (isLoading || (!eventNews && !error)) {
        return (
            <div className={styles['detailed-event-news-page']}>
                <LinearProgress />
            </div>
        );
    }

    if (error || !eventNews) {
        return <NotFound />;
    }

    const hasSections = eventNews.sections && eventNews.sections.length > 0;

    return (
        <div className={styles['detailed-event-news-page']}>
            <DetailedProgramHeader program={eventNews} />
            {hasSections && (
                <div className={styles['sections-list']}>
                    {eventNews.sections.map((section, index) => (
                        <DetailedProgramSection key={section.id ?? `${section.template}-${index}`} section={section} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DetailedEventNewsPage;
