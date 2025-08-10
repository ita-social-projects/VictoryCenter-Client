import { TeamMember, TeamMemberCreateUpdateRequest, TeamMemberDto } from '../../../../../types/admin/TeamMembers';
import { AxiosInstance } from 'axios';
import { PaginationResult, VisibilityStatus } from '../../../../../types/admin/Common';
import { ImagesApi } from '../../image-data-fetch/ImageDataApi';

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

        const response = await client.get<PaginationResult<TeamMember>>('/TeamMembers', { params });
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number) => {
        await client.delete(`/TeamMembers/${id}`);
    },

    reorder: async (client: AxiosInstance, categoryId: number, orderedIds: number[]) => {
        await client.put(`/TeamMembers/reorder`, {
            categoryId,
            orderedIds,
        });
    },

    updateMember: async (
        client: AxiosInstance,
        id: number,
        member: TeamMemberCreateUpdateRequest,
    ): Promise<TeamMember> => {
        let imageIdToDelete: number | null = null;
        let finalImageId = member.imageId;

        if (member.image) {
            if (member.imageId) {
                const imageResult = await ImagesApi.put(client, member.image, member.imageId);
                finalImageId = imageResult.id;
            } else {
                const imageResult = await ImagesApi.post(client, member.image);
                finalImageId = imageResult.id;
            }
        } else if (member.imageId && !member.image) {
            imageIdToDelete = member.imageId;
            finalImageId = null;
        }

        const response = await client.put(`/TeamMembers/${id}`, {
            fullName: member.fullName,
            categoryId: member.categoryId,
            status: member.status,
            description: member.description,
            email: '',
            imageId: finalImageId,
        });

        if (imageIdToDelete && imageIdToDelete !== finalImageId) {
            await ImagesApi.delete(client, imageIdToDelete);
        }

        return response.data as TeamMember;
    },

    postMember: async (client: AxiosInstance, member: TeamMemberCreateUpdateRequest): Promise<TeamMember> => {
        let imageId: number | null = null;
        if (member.image) {
            const imageResult = await ImagesApi.post(client, member.image);
            imageId = imageResult.id;
        }
        const response = await client.post(`/TeamMembers`, {
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

export const mapTeamMemberDtoToTeamMember = (dto: TeamMemberDto): TeamMember => ({
    id: dto.id,
    image: dto.image,
    fullName: dto.fullName,
    description: dto.description,
    status: dto.status,
    categoryId: dto.categoryId,
});
