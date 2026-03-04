import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HippotherapyApi } from '@/services/api/public/hippotherapy/hippotherapy-api';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';
import { HippotherapyIntro } from './intro/HippotherapyIntro';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { TextCard } from './text-card/TextCard';
import { QuoteSection } from './quote/QuoteSection';
import quote1DefaultImg from '@/assets/images/public/hippotherapy/quote_1.jpg';
import quote2DefaultImg from '@/assets/images/public/hippotherapy/quote_2.jpg';

export const HippotherapyPage = () => {
    const { t } = useTranslation('hippotherapy');
    const { data, isLoading, error } = useDataFetch<HippotherapyAbout | null>({
        initialData: null,
        fetchHandler: HippotherapyApi.get,
        autoFetchDependencies: [t],
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && (
                <>
                    <HippotherapyIntro {...data.introSection} />
                    <section>
                        <TextCard {...data.descriptionSection} />
                    </section>
                    <QuoteSection {...data.quoteSection} imgURL={data.quoteSection.imgURL || quote1DefaultImg} />
                    <QuoteSection
                        {...data.anotherQuoteSection}
                        imgURL={data.anotherQuoteSection.imgURL || quote2DefaultImg}
                    />
                </>
            )}
            <div style={{ textAlign: 'center', padding: '20px' }}>{t('SLOGAN')}</div>
        </LoadableContent>
    );
};
