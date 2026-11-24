import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateGallerySectionDto,
    HippotherapyGallerySectionLocalizationDto,
    UpdateGallerySectionDto,
} from '@/types/admin/hippotherapy-page';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';

export const AdvantagesSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateGallerySectionDto,
    UpdateGallerySectionDto,
    HippotherapyGallerySectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ADVANTAGES_SECTION.BASE);

export const ParticipantsSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateGallerySectionDto,
    UpdateGallerySectionDto,
    HippotherapyGallerySectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.PARTICIPANTS_SECTION.BASE);
