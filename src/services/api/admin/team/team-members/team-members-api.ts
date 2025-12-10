import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { TeamMember, TeamMemberCreateUpdateRequest } from '@/types/admin/team-members';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';

export const TeamMembersApi = {
    getAll: async (
        client: AxiosInstance,
        categoryId?: number,
        status?: VisibilityStatus | null,
        offset?: number,
        limit?: number,
    ): Promise<PaginationResult<TeamMember>> => {
        const params: Record<string, any> = {};

        if (categoryId !== undefined && categoryId !== null) {
            params.categoryId = categoryId;
        }
        if (status !== undefined) {
            params.status = status;
        }
        if (offset !== undefined && offset !== null) {
            params.offset = offset;
        }
        if (limit !== undefined && limit !== null) {
            params.limit = Math.floor(limit);
        }

        const response = await client.get<PaginationResult<TeamMember>>(`${API_ROUTES.TEAM.BASE}`, { params });
        return response.data;
    },

    search: async (
        client: AxiosInstance,
        fullName: string,
        offset: number = 0,
        limit: number = 5,
        signal?: AbortSignal,
    ): Promise<PaginationResult<TeamMember>> => {
        const params: Record<string, any> = { fullName };
        params.offset = offset;
        params.limit = Math.floor(limit);

        const response = await client.get<PaginationResult<TeamMember>>(`${API_ROUTES.TEAM.SEARCH}`, {
            params,
            signal,
        });
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number) => {
        await client.delete(`${API_ROUTES.TEAM.BASE}/${id}`);
    },

    reorder: async (client: AxiosInstance, categoryId: number, orderedIds: number[]) => {
        await client.put(API_ROUTES.TEAM.REORDER, {
            categoryId,
            orderedIds,
        });
    },

    updateMember: async (
        client: AxiosInstance,
        id: number,
        member: TeamMemberCreateUpdateRequest,
    ): Promise<TeamMember> => {
        const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(client, member.image, member.imageId);

        const response = await client.put(`${API_ROUTES.TEAM.BASE}/${id}`, {
            fullName: member.fullName,
            categoryId: member.categoryId,
            status: member.status,
            description: member.description,
            email: '',
            imageId: finalImageId,
        });

        if (imageIdToDelete && imageIdToDelete !== finalImageId) {
            await ImageApi.delete(client, imageIdToDelete);
        }
        return response.data as TeamMember;
    },

    postMember: async (client: AxiosInstance, member: TeamMemberCreateUpdateRequest): Promise<TeamMember> => {
        let imageId: number | null = null;
        if (member.image && 'base64' in member.image) {
            const imageResult = await ImageApi.post(client, member.image);
            imageId = imageResult.id;
        }
        const response = await client.post(`${API_ROUTES.TEAM.BASE}`, {
            fullName: member.fullName,
            categoryId: member.categoryId,
            status: member.status,
            description: member.description,
            email: '', // TODO: implement email post
            imageId: imageId,
        });

        return response.data as TeamMember;
    },
};
