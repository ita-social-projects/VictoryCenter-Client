import {AxiosInstance} from "axios";
import {Image, ImageValues} from "../../../../types/Image";
import {ImagesApi} from "./ImageDataApi";

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

const mockImage : Image = {
    id: 1,
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+iF9kAAAAASUVORK5CYII=",
    mimeType: "image/png",

}
const imageValue : ImageValues = {
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+iF9kAAAAASUVORK5CYII=",
    mimeType: "image/png",
}
describe("fetchImageDataApi", () => {
    it("should fetch image data", async () => {

        mockClient.get.mockResolvedValue({ data: mockImage });

        const image = await  ImagesApi.get(mockClient, 1);
        expect(image).toEqual({
            id: 1,
            base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+iF9kAAAAASUVORK5CYII=",
            mimeType: "image/png"
        })
    })
    it("should post image ", async () => {
        mockClient.post.mockResolvedValue({ data: mockImage });

        const result = await ImagesApi.post(mockClient, imageValue);

        expect(mockClient.post).toHaveBeenCalledWith('/Image', {
            base64: imageValue.base64,
            mimeType: imageValue.mimeType,
        });
        expect(result).toEqual(mockImage);
    })

    it("should update image ", async () => {
        mockClient.put.mockResolvedValue({ data: mockImage });

        const result = await ImagesApi.put(mockClient, imageValue, 1 );

        expect(mockClient.put).toHaveBeenCalledWith('/Image/1', {
            base64: imageValue.base64,
            mimeType: imageValue.mimeType,
        });
        expect(result).toEqual(mockImage);
    })

    it("should delete the image", async () => {

        var id = 1;
        mockClient.delete.mockResolvedValue({ data: id });

        const result = await ImagesApi.delete(mockClient, id);
        expect(mockClient.delete).toHaveBeenCalledWith('/Image/1')
        expect(result).toEqual(id);

    })
})