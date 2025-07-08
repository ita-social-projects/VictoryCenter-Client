import { AxiosInstance, AxiosResponse } from "axios";
import { MemberFormValues } from "../../../../pages/admin/team/components/member-form/MemberForm";
import { TeamMemberDto } from "../../../../types/TeamPage";
import { mapTeamMemberDtoToTeamMember, TeamMembersApi } from "./TeamMembersApi";

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;


describe('TeamMembersApi', () => {
    it('should fetch and map team members', async () => {
        const mockDto = [
            {
                id: 1,
                fullName: 'Test Member',
                categoryId: 1,
                priority: 1,
                status: 0,
                description: 'Test description',
                photo: 'photo.png',
                email: 'test@example.com'
            }
        ];

        mockClient.get.mockResolvedValue({ data: mockDto });

        const members = await TeamMembersApi.getAll(mockClient);

        expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers');
        expect(members).toEqual([
            {
            id: 1,
            img: 'photo.png',
            fullName: 'Test Member',
            description: 'Test description',
            status: 'Опубліковано',
            category: 'Основна команда',
            }
        ]);
    });

    it('should send PUT request with draft status', async () => {
        const member: MemberFormValues = {
            fullName: 'Member',
            category: 'Основна команда',
            description: 'desc',
            img: null,
        };

        const putMock = jest.spyOn(mockClient, 'put').mockResolvedValue({});

        await TeamMembersApi.updateDraft(mockClient, 5, member);

        expect(putMock).toHaveBeenCalledWith('/TeamMembers/5', {
            fullName: 'Member',
            categoryId: 1,
            status: 1,
            description: 'desc',
            email: ''
        });
    });

    it('should send PUT request with published status', async () => {
        const member: MemberFormValues = {
            fullName: 'Member',
            category: 'Основна команда',
            description: 'desc',
            img: null,
        };

        const putMock = jest.spyOn(mockClient, 'put').mockResolvedValue({});

        await TeamMembersApi.updatePublish(mockClient, 5, member);

        expect(putMock).toHaveBeenCalledWith('/TeamMembers/5', {
            fullName: 'Member',
            categoryId: 1,
            status: 0,
            description: 'desc',
            email: ''
        });
    });

    it('should post member as draft', async () => {
        const member: MemberFormValues = {
            fullName: 'Draft Member',
            category: 'Основна команда',
            description: 'description',
            img: null
        };

        const postMock = jest.spyOn(mockClient, 'post').mockResolvedValue({});

        await TeamMembersApi.postDraft(mockClient, member);

        expect(postMock).toHaveBeenCalledWith('/TeamMembers', {
            fullName: 'Draft Member',
            categoryId: 1,
            status: 1,
            description: 'description',
            email: ''
        });
    });

    it('should post member as published', async () => {
        const member: MemberFormValues = {
            fullName: 'Draft Member',
            category: 'Основна команда',
            description: 'description',
            img: null
        };

        const postMock = jest.spyOn(mockClient, 'post').mockResolvedValue({});

        await TeamMembersApi.postPublished(mockClient, member);

        expect(postMock).toHaveBeenCalledWith('/TeamMembers', {
            fullName: 'Draft Member',
            categoryId: 1,
            status: 0,
            description: 'description',
            email: ''
        });
    });

    it('should delete member by id', async () => {
        const deleteMock = jest.spyOn(mockClient, 'delete').mockResolvedValue({});
        await TeamMembersApi.delete(mockClient, 42);
        expect(deleteMock).toHaveBeenCalledWith('/TeamMembers/42');
    });

    it('should reorder team members', async () => {
        const putMock = jest.spyOn(mockClient, 'put').mockResolvedValue({});
        await TeamMembersApi.reorder(mockClient, 1, [3, 2, 1]);

        expect(putMock).toHaveBeenCalledWith('/TeamMembers/reorder', {
            categoryId: 1,
            orderedIds: [3, 2, 1]
        });
    });

    it('should map DTO to internal member format', () => {
        const dto: TeamMemberDto = {
            id: 1,
            fullName: 'Name',
            categoryId: 1,
            priority: 1,
            status: 1,
            description: 'Desc',
            photo: 'photo.jpg',
            email: ''
        };

        const result = mapTeamMemberDtoToTeamMember(dto);

        expect(result).toEqual({
            id: 1,
            fullName: 'Name',
            img: 'photo.jpg',
            description: 'Desc',
            status: 'Чернетка',
            category: 'Основна команда',
        });
    });
})
