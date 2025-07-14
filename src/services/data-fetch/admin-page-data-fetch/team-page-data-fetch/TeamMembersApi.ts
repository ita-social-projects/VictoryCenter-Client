import { Member } from '../../../../pages/admin/team/components/members-list/MembersList';
import { reverseCategoryMap } from '../../../../pages/admin/team/TeamPage';
import { TeamMemberDto } from '../../../../types/TeamPage';
import { categoryMap } from '../../../../const/admin/team-page';
import { MemberFormValues } from '../../../../pages/admin/team/components/member-form/MemberForm';
import { AxiosInstance } from 'axios';

export const TeamMembersApi = {
    getAll: async (client: AxiosInstance): Promise<Member[]> => {
        const response = await client.get<TeamMemberDto[]>('/TeamMembers');
        return response.data.map(mapTeamMemberDtoToTeamMember);
    },

    updateDraft: async (client: AxiosInstance, id: number, member: MemberFormValues) => {
        await client.put(`/TeamMembers/${id}`, {
            fullName: member.fullName,
            categoryId: categoryMap[member.category],
            status: 1,
            description: member.description,
            email: '', //TODO implement email update
        });
    },

    updatePublish: async (client: AxiosInstance, id: number, member: MemberFormValues) => {
        await client.put(`/TeamMembers/${id}`, {
            fullName: member.fullName,
            categoryId: categoryMap[member.category],
            status: 0,
            description: member.description,
            email: '', //TODO implement email update
        });
    },

    postDraft: async (client: AxiosInstance, member: MemberFormValues) => {
        await client.post(`/TeamMembers`, {
            fullName: member.fullName,
            categoryId: categoryMap[member.category],
            status: 1,
            description: member.description,
            email: '', //TODO implement email post
        });
    },

    postPublished: async (client: AxiosInstance, member: MemberFormValues) => {
        await client.post(`/TeamMembers`, {
            fullName: member.fullName,
            categoryId: categoryMap[member.category],
            status: 0,
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

export const mapTeamMemberDtoToTeamMember = (dto: TeamMemberDto): Member => ({
    id: dto.id,
    img: dto.photo,
    fullName: dto.fullName,
    description: dto.description,
    status: dto.status === 0 ? 'Опубліковано' : 'Чернетка',
    category: reverseCategoryMap[dto.categoryId],
});
