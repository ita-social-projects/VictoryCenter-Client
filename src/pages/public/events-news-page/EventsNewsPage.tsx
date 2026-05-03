import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { EventsNewsIntro } from './event-news-intro/EventsNewsIntro';
import { EventsNewsApi } from '@/services/api/public/events-news/events-new-api';
import { EventsNewsPageData } from '@/types/public/events-news';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';

export const EventsNewsPage = () => {
    const { t } = useTranslation('eventsNewsPage');
    const { data, isLoading, error } = useDataFetch<EventsNewsPageData | null>({
        initialData: null,
        fetchHandler: EventsNewsApi.get,
        autoFetchDependencies: [t],
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && (
                <div>
                    <EventsNewsIntro description={data.description} />
                </div>
            )}
        </LoadableContent>
    );
};
