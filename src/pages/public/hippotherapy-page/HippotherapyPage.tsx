import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HippotherapyApi } from '@/services/api/public/hippotherapy/hippotherapy-api';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';
import { HippotherapyIntro } from './intro/HippotherapyIntro';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';

export const HippotherapyPage = () => {
    const { t } = useTranslation('hippotherapy');
    const { data, isLoading, error } = useDataFetch<HippotherapyAbout | null>({
        initialData: null,
        fetchHandler: HippotherapyApi.get,
        autoFetchDependencies: [t],
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && <HippotherapyIntro introData={data.introSection} />}
            <span>{t('SLOGAN')}</span>
        </LoadableContent>
    );
};
