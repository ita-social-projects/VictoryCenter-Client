import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HippotherapyApi } from '@/services/api/public/hippotherapy/hippotherapy-api';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';
import { HippotherapyIntro } from './intro/HippotherapyIntro';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { TextCard } from './text-card/TextCard';
import { QuoteSection } from './quote/QuoteSection';
import quote1DefaultImg from '@/assets/images/man-holding-horse-cheek-close.webp';
import quote2DefaultImg from '@/assets/images/man-facing-horse-forehead.webp';
import { SloganSection } from './slogan/SloganSection';
import { HippoventionCenter } from './hippovention-center/HippoventionCenter';
import { SwipedGallery } from './swiped-gallery/SwipedGallery';

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
                    <TextCard {...data.descriptionSection} />
                    <QuoteSection {...data.quoteSection} imgURL={data.quoteSection.imgURL || quote1DefaultImg} />
                    <TextCard {...data.hippoventionSection} />
                    <SloganSection />
                    <HippoventionCenter {...data.hippoventionCenterSection} />
                    <SwipedGallery title={data.advantagesSection.title} cards={data.advantagesSection.advantages} />
                    <TextCard {...data.analysisSection} />
                    <QuoteSection
                        {...data.anotherQuoteSection}
                        imgURL={data.anotherQuoteSection.imgURL || quote2DefaultImg}
                    />
                    <SwipedGallery
                        title={data.participantsSection.title}
                        cards={data.participantsSection.participants}
                    />
                </>
            )}
        </LoadableContent>
    );
};
