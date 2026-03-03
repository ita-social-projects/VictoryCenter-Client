import { VisibilityStatus, PaginationResult } from '@/types/admin/common';

import {
    HippotherapyProgramDto,
    ProgramCategory,
    ProgramCategoryCreateUpdate,
    CreateHippotherapyProgramDto,
    UpdateHippotherapyProgramDto,
    ProgramSearchItemData,
} from '@/types/admin/programs';
import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';

const convertProgramToSuggestion = (program: HippotherapyProgramDto): ProgramSearchItemData => {
    return {
        id: program.id,
        name: program.name,
        categories: program.categories.map((cat) => cat.name),
    };
};

const mapProgramEditToProgram = async (
    program: HippotherapyProgramDto,
    client: AxiosInstance,
): Promise<HippotherapyProgramDto> => {
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
        meetingsCount: program.meetingsCount,
        sections: program.sections,
        slug: program.slug || '',
    };
};

export const ProgramsCategoriesApi = {
    fetchProgramCategories: async (client: AxiosInstance): Promise<ProgramCategory[]> => {
        const response = await client.get<ProgramCategory[]>(API_ROUTES.PROGRAMCATEGORY.BASE);
        return response.data.map((category: any) => {
            return {
                ...category,
                programsCount: category.programs.length,
            };
        });
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
    ): Promise<PaginationResult<HippotherapyProgramDto>> => {
        const response = await client.get<PaginationResult<HippotherapyProgramDto>>(API_ROUTES.PROGRAMS.BASE, {
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
        const response = await client.get<PaginationResult<HippotherapyProgramDto>>(`${API_ROUTES.PROGRAMS.SEARCH}`, {
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

    fetchProgramById: async (id: number, client: AxiosInstance): Promise<HippotherapyProgramDto | null> => {
        const response = await client.get<HippotherapyProgramDto>(`${API_ROUTES.PROGRAMS.BASE}/${id}`);
        return response.data;
    },

    addProgram: async (
        client: AxiosInstance,
        program: CreateHippotherapyProgramDto,
    ): Promise<HippotherapyProgramDto> => {
        const uploadedImageIds: number[] = [];

        try {
            if (program.previewImage && 'base64' in program.previewImage) {
                const previewImageResult = await ImageApi.post(client, program.previewImage);
                program.previewImageId = previewImageResult.id;
                if (previewImageResult.id) {
                    uploadedImageIds.push(previewImageResult.id);
                }
                program.previewImage = null;
            }
            if (program.backgroundImage && 'base64' in program.backgroundImage) {
                const backgroundImageResult = await ImageApi.post(client, program.backgroundImage);
                program.backgroundImageId = backgroundImageResult.id;
                if (backgroundImageResult.id) {
                    uploadedImageIds.push(backgroundImageResult.id);
                }
                program.backgroundImage = null;
            }

            await Promise.all(
                program.sections.map(async (section) => {
                    await Promise.all(
                        section.contents.map(async (content) => {
                            if (content.image && 'base64' in content.image) {
                                const imageResult = await ImageApi.post(client, content.image);
                                content.imageId = imageResult.id;
                                if (imageResult.id) {
                                    uploadedImageIds.push(imageResult.id);
                                }
                                content.image = null;
                            }
                        }),
                    );
                }),
            );

            const response = await client.post(API_ROUTES.PROGRAMS.BASE, program);

            return mapProgramEditToProgram(response.data, client);
        } catch (error) {
            await Promise.allSettled(uploadedImageIds.map((imageId) => ImageApi.delete(client, imageId)));
            throw error;
        }
    },

    editProgram: async (
        program: UpdateHippotherapyProgramDto,
        client: AxiosInstance,
    ): Promise<HippotherapyProgramDto> => {
        const newlyCreatedImageIds: number[] = [];
        const originalPreviewImageId = program.previewImageId;
        const originalBackgroundImageId = program.backgroundImageId;
        const previewImageId: number | null = program.previewImageId ?? null;
        const backgroundImageId: number | null = program.backgroundImageId ?? null;

        try {
            const { finalImageId: finalPreviewImageId, imageIdToDelete: previewImageIdToDelete } =
                await ImageApi.getUpdateImageId(client, program.previewImage ?? null, previewImageId);
            const { finalImageId: finalBackgroundImageId, imageIdToDelete: backgroundImageIdToDelete } =
                await ImageApi.getUpdateImageId(client, program.backgroundImage ?? null, backgroundImageId);

            if (finalPreviewImageId && finalPreviewImageId !== originalPreviewImageId) {
                newlyCreatedImageIds.push(finalPreviewImageId);
            }
            if (finalBackgroundImageId && finalBackgroundImageId !== originalBackgroundImageId) {
                newlyCreatedImageIds.push(finalBackgroundImageId);
            }

            program.previewImageId = finalPreviewImageId;
            program.backgroundImageId = finalBackgroundImageId;
            program.previewImage = null;
            program.backgroundImage = null;

            const sectionImagesToDelete: number[] = [];
            const originalContentImageIds = new Map<string, number | null>();

            await Promise.all(
                program.sections.map(async (section, sectionIndex) => {
                    await Promise.all(
                        section.contents.map(async (content, contentIndex) => {
                            if (content.image || content.imageId) {
                                const contentImageId =
                                    content.imageId ??
                                    (content.image && 'id' in content.image ? content.image.id : null);
                                const contentKey = `${sectionIndex}-${contentIndex}`;
                                originalContentImageIds.set(contentKey, contentImageId);

                                const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
                                    client,
                                    content.image ?? null,
                                    contentImageId,
                                );

                                if (finalImageId && finalImageId !== contentImageId) {
                                    newlyCreatedImageIds.push(finalImageId);
                                }

                                content.imageId = finalImageId;
                                content.image = null;

                                if (imageIdToDelete) {
                                    sectionImagesToDelete.push(imageIdToDelete);
                                }
                            }
                        }),
                    );
                }),
            );

            const response = await client.put(`${API_ROUTES.PROGRAMS.BASE}/${program.id}`, program);

            if (previewImageIdToDelete && previewImageIdToDelete !== finalPreviewImageId) {
                await ImageApi.delete(client, previewImageIdToDelete);
            }
            if (backgroundImageIdToDelete && backgroundImageIdToDelete !== finalBackgroundImageId) {
                await ImageApi.delete(client, backgroundImageIdToDelete);
            }

            await Promise.all(sectionImagesToDelete.map((imageId) => ImageApi.delete(client, imageId)));

            return response.data;
        } catch (error) {
            await Promise.allSettled(newlyCreatedImageIds.map((imageId) => ImageApi.delete(client, imageId)));
            throw error;
        }
    },

    deleteProgram: async (id: number, client: AxiosInstance): Promise<void> => {
        const response = await client.delete(`${API_ROUTES.PROGRAMS.BASE}/${id}`);
        return response.data;
    },
};
