import { HippotherapySectionLocalizationApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';
import { EthicsSectionLocalizationsApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/ethics-section-localizations-api';
import {
    AdvantagesSectionLocalizationsApi,
    ParticipantsSectionLocalizationsApi,
} from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/gallery-sections-localizations-api';
import { HippoventionCenterSectionLocalizationsApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/hippovention-center-section-localizations-api';
import {
    AnotherQuoteSectionLocalizationsApi,
    QuoteSectionLocalizationsApi,
} from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/quote-sections-localizations-api';
import { ScientificReferencesSectionLocalizationsApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/scientific-references-section-localizations-api';
import {
    AnalysisSectionLocalizationsApi,
    DescriptionSectionLocalizationsApi,
    HippoventionSectionLocalizationsApi,
    IntroSectionLocalizationsApi,
} from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/text-card-sections-localizations-api';
import { HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';

const SECTION_LOCALIZATION_API_MAP: Record<HippotherapyPageLocalizationBlock, HippotherapySectionLocalizationApi> = {
    [HippotherapyPageLocalizationBlock.Intro]: IntroSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Description]: DescriptionSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Hippovention]: HippoventionSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Analysis]: AnalysisSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Quote]: QuoteSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.AnotherQuote]: AnotherQuoteSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.HippoventionCenter]: HippoventionCenterSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Advantages]: AdvantagesSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Participants]: ParticipantsSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.Ethics]: EthicsSectionLocalizationsApi,
    [HippotherapyPageLocalizationBlock.ScientificReferences]: ScientificReferencesSectionLocalizationsApi,
};

export const getHippotherapySectionLocalizationApi = (
    block: HippotherapyPageLocalizationBlock,
): HippotherapySectionLocalizationApi | null => {
    return SECTION_LOCALIZATION_API_MAP[block] ?? null;
};
