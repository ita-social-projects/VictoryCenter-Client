import React, { useCallback } from 'react';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { EventsNewsIntro } from './event-news-intro/EventsNewsIntro';
import { Events } from './events/Events';
import { ChooseProgram } from './choose-program/ChooseProgram';
import { EventsNewsPageApi } from '@/services/api/public/events-news/events-new-page-api';
import { EventsNewsPageData } from '@/types/public/events-news';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { RequestOptions } from '@/types/common/api';
import { useTranslation } from 'react-i18next';
import CHOOSE_PROGRAM_IMAGE from '@/assets/images/horse-and-girl.webp';
export const EventsNewsPage = () => {
    const { currentLanguage } = useLocale();
    const { t } = useTranslation('eventsNewsPage');
    const fetchPageData = useCallback((options?: RequestOptions) => EventsNewsPageApi.get(options), [currentLanguage]);

    const { data, isLoading, error } = useDataFetch<EventsNewsPageData | null>({
        initialData: null,
        fetchHandler: fetchPageData,
        autoFetchDependencies: [currentLanguage],
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && (
                <div>
                    <EventsNewsIntro description={data.description} isHidden={data.isPageDescriptionHidden} />
                    <Events {...data.eventsData} isTitleHidden={data.isEventsBlockTitleHidden} />
                    <ChooseProgram
                        title={t('CHOOSE_PROGRAM_TITLE')}
                        description={t('CHOOSE_PROGRAM_DESCRIPTION')}
                        imgURL={CHOOSE_PROGRAM_IMAGE}
                    />
                </div>
            )}
        </LoadableContent>
    );
};
