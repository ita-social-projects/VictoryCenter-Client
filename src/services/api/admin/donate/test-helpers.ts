import { AxiosInstance } from 'axios';

export const createMockAxiosClient = () => {
    return {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;
};

export const expectDeleteCall = (mockClient: jest.Mocked<AxiosInstance>, route: string, id: number) => {
    it(`deletes with id ${id}`, async () => {
        mockClient.delete.mockResolvedValue({});

        const result = await mockClient.delete(`${route}/${id}`);

        expect(mockClient.delete).toHaveBeenCalledWith(`${route}/${id}`);
        expect(result).toBeUndefined();
    });
};
