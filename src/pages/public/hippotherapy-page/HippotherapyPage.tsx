import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
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
import { ContactSection } from '../programs-page/contact-section/ContactSection';
import { EthicalPrinciples } from './ethical-principles/EthicalPrinciples';
import { ResearchSection } from './research/ResearchSection';
import { FaqSection } from '@/components/public/faq-section/FaqSection';
import { PAGE_SLUGS } from '@/const/public/faq';

export const HippotherapyPage = () => {
    const { t } = useTranslation('hippotherapy');
    const { currentLanguage } = useLocale();

    const fetchHandler = useCallback(() => HippotherapyApi.get(currentLanguage), [currentLanguage]);

    const { data, isLoading, error } = useDataFetch<HippotherapyAbout | null>({
        initialData: null,
        fetchHandler,
        autoFetchDependencies: [currentLanguage, t],
    });

    return (
        <LoadableContent isLoading={isLoading} error={error || !data}>
            {data && (
                <>
                    <HippotherapyIntro
                        {...data.introSection}
                        imgAlternativeText={data.introSection.imgAlternativeText || t('ALT.INTRO_IMAGE')}
                    />
                    <TextCard {...data.descriptionSection} />
                    <QuoteSection
                        {...data.quoteSection}
                        imgURL={data.quoteSection.imgURL || quote1DefaultImg}
                        imgAlternativeText={data.quoteSection.imgAlternativeText || t('ALT.QUOTE_IMAGE')}
                    />
                    <TextCard {...data.hippoventionSection} />
                    <SloganSection />
                    <HippoventionCenter
                        {...data.hippoventionCenterSection}
                        imgAlternativeText={data.hippoventionCenterSection.imgAlternativeText || t('ALT.CENTER_IMAGE')}
                    />
                    <SwipedGallery title={data.advantagesSection.title} cards={data.advantagesSection.advantages} />
                    <TextCard {...data.analysisSection} />
                    <ResearchSection {...data.researchSection} />
                    <QuoteSection
                        {...data.anotherQuoteSection}
                        imgURL={data.anotherQuoteSection.imgURL || quote2DefaultImg}
                        imgAlternativeText={data.anotherQuoteSection.imgAlternativeText || t('ALT.ANOTHER_QUOTE_IMAGE')}
                    />
                    <SwipedGallery
                        title={data.participantsSection.title}
                        cards={data.participantsSection.participants}
                    />
                    <EthicalPrinciples
                        {...data.ethicsSection}
                        imgAlternativeText={data.ethicsSection.imgAlternativeText || t('ALT.ETHICS_IMAGE')}
                    />
                    <FaqSection slug={PAGE_SLUGS.ABOUT_HYPPOTHERAPY} />
                    <ContactSection />
                </>
            )}
        </LoadableContent>
    );
};
