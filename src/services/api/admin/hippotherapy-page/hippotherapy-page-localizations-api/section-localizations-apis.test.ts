import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    AnalysisSectionLocalizationsApi,
    DescriptionSectionLocalizationsApi,
    HippoventionSectionLocalizationsApi,
    IntroSectionLocalizationsApi,
} from './text-card-sections-localizations-api';
import { AnotherQuoteSectionLocalizationsApi, QuoteSectionLocalizationsApi } from './quote-sections-localizations-api';
import {
    AdvantagesSectionLocalizationsApi,
    ParticipantsSectionLocalizationsApi,
} from './gallery-sections-localizations-api';
import { EthicsSectionLocalizationsApi } from './ethics-section-localizations-api';
import { HippoventionCenterSectionLocalizationsApi } from './hippovention-center-section-localizations-api';
import { ScientificReferencesSectionLocalizationsApi } from './scientific-references-section-localizations-api';
import { HippotherapySectionLocalizationApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';

interface SectionServiceCase {
    name: string;
    api: HippotherapySectionLocalizationApi;
    expectedBaseUrl: string;
}

const SECTION_SERVICES: SectionServiceCase[] = [
    {
        name: 'IntroSectionLocalizationsApi',
        api: IntroSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.INTRO_SECTION.BASE,
    },
    {
        name: 'DescriptionSectionLocalizationsApi',
        api: DescriptionSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.DESCRIPTION_SECTION.BASE,
    },
    {
        name: 'HippoventionSectionLocalizationsApi',
        api: HippoventionSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.HIPPOVENTION_SECTION.BASE,
    },
    {
        name: 'AnalysisSectionLocalizationsApi',
        api: AnalysisSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ANALYSIS_SECTION.BASE,
    },
    {
        name: 'QuoteSectionLocalizationsApi',
        api: QuoteSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.QUOTE_SECTION.BASE,
    },
    {
        name: 'AnotherQuoteSectionLocalizationsApi',
        api: AnotherQuoteSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ANOTHER_QUOTE_SECTION.BASE,
    },
    {
        name: 'HippoventionCenterSectionLocalizationsApi',
        api: HippoventionCenterSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.HIPPOVENTION_CENTER_SECTION.BASE,
    },
    {
        name: 'AdvantagesSectionLocalizationsApi',
        api: AdvantagesSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ADVANTAGES_SECTION.BASE,
    },
    {
        name: 'ParticipantsSectionLocalizationsApi',
        api: ParticipantsSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.PARTICIPANTS_SECTION.BASE,
    },
    {
        name: 'EthicsSectionLocalizationsApi',
        api: EthicsSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ETHICS_SECTION.BASE,
    },
    {
        name: 'ScientificReferencesSectionLocalizationsApi',
        api: ScientificReferencesSectionLocalizationsApi,
        expectedBaseUrl: API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.SCIENTIFIC_REFERENCES_SECTION.BASE,
    },
];

describe('Hippotherapy Section Localizations APIs Endpoints', () => {
    let mockClient: jest.Mocked<Pick<AxiosInstance, 'post' | 'put'>>;

    beforeEach(() => {
        mockClient = {
            post: jest.fn().mockResolvedValue({ data: {} }),
            put: jest.fn().mockResolvedValue({ data: {} }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe.each(SECTION_SERVICES)('$name', ({ api, expectedBaseUrl }) => {
        it('targets the correct URL on create', async () => {
            const dummyPayload = { title: 'Test' };

            await api.create(mockClient as unknown as AxiosInstance, dummyPayload);

            expect(mockClient.post).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledWith(expectedBaseUrl, dummyPayload);
        });

        it('targets the correct URL on update with entityId and languageId', async () => {
            const entityId = 5;
            const languageId = 2;
            const dummyPayload = { title: 'Test Update' };

            await api.update(mockClient as unknown as AxiosInstance, entityId, languageId, dummyPayload);

            expect(mockClient.put).toHaveBeenCalledTimes(1);
            expect(mockClient.put).toHaveBeenCalledWith(`${expectedBaseUrl}/${entityId}/${languageId}`, dummyPayload);
        });
    });
});
