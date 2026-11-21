import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';
import {
    CreateQuoteSectionDto,
    HippotherapyQuoteSectionLocalizationDto,
    UpdateQuoteSectionDto,
} from '@/types/admin/hippotherapy-page';

export const QuoteSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateQuoteSectionDto,
    UpdateQuoteSectionDto,
    HippotherapyQuoteSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.QUOTE_SECTION.BASE);

export const AnotherQuoteSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateQuoteSectionDto,
    UpdateQuoteSectionDto,
    HippotherapyQuoteSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ANOTHER_QUOTE_SECTION.BASE);
