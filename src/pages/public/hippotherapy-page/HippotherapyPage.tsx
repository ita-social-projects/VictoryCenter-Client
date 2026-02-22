import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useTranslation } from 'react-i18next';
import { HippotherapyApi } from '@/services/api/public/hippotherapy/hippotherapy-api';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';
import { HippotherapyIntro } from './intro/HippotherapyIntro';

export const HippotherapyPage = () => {
    const { t } = useTranslation('hippotherapy');
    const { data, isLoading, error } = useDataFetch<HippotherapyAbout | null>({
        initialData: null,
        fetchHandler: HippotherapyApi.get,
        autoFetchDependencies: [t],
    });
    return (
        <>
            {data && <HippotherapyIntro introData={data.introSection} />}
            <span>{t('SLOGAN')}</span>
        </>
    );
};
