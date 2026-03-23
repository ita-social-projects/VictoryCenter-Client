import { axiosInstance } from '@/services/api/axios';
import { DetailedProgramDto, ProgramsPageData, PublishedProgramDto } from '@/types/public/programs-page';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export const programPageDataFetch = async (): Promise<ProgramsPageData> => {
    const response = await axiosInstance.get<PublishedProgramDto[]>(API_ROUTES.PROGRAMS.PUBLISHED);

    const programsCategories = Array.from(
        new Map(response.data.flatMap((x) => x.categories).map((x) => [x.id, x])).values(),
    );

    return {
        programsData: response.data,
        programsCategories: programsCategories,
    };
};

export const fetchProgramBySlug = async (slug: string): Promise<DetailedProgramDto> => {
    const response = await axiosInstance.get<DetailedProgramDto>(`${API_ROUTES.PROGRAMS.BY_SLUG}/${slug}`);
    return response.data;
};
