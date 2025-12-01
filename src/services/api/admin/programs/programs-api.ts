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
        previewImage: program.previewImage,
        backgroundImage: program.backgroundImage,
        location: program.location,
        participantsCount: program.participantsCount,
        meetingCount: program.meetingCount,
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
        const response = await client.get<PaginationResult<Program>>(`${API_ROUTES.PROGRAMS.SEARCH}`, {
            params: {
                SearchQuery: searchTerm,
                offset: offset,
                limit: limit,
            },
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
        if (program.previewImage && 'base64' in program.previewImage) {
            const imageResult = await ImageApi.post(client, program.previewImage);
            program.previewImageId = imageResult.id;
        }
        if (program.backgroundImage && 'base64' in program.backgroundImage) {
            const imageResult = await ImageApi.post(client, program.backgroundImage);
            program.backgroundImageId = imageResult.id;
        }

        const response = await client.post(API_ROUTES.PROGRAMS.BASE, program);

        return mapProgramEditToProgram(response.data, client);
    },

    editProgram: async (program: ProgramCreateUpdate, client: AxiosInstance): Promise<Program> => {
        const { finalImageId: finalPreviewImageId, imageIdToDelete: previewImageIdToDelete } =
            await ImageApi.getUpdateImageId(client, program.previewImage, program.previewImageId);
        const { finalImageId: finalBackgroundImageId, imageIdToDelete: backgroundImageIdToDelete } =
            await ImageApi.getUpdateImageId(client, program.backgroundImage, program.backgroundImageId);

        program.previewImageId = finalPreviewImageId;
        program.backgroundImageId = finalBackgroundImageId;

        const response = await client.put(`${API_ROUTES.PROGRAMS.BASE}/${program.id}`, program);

        if (previewImageIdToDelete && previewImageIdToDelete !== finalPreviewImageId) {
            await ImageApi.delete(client, previewImageIdToDelete);
        }
        if (backgroundImageIdToDelete && backgroundImageIdToDelete !== finalBackgroundImageId) {
            await ImageApi.delete(client, backgroundImageIdToDelete);
        }

        return response.data;
    },

    deleteProgram: async (id: number, client: AxiosInstance): Promise<void> => {
        const response = await client.delete(`${API_ROUTES.PROGRAMS.BASE}/${id}`);
        return response.data;
    },
};
