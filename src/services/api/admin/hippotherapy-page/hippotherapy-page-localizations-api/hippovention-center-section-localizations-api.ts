import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';
import {
    CreateHippoventionCenterSectionDto,
    HippoventionCenterSectionLocalizationDto,
    UpdateHippoventionCenterSectionDto,
} from '@/types/admin/hippotherapy-page';

export const HippoventionCenterSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateHippoventionCenterSectionDto,
    UpdateHippoventionCenterSectionDto,
    HippoventionCenterSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.HIPPOVENTION_CENTER_SECTION.BASE);
