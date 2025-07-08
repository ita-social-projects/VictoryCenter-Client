import {apiClient} from '../../../api-client/apiClient';
import { Member } from '../../../../pages/admin/team/components/members-list/MembersList';
import { categoryMap, reverseCategoryMap, TeamCategory } from '../../../../pages/admin/team/TeamPage';
import { TeamMemberDto } from '../../../../types/TeamPage';
import { MemberFormValues } from '../../../../pages/admin/team/components/member-form/MemberForm';

export const TeamMembersApi = {
  getAll: async (): Promise<Member[]> => {
    const response = await apiClient.get<TeamMemberDto[]>('/TeamMembers');
    return response.data.map(mapTeamMemberDtoToTeamMember);
  },

  updateDraft: async (id: number, member: MemberFormValues) => {
    await apiClient.put(`/TeamMembers/${id}`, {
        fullName: member.fullName,
        categoryId: categoryMap[member.category],
        status: 1,
        description: member.description,
        email: "", //TODO implement email update
    });
  },

  updatePublish: async (id: number, member: MemberFormValues) => {
    await apiClient.put(`/TeamMembers/${id}`, {
        fullName: member.fullName,
        categoryId: categoryMap[member.category],
        status: 0,
        description: member.description,
        email: "", //TODO implement email update
    });
  },

  postDraft: async (member: MemberFormValues) => {
    await apiClient.post(`/TeamMembers`, {
      fullName: member.fullName,
      categoryId: categoryMap[member.category],
      status: 1,
      description: member.description,
      email: "", //TODO implement email post
    });
  },

  postPublished: async (member: MemberFormValues) => {
    await apiClient.post(`/TeamMembers`, {
      fullName: member.fullName,
      categoryId: categoryMap[member.category],
      status: 0,
      description: member.description,
      email: "", //TODO implement email post
    });
  },

  delete: async (id: number) => {
    await apiClient.delete(`/TeamMembers/${id}`);
  },

  reorder: async (categoryId: number, orderedIds: number[]) => {
    await apiClient.put(`/TeamMembers/reorder`, {
      categoryId,
      orderedIds,
    });
  },
}

export const mapTeamMemberDtoToTeamMember = (dto: TeamMemberDto): Member => ({
    id: dto.id,
    img: dto.photo,
    fullName: dto.fullName,
    description: dto.description,
    status: dto.status === 0 ? 'Опубліковано' : 'Чернетка',
    category: reverseCategoryMap[dto.categoryId] as TeamCategory,
});