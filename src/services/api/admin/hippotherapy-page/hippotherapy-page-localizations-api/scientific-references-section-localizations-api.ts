import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';
import {
    CreateScientificReferencesSectionDto,
    HippotherapyScientificReferencesSectionLocalizationDto,
    UpdateScientificReferencesSectionDto,
} from '@/types/admin/hippotherapy-page';

export const ScientificReferencesSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateScientificReferencesSectionDto,
    UpdateScientificReferencesSectionDto,
    HippotherapyScientificReferencesSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.SCIENTIFIC_REFERENCES_SECTION.BASE);
