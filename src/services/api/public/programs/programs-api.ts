import { axiosInstance } from '@/services/api/axios';
import {
    DetailedProgramDto,
    ProgramCategoryDto,
    ProgramsPageData,
    PublishedProgramDto,
    PublicProgramCategoryLocalizationDto,
} from '@/types/public/programs-page';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

const LANGUAGE_CODE_BY_ID: Record<number, string> = {
    1: 'uk',
    2: 'en',
};

const normalizeCategory = (category: ProgramCategoryDto): ProgramCategoryDto => ({
    ...category,
    localizations: category.localizations?.map((localization: PublicProgramCategoryLocalizationDto) => ({
        ...localization,
        localizationInfoDto:
            localization.localizationInfoDto ??
            (localization.languageId
                ? {
                      id: localization.languageId,
                      code: LANGUAGE_CODE_BY_ID[localization.languageId] ?? '',
                  }
                : undefined),
    })),
});

export const programPageDataFetch = async (): Promise<ProgramsPageData> => {
    const response = await axiosInstance.get<PublishedProgramDto[]>(API_ROUTES.PROGRAMS.PUBLISHED);

    const programsData = response.data.map((program) => ({
        ...program,
        categories: program.categories.map(normalizeCategory),
    }));

    const programsCategories = Array.from(
        new Map(programsData.flatMap((x) => x.categories).map((x) => [x.id, x])).values(),
    );

    return {
        programsData,
        programsCategories: programsCategories,
    };
};

export const fetchProgramBySlug = async (slug: string): Promise<DetailedProgramDto> => {
    const response = await axiosInstance.get<DetailedProgramDto>(`${API_ROUTES.PROGRAMS.BY_SLUG}/${slug}`);
    return response.data;
};
