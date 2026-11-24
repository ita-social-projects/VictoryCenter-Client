import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api/base-hippotherapy-section-localizations-api';
import {
    CreateEthicsSectionDto,
    HippotherapyEthicsSectionLocalizationDto,
    UpdateEthicsSectionDto,
} from '@/types/admin/hippotherapy-page';

export const EthicsSectionLocalizationsApi = createSectionLocalizationsApi<
    CreateEthicsSectionDto,
    UpdateEthicsSectionDto,
    HippotherapyEthicsSectionLocalizationDto
>(API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.ETHICS_SECTION.BASE);
