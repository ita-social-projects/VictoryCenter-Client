import { AxiosInstance } from 'axios';
import { Image, ImageValues } from '../../../../types/common/image';
import { ImageApi } from './image-api';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

const mockImage: Image = {
    id: 1,
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+iF9kAAAAASUVORK5CYII=',
    mimeType: 'image/png',
    size: 0,
};
const imageValue: ImageValues = {
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+iF9kAAAAASUVORK5CYII=',
    mimeType: 'image/png',
    size: 0,
};
describe('fetchImageDataApi', () => {
    it('should fetch image data', async () => {
        mockClient.get.mockResolvedValue({ data: mockImage });

        const image = await ImageApi.get(mockClient, 1);
        expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.IMAGE.BASE}/1`);
        expect(image).toEqual(mockImage);
    });
    it('should post image', async () => {
        mockClient.post.mockResolvedValue({ data: mockImage });

        const result = await ImageApi.post(mockClient, imageValue);

        expect(mockClient.post).toHaveBeenCalledWith(`${API_ROUTES.IMAGE.BASE}`, {
            base64: imageValue.base64,
            mimeType: imageValue.mimeType,
        });
        expect(result).toEqual(mockImage);
    });

    it('should update image', async () => {
        mockClient.put.mockResolvedValue({ data: mockImage });

        const result = await ImageApi.put(mockClient, imageValue, 1);

        expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.IMAGE.BASE}/1`, {
            base64: imageValue.base64,
            mimeType: imageValue.mimeType,
        });
        expect(result).toEqual(mockImage);
    });

    it('should delete the image', async () => {
        const id = 1;
        mockClient.delete.mockResolvedValue({ data: id });

        const result = await ImageApi.delete(mockClient, id);
        expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.IMAGE.BASE}/1`);
        expect(result).toEqual(1);
    });
});
