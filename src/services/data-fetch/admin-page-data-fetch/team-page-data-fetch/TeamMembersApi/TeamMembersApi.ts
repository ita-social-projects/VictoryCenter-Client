import { TeamMember, TeamMemberDto } from '../../../../../types/admin/TeamMembers';
import { MemberFormValues } from '../../../../../pages/admin/team/components/member-form/MemberForm';
import { AxiosInstance } from 'axios';
import { Status } from '../../../../../types/Common';
import { Image } from '../../../../../types/Image';
import { ImagesApi } from '../../image-data-fetch/ImageDataApi';

export const TeamMembersApi = {
    getAll: async (
        client: AxiosInstance,
        categoryId?: number,
        status?: Status | null,
        offset?: number,
        limit?: number,
    ): Promise<TeamMember[]> => {
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

        const response = await client.get<TeamMemberDto[]>('/TeamMembers', { params });
        return response.data.map(mapTeamMemberDtoToTeamMember);
    },

    updateDraft: async (client: AxiosInstance, id: number, member: MemberFormValues) => {
        await TeamMembersApi.updateMember(client, id, member, Status.Draft);
    },

    updatePublish: async (client: AxiosInstance, id: number, member: MemberFormValues) => {
        await TeamMembersApi.updateMember(client, id, member, Status.Published);
    },

    postDraft: async (client: AxiosInstance, member: MemberFormValues) => {
        let imageId: number | null = null;

        if (member.image) {
            const imageResult = await ImagesApi.post(client, member.image);
            imageId = imageResult.id;
        }

        await client.post(`/TeamMembers`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: Status.Draft,
            description: member.description,
            email: '', // TODO: implement email post
            imageId: imageId,
        });
    },

    postPublished: async (client: AxiosInstance, member: MemberFormValues) => {
        console.log(member);
        let imageId: number | null = null;

        if (member.image) {
            const imageResult = await ImagesApi.post(client, member.image);
            imageId = imageResult.id;
        }

        await client.post(`/TeamMembers`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: Status.Published,
            description: member.description,
            email: '', //TODO implement email post
            imageId: imageId,
        });
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

    updateMember: async (client: AxiosInstance, id: number, member: MemberFormValues, status: Status) => {
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

        await client.put(`/TeamMembers/${id}`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: status,
            description: member.description,
            email: '',
            imageId: finalImageId,
        });

        if (imageIdToDelete && imageIdToDelete !== finalImageId) {
            await ImagesApi.delete(client, imageIdToDelete);
        }
    },
};

export const mapTeamMemberDtoToTeamMember = (dto: TeamMemberDto): TeamMember => ({
    id: dto.id,
    img: dto.image,
    fullName: dto.fullName,
    description: dto.description,
    status: dto.status === Status.Draft ? 'Чернетка' : 'Опубліковано',
    category: dto.category,
});
