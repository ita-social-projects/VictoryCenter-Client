import { HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';
import { getHippotherapySectionLocalizationApi } from './get-hippotherapy-section-localization-api';
import {
    AnalysisSectionLocalizationsApi,
    DescriptionSectionLocalizationsApi,
    HippoventionSectionLocalizationsApi,
    IntroSectionLocalizationsApi,
} from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/text-card-sections-localizations-api';
import {
    AnotherQuoteSectionLocalizationsApi,
    QuoteSectionLocalizationsApi,
} from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/quote-sections-localizations-api';
import { HippoventionCenterSectionLocalizationsApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/hippovention-center-section-localizations-api';
import {
    AdvantagesSectionLocalizationsApi,
    ParticipantsSectionLocalizationsApi,
} from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/gallery-sections-localizations-api';
import { EthicsSectionLocalizationsApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/ethics-section-localizations-api';
import { ScientificReferencesSectionLocalizationsApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-localizations-api/scientific-references-section-localizations-api';

describe('getHippotherapySectionLocalizationApi', () => {
    const EXPECTED_SERVICES = [
        [HippotherapyPageLocalizationBlock.Intro, IntroSectionLocalizationsApi, 'Intro'],
        [HippotherapyPageLocalizationBlock.Description, DescriptionSectionLocalizationsApi, 'Description'],
        [HippotherapyPageLocalizationBlock.Hippovention, HippoventionSectionLocalizationsApi, 'Hippovention'],
        [HippotherapyPageLocalizationBlock.Analysis, AnalysisSectionLocalizationsApi, 'Analysis'],
        [HippotherapyPageLocalizationBlock.Quote, QuoteSectionLocalizationsApi, 'Quote'],
        [HippotherapyPageLocalizationBlock.AnotherQuote, AnotherQuoteSectionLocalizationsApi, 'AnotherQuote'],
        [
            HippotherapyPageLocalizationBlock.HippoventionCenter,
            HippoventionCenterSectionLocalizationsApi,
            'HippoventionCenter',
        ],
        [HippotherapyPageLocalizationBlock.Advantages, AdvantagesSectionLocalizationsApi, 'Advantages'],
        [HippotherapyPageLocalizationBlock.Participants, ParticipantsSectionLocalizationsApi, 'Participants'],
        [HippotherapyPageLocalizationBlock.Ethics, EthicsSectionLocalizationsApi, 'Ethics'],
        [
            HippotherapyPageLocalizationBlock.ScientificReferences,
            ScientificReferencesSectionLocalizationsApi,
            'ScientificReferences',
        ],
    ] as const;

    it.each(EXPECTED_SERVICES)('returns corresponding API service for %s', (block, expectedApi) => {
        const api = getHippotherapySectionLocalizationApi(block);

        expect(api).toBe(expectedApi);
        expect(api).toBeDefined();
        expect(typeof api?.create).toBe('function');
        expect(typeof api?.update).toBe('function');
    });

    it('returns null for unknown or unsupported block', () => {
        const invalidBlock = 999 as HippotherapyPageLocalizationBlock;
        const api = getHippotherapySectionLocalizationApi(invalidBlock);

        expect(api).toBeNull();
    });
});
