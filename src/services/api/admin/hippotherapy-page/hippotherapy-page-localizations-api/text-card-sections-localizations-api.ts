import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';
import {
    CreateTextCardSectionDto,
    HippotherapyTextCardSectionLocalizationDto,
    UpdateTextCardSectionDto,
} from '@/types/admin/hippotherapy-page';

export const IntroSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateTextCardSectionDto,
    UpdateTextCardSectionDto,
    HippotherapyTextCardSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.INTRO_SECTION.BASE);

export const DescriptionSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateTextCardSectionDto,
    UpdateTextCardSectionDto,
    HippotherapyTextCardSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.DESCRIPTION_SECTION.BASE);

export const HippoventionSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateTextCardSectionDto,
    UpdateTextCardSectionDto,
    HippotherapyTextCardSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.HIPPOVENTION_SECTION.BASE);

export const AnalysisSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateTextCardSectionDto,
    UpdateTextCardSectionDto,
    HippotherapyTextCardSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ANALYSIS_SECTION.BASE);
