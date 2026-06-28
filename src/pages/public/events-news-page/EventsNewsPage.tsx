import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { EventsNewsIntro } from './event-news-intro/EventsNewsIntro';
import { Events } from './events/Events';
import { ChooseProgram } from './choose-program/ChooseProgram';
import { EventsNewsPageApi } from '@/services/api/public/events-news/events-new-page-api';
import { EventsNewsPageData } from '@/types/public/events-news';

export const EventsNewsPage = () => {
    const { t } = useTranslation('eventsNewsPage');
    const { data, isLoading, error } = useDataFetch<EventsNewsPageData | null>({
        initialData: null,
        fetchHandler: EventsNewsPageApi.get,
        autoFetchDependencies: [t],
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && (
                <div>
                    <EventsNewsIntro description={data.description} />
                    <Events {...data.eventsData} />
                    <ChooseProgram {...data.chooseProgram} />
                </div>
            )}
        </LoadableContent>
    );
};
