import { axiosInstance } from '@/services/api/axios';
import { ProgramsPageData, PublishedProgramDto } from '@/types/public/programs-page';
import { Program } from '@/types/admin/programs';
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

export const fetchProgramBySlug = async (slug: string): Promise<Program> => {
    const response = await axiosInstance.get<Program>(`${API_ROUTES.PROGRAMS.BY_SLUG}/${slug}`);
    return response.data;
};
