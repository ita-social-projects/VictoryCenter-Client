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
import { ImageApi } from '../image/image-api';

const convertProgramToSuggestion = (program: Program): ProgramSearchItemData => {
    return {
        id: program.id,
        name: program.name,
        categories: program.categories.map((cat) => cat.name),
    };
};

const mapProgramEditToProgram = async (program: ProgramCreateUpdate, client: AxiosInstance): Promise<Program> => {
    const response = await client.get<ProgramCategory[]>(API_ROUTES.PROGRAMCATEGORY.BASE);
    return {
        id: program.id as number,
        name: program.name,
        description: program.description,
        categories: response.data,
        status: program.status,
        image: program.image,
    };
};

export const ProgramsCategoriesApi = {
    fetchProgramCategories: async (client: AxiosInstance): Promise<ProgramCategory[]> => {
        const response = await client.get<ProgramCategory[]>(API_ROUTES.PROGRAMCATEGORY.BASE);
        const result = response.data.map((category: any) => {
            return {
                ...category,
                programsCount: category.programs.length,
            };
        });
        return result;
    },

    addProgramCategory: async (
        category: ProgramCategoryCreateUpdate,
        client: AxiosInstance,
    ): Promise<ProgramCategory> => {
        const response = await client.post(API_ROUTES.PROGRAMCATEGORY.BASE, category);
        const created = response.data;
        return {
            ...created,
            programsCount: created.programs ? created.programs.length : 0,
        };
    },

    editProgramCategory: async (
        category: ProgramCategoryCreateUpdate,
        client: AxiosInstance,
    ): Promise<ProgramCategory> => {
        const response = await client.put(`${API_ROUTES.PROGRAMCATEGORY.BASE}/${category.id}`, category);
        return response.data;
    },

    deleteProgramCategory: async (id: number, client: AxiosInstance): Promise<void> => {
        const response = await client.delete(`${API_ROUTES.PROGRAMCATEGORY.BASE}/${id}`);
        return response.data;
    },
};

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
        offset: number = 0,
        limit: number = 5,
        signal?: AbortSignal,
    ): Promise<PaginationResult<ProgramSearchItemData>> => {
        const params = {
            SearchQuery: searchTerm,
            offset: offset,
            limit: Math.floor(limit),
        };

        const response = await client.get<PaginationResult<Program>>(`${API_ROUTES.PROGRAMS.SEARCH}`, {
            params,
            signal,
        });

        const suggestions = response.data.items.map(convertProgramToSuggestion);

        return {
            items: suggestions,
            totalItemsCount: response.data.totalItemsCount,
        };
    },

    fetchProgramById: async (id: number, client: AxiosInstance): Promise<Program | null> => {
        const response = await client.get<Program>(`${API_ROUTES.PROGRAMS.BASE}/${id}`);
        return response.data;
    },

    addProgram: async (client: AxiosInstance, program: ProgramCreateUpdate): Promise<Program> => {
        if (program.image && 'base64' in program.image) {
            const imageResult = await ImageApi.post(client, program.image);
            program.imageId = imageResult.id;
        }

        const response = await client.post(API_ROUTES.PROGRAMS.BASE, program);

        return mapProgramEditToProgram(response.data, client);
    },

    editProgram: async (program: ProgramCreateUpdate, client: AxiosInstance): Promise<Program> => {
        const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
            client,
            program.image,
            program.imageId,
        );

        program.imageId = finalImageId;

        const response = await client.put(`${API_ROUTES.PROGRAMS.BASE}/${program.id}`, program);

        if (imageIdToDelete && imageIdToDelete !== finalImageId) {
            await ImageApi.delete(client, imageIdToDelete);
        }
        return response.data;
    },

    deleteProgram: async (id: number, client: AxiosInstance): Promise<void> => {
        const response = await client.delete(`${API_ROUTES.PROGRAMS.BASE}/${id}`);
        return response.data;
    },
};
