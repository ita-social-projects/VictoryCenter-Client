import { VisibilityStatus, PaginationResult } from '../../../../types/admin/common';
import {
    ProgramCategory,
    ProgramCreateUpdate,
    ProgramCategoryCreateUpdate,
    ProgramSearchItemData,
    Program,
} from '../../../../types/admin/programs';
import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';

// !!!
// Delete after actual integration with backend

// ============================================
//let mockProgramId = Math.max(...mockPrograms.map((p) => p.id), 0) + 1;
//let mockCategoryId = Math.max(...mockCategories.map((c) => c.id), 0) + 1;
//export let mockDelay = 400;
//export let throwErrorsInApi = false;

// Helper function to convert Program to ProgramSuggestion
const convertProgramToSuggestion = (program: Program): ProgramSearchItemData => {
    return {
        id: program.id,
        name: program.name,
        categories: program.categories.map((cat) => cat.name),
    };
};

const mapProgramEditToProgram = async (program: ProgramCreateUpdate, client: AxiosInstance): Promise<Program> => {
    const response = await client.get(API_ROUTES.PROGRAMCATEGORY.BASE);
    return {
        id: program.id ?? 1,
        name: program.name,
        description: program.description,
        categories: response.data,
        status: program.status,
        img: program.img,
    };
};

// Simulates an async delay with AbortSignal support — used for testing fetch cancellation behavior

export const ProgramsApi = {
    fetchPrograms: async (
        client: AxiosInstance,
        categoryId: number,
        offset: number,
        limit: number,
        status?: VisibilityStatus,
    ): Promise<PaginationResult<Program>> => {
        const response = await client.get<PaginationResult<Program>>(API_ROUTES.PROGRAMS.BASE, {
            params: {
                categoryId,
                offset,
                limit,
                status,
            },
        });
        return response.data;
    },

    fetchProgramSearchItems: async (
        client: AxiosInstance,
        searchTerm: string,
        offset: number,
        limit: number,
    ): Promise<PaginationResult<ProgramSearchItemData>> => {
        const response = await client.get<Program[]>(API_ROUTES.PROGRAMS.BASE);
        const filtered = response.data.filter((program) => {
            const nameMatches = program.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatches = program.categories.some((cat) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            return nameMatches || categoryMatches;
        });

        const sorted = filtered.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
            const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;

            return a.name.localeCompare(b.name);
        });

        const start = offset;
        const end = offset + limit;
        const paginatedItems = sorted.slice(start, end);

        const suggestions = paginatedItems.map(convertProgramToSuggestion);

        return {
            items: suggestions,
            totalItemsCount: filtered.length,
        };
    },

    fetchProgramById: async (id: number, client: AxiosInstance): Promise<Program | null> => {
        const response = await client.get<Program>(API_ROUTES.PROGRAMS.BASE, {
            params: {
                id,
            },
        });
        return response.data;
    },

    addProgram: async (client: AxiosInstance, program: ProgramCreateUpdate): Promise<Program> => {
        const response = await client.post(API_ROUTES.PROGRAMS.BASE, program);
        return mapProgramEditToProgram(response.data, client);
    },

    editProgram: async (program: ProgramCreateUpdate, client: AxiosInstance): Promise<Program> => {
        const response = await client.put(`${API_ROUTES.PROGRAMS.BASE}/${program.id}`, program);
        return response.data;
    },

    deleteProgram: async (id: number, client: AxiosInstance): Promise<void> => {
        const response = await client.delete(`${API_ROUTES.PROGRAMS.BASE}/${id}`);
        return response.data;
    },

    fetchProgramCategories: async (client: AxiosInstance): Promise<ProgramCategory[]> => {
        const response = await client.get(API_ROUTES.PROGRAMCATEGORY.BASE);
        return response.data;
    },

    addProgramCategory: async (
        category: ProgramCategoryCreateUpdate,
        client: AxiosInstance,
    ): Promise<ProgramCategory> => {
        const response = await client.post(API_ROUTES.PROGRAMCATEGORY.BASE, category);
        return response.data;
    },

    editProgramCategory: async (
        category: ProgramCategoryCreateUpdate,
        client: AxiosInstance,
    ): Promise<ProgramCategory> => {
        const response = await client.put(`${API_ROUTES.PROGRAMCATEGORY.BASE}/${category.id}`, category);
        return response.data;
    },

    deleteProgramCategory: async (id: number, client: AxiosInstance): Promise<void> => {
        const response = client.delete(API_ROUTES.PROGRAMCATEGORY.BASE);
        return (await response).data;
    },
};
