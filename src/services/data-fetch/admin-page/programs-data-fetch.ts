import {Program, ProgramCategory, ProgramStatus} from "../../../types/ProgramAdminPage";
import {mockCategories, mockPrograms} from "../../../utils/mock-data/admin-page/programPage";
import {PaginationResult} from "../../../types/Common";

export const programCategoriesDataFetch = async (): Promise<ProgramCategory[]> =>{
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockCategories;
}

export const programsDataFetch = async (categoryId: number): Promise<Program[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockPrograms.filter(program =>
        program.categories.some(category => category.id === categoryId)
    )
}

export const fetchProgramById = async (id: number): Promise<Program | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockPrograms.find(program => program.id === id) ?? null;
}

export const fetchProgramsWithFilterAndPagination = async (
    categoryId: number,
    pageNumber: number,
    pageSize: number,
    status?: ProgramStatus,
): Promise<PaginationResult<Program>> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const filtered = mockPrograms.filter(program => {
        const inCategory = program.categories.some(category => category.id === categoryId);
        const statusMatches = !status || program.status === status;
        return inCategory && statusMatches;
  });

  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize;

  const totalCount = filtered.length;
  const resultItems = filtered.slice(start, end);

  return {
      items: resultItems,
      totalItemsCount: totalCount,
  }
};
