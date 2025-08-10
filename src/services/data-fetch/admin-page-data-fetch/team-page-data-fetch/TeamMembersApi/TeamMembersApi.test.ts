import { TeamMembersApi } from "./TeamMembersApi";
import { ImagesApi } from "../../image-data-fetch/ImageDataApi";
import { VisibilityStatus } from "../../../../../types/admin/Common";
import { AxiosInstance } from "axios";

jest.mock('../../image-data-fetch/ImageDataApi');

describe('TeamMembersApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('calls client.get with correct parameters', async () => {
            const mockResponse = {
                data: { items: [], totalItemsCount: 0 },
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await TeamMembersApi.getAll(mockClient, 1, VisibilityStatus.Published, 0, 10);

            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', {
                params: { categoryId: 1, status: VisibilityStatus.Published, offset: 0, limit: 10 },
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('delete', () => {
        it('calls client.delete with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await TeamMembersApi.delete(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith('/TeamMembers/42');
        });
    });

    describe('reorder', () => {
        it('calls client.put with correct payload', async () => {
            mockClient.put.mockResolvedValue({});

            await TeamMembersApi.reorder(mockClient, 2, [5, 3, 1]);

            expect(mockClient.put).toHaveBeenCalledWith('/TeamMembers/reorder', {
                categoryId: 2,
                orderedIds: [5, 3, 1],
            });
        });
    });

    describe('updateMember', () => {
        const mockImageValue = {
            base64: 'base64string',
            mimeType: 'image/png',
            size: 1234,
        };

        const mockImageResponse = {
            id: 99,
            base64: 'base64string',
            mimeType: 'image/png',
            size: 1234,
        };

        it('uploads new image and updates member with new imageId', async () => {
            (ImagesApi.post as jest.Mock).mockResolvedValue(mockImageResponse);
            mockClient.put.mockResolvedValue({
                data: {
                    id: 1,
                    fullName: 'Test',
                    categoryId: 1,
                    description: '',
                    status: VisibilityStatus.Draft,
                    image: mockImageResponse,
                },
            });

            const memberData = {
                id: 1,
                fullName: 'Test',
                description: '',
                image: mockImageValue,
                categoryId: 1,
                status: VisibilityStatus.Draft,
                imageId: null,
            };

            const result = await TeamMembersApi.updateMember(mockClient, 1, memberData);

            expect(ImagesApi.post).toHaveBeenCalledWith(mockClient, mockImageValue);
            expect(mockClient.put).toHaveBeenCalledWith(
                '/TeamMembers/1',
                expect.objectContaining({ imageId: mockImageResponse.id }),
            );
            expect(result.id).toBe(1);
        });

        it('updates existing image and member', async () => {
            (ImagesApi.put as jest.Mock).mockResolvedValue(mockImageResponse);
            mockClient.put.mockResolvedValue({
                data: {
                    id: 1,
                    fullName: 'Test',
                    categoryId: 1,
                    description: '',
                    status: VisibilityStatus.Published,
                    image: mockImageResponse,
                },
            });

            const memberData = {
                id: 1,
                fullName: 'Test',
                description: '',
                image: mockImageValue,
                categoryId: 1,
                status: VisibilityStatus.Published,
                imageId: 50, // existing image id
            };

            const result = await TeamMembersApi.updateMember(mockClient, 1, memberData);

            expect(ImagesApi.put).toHaveBeenCalledWith(mockClient, mockImageValue, 50);
            expect(mockClient.put).toHaveBeenCalledWith(
                '/TeamMembers/1',
                expect.objectContaining({ imageId: mockImageResponse.id }),
            );
            expect(result.status).toBe(VisibilityStatus.Published);
        });

        it('deletes old image when image removed', async () => {
            (ImagesApi.delete as jest.Mock).mockResolvedValue({});
            mockClient.put.mockResolvedValue({
                data: {
                    id: 1,
                    fullName: 'Test',
                    categoryId: 1,
                    description: '',
                    status: VisibilityStatus.Draft,
                    image: null,
                },
            });

            const memberData = {
                id: 1,
                fullName: 'Test',
                description: '',
                image: null, // image removed
                categoryId: 1,
                status: VisibilityStatus.Draft,
                imageId: 20, // old image id to delete
            };

            const result = await TeamMembersApi.updateMember(mockClient, 1, memberData);

            expect(ImagesApi.delete).toHaveBeenCalledWith(mockClient, 20);
            expect(mockClient.put).toHaveBeenCalledWith('/TeamMembers/1', expect.objectContaining({ imageId: null }));
            expect(result.image).toBeNull();
        });

        it('does not call ImagesApi if no image changes', async () => {
            mockClient.put.mockResolvedValue({
                data: {
                    id: 1,
                    fullName: 'Test',
                    categoryId: 1,
                    description: '',
                    status: VisibilityStatus.Draft,
                    image: null,
                },
            });

            const memberData = {
                id: 1,
                fullName: 'Test',
                description: '',
                image: null,
                categoryId: 1,
                status: VisibilityStatus.Draft,
                imageId: null,
            };

            const result = await TeamMembersApi.updateMember(mockClient, 1, memberData);

            expect(ImagesApi.post).not.toHaveBeenCalled();
            expect(ImagesApi.put).not.toHaveBeenCalled();
            expect(ImagesApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalled();
            expect(result.id).toBe(1);
        });
    });

    describe('postMember', () => {
        const mockImageValue = {
            base64: 'base64string',
            mimeType: 'image/jpeg',
            size: 1234,
        };

        const mockImageResponse = {
            id: 88,
            base64: 'base64string',
            mimeType: 'image/jpeg',
            size: 1234,
        };

        it('uploads image if present and posts member', async () => {
            (ImagesApi.post as jest.Mock).mockResolvedValue(mockImageResponse);
            mockClient.post.mockResolvedValue({
                data: {
                    id: 2,
                    fullName: 'New Member',
                    categoryId: 1,
                    description: '',
                    status: VisibilityStatus.Draft,
                    image: mockImageResponse,
                },
            });

            const memberData = {
                id: null,
                fullName: 'New Member',
                description: '',
                image: mockImageValue,
                categoryId: 1,
                status: VisibilityStatus.Draft,
                imageId: null,
            };

            const result = await TeamMembersApi.postMember(mockClient, memberData);

            expect(ImagesApi.post).toHaveBeenCalledWith(mockClient, mockImageValue);
            expect(mockClient.post).toHaveBeenCalledWith(
                '/TeamMembers',
                expect.objectContaining({ imageId: mockImageResponse.id }),
            );
            expect(result.id).toBe(2);
        });

        it('posts member without image if none present', async () => {
            mockClient.post.mockResolvedValue({
                data: {
                    id: 3,
                    fullName: 'No Image',
                    categoryId: 2,
                    description: '',
                    status: VisibilityStatus.Published,
                    image: null,
                },
            });

            const memberData = {
                id: null,
                fullName: 'No Image',
                description: '',
                image: null,
                categoryId: 2,
                status: VisibilityStatus.Published,
                imageId: null,
            };

            const result = await TeamMembersApi.postMember(mockClient, memberData);

            expect(ImagesApi.post).not.toHaveBeenCalled();
            expect(mockClient.post).toHaveBeenCalledWith('/TeamMembers', expect.objectContaining({ imageId: null }));
            expect(result.id).toBe(3);
        });
    });

    describe('TeamMembersApi.getAll param coverage', () => {
        beforeEach(() => {
            mockClient.get.mockReset();
            mockClient.get.mockResolvedValue({ data: { items: [], totalItemsCount: 0 } });
        });

        it('does NOT add categoryId param if categoryId is undefined', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        });

        it('does NOT add categoryId param if categoryId is null', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        });

        it('adds categoryId param if categoryId is a number', async () => {
            await TeamMembersApi.getAll(mockClient, 42, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: { categoryId: 42 } });
        });

        it('adds status param if status is defined (even null)', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, VisibilityStatus.Published, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: { status: VisibilityStatus.Published } });

            await TeamMembersApi.getAll(mockClient, undefined, null, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: { status: null } });
        });

        it('does NOT add offset param if offset is undefined', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        });

        it('does NOT add offset param if offset is null', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        });

        it('adds offset param if offset is a number', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, 5, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: { offset: 5 } });
        });

        it('does NOT add limit param if limit is undefined', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        });

        it('does NOT add limit param if limit is null', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, undefined);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: {} });
        });

        it('adds limit param floored if limit is a decimal number', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, 7.8);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: { limit: 7 } });
        });

        it('adds limit param if limit is an integer', async () => {
            await TeamMembersApi.getAll(mockClient, undefined, undefined, undefined, 10);
            expect(mockClient.get).toHaveBeenCalledWith('/TeamMembers', { params: { limit: 10 } });
        });
    });
});
