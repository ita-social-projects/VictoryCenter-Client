import { TeamMember, TeamMemberDto } from '../../../../../types/admin/TeamMembers';
import { MemberFormValues } from '../../../../../pages/admin/team/components/member-form/MemberForm';
import { AxiosInstance } from 'axios';
import { Status } from '../../../../../types/Common';

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
        await client.put(`/TeamMembers/${id}`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: Status.Draft,
            description: member.description,
            email: '', //TODO implement email update
        });
    },

    updatePublish: async (client: AxiosInstance, id: number, member: MemberFormValues) => {
        await client.put(`/TeamMembers/${id}`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: Status.Published,
            description: member.description,
            email: '', //TODO implement email update
        });
    },

    postDraft: async (client: AxiosInstance, member: MemberFormValues) => {
        await client.post(`/TeamMembers`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: Status.Draft,
            description: member.description,
            email: '', //TODO implement email post
        });
    },

    postPublished: async (client: AxiosInstance, member: MemberFormValues) => {
        await client.post(`/TeamMembers`, {
            fullName: member.fullName,
            categoryId: member.category.id,
            status: Status.Published,
            description: member.description,
            email: '', //TODO implement email post
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
};

export const mapTeamMemberDtoToTeamMember = (dto: TeamMemberDto): TeamMember => ({
    id: dto.id,
    img: dto.photo,
    fullName: dto.fullName,
    description: dto.description,
    status: dto.status === Status.Draft ? 'Чернетка' : 'Опубліковано',
    category: dto.category,
});
