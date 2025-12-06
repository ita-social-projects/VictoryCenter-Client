import { getCroppedImageBase64 } from './get-cropped-image-base-64';
import { ImageValues } from '../../../types/common/image';
import { PixelCrop, Crop } from 'react-image-crop';

const mockCanvasContext = {
    drawImage: jest.fn(),
    imageSmoothingQuality: '',
};

const mockCanvas = {
    getContext: jest.fn((contextType: string) => (contextType === '2d' ? mockCanvasContext : null)),
    toDataURL: jest.fn(() => 'data:image/jpeg;base64,MOCKED_CROPPED_BASE64'),
    width: 0,
    height: 0,
};

const originalCreateElement = document.createElement;

beforeAll(() => {
    document.createElement = (tagName: keyof HTMLElementTagNameMap | string) => {
        if (tagName === 'canvas') {
            return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement.call(document, tagName);
    };
});

afterAll(() => {
    document.createElement = originalCreateElement;
});

const MockImageValue: ImageValues = {
    base64: 'iVBORw0goAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9eQ6vqoAAAAASUVORK5CYII=',
    mimeType: 'image/jpeg',
};

describe('getCroppedImageBase64', () => {
    let mockGetContext: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCanvas.toDataURL.mockImplementation(() => 'data:image/jpeg;base64,MOCKED_CROPPED_BASE64');
        mockCanvasContext.drawImage.mockClear();

        mockGetContext = jest.spyOn(mockCanvas, 'getContext');
        mockGetContext.mockImplementation((contextType: string) => (contextType === '2d' ? mockCanvasContext : null));
    });

    afterEach(() => {
        mockGetContext.mockRestore();
    });

    it('returns null when image is null', () => {
        const result = getCroppedImageBase64(
            null,
            { unit: 'px', x: 0, y: 0, width: 100, height: 100 },
            300,
            200,
            MockImageValue,
        );
        expect(result).toBeNull();
    });

    it('returns null when cropToUse is undefined', () => {
        const mockImage = document.createElement('img');
        const result = getCroppedImageBase64(mockImage, undefined, 300, 200, MockImageValue);
        expect(result).toBeNull();
    });

    it('draws image with pixel crop coordinates', () => {
        const mockImage = document.createElement('img');
        Object.defineProperties(mockImage, {
            naturalWidth: { value: 600, writable: true },
            naturalHeight: { value: 400, writable: true },
            width: { value: 450, writable: true },
            height: { value: 300, writable: true },
        });

        const crop: PixelCrop = {
            unit: 'px',
            x: 150,
            y: 120,
            width: 90,
            height: 75,
        };

        getCroppedImageBase64(mockImage, crop, 300, 200, MockImageValue);

        expect(mockCanvasContext.drawImage).toHaveBeenCalledWith(
            mockImage,
            200,
            160,
            120,
            100,
            0,
            0,
            300,
            200,
        );
    });

    it('draws image with percentage crop coordinates', () => {
        const mockImage = document.createElement('img');
        Object.defineProperties(mockImage, {
            naturalWidth: { value: 600, writable: true },
            naturalHeight: { value: 400, writable: true },
            width: { value: 450, writable: true },
            height: { value: 300, writable: true },
        });

        const crop: Crop = {
            unit: '%',
            x: 10,
            y: 10,
            width: 50,
            height: 50,
        };

        getCroppedImageBase64(mockImage, crop, 300, 200, MockImageValue);

        expect(mockCanvasContext.drawImage).toHaveBeenCalledWith(mockImage, 60, 40, 300, 200, 0, 0, 300, 200);
    });

    it('returns data URL with correct mime type', () => {
        const mockImage = document.createElement('img');
        Object.defineProperties(mockImage, {
            naturalWidth: { value: 600, writable: true },
            naturalHeight: { value: 400, writable: true },
            width: { value: 450, writable: true },
            height: { value: 300, writable: true },
        });

        const crop: PixelCrop = {
            unit: 'px',
            x: 0,
            y: 0,
            width: 225,
            height: 150,
        };

        const result = getCroppedImageBase64(mockImage, crop, 300, 200, MockImageValue);

        expect(mockCanvas.toDataURL).toHaveBeenCalledWith(MockImageValue.mimeType);
        expect(result).toBe('data:image/jpeg;base64,MOCKED_CROPPED_BASE64');
    });

    it('returns data URL with default mime type when rawImage is null', () => {
        const mockImage = document.createElement('img');
        Object.defineProperties(mockImage, {
            naturalWidth: { value: 600, writable: true },
            naturalHeight: { value: 400, writable: true },
            width: { value: 450, writable: true },
            height: { value: 300, writable: true },
        });

        const crop: PixelCrop = {
            unit: 'px',
            x: 0,
            y: 0,
            width: 225,
            height: 150,
        };

        const result = getCroppedImageBase64(mockImage, crop, 300, 200, null);

        expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg');
        expect(result).toBe('data:image/jpeg;base64,MOCKED_CROPPED_BASE64');
    });

    it('throws error when canvas 2d context is not available', () => {
        const mockImage = document.createElement('img');
        Object.defineProperties(mockImage, {
            naturalWidth: { value: 600, writable: true },
            naturalHeight: { value: 400, writable: true },
            width: { value: 450, writable: true },
            height: { value: 300, writable: true },
        });

        mockGetContext.mockImplementation(() => null);

        const crop: PixelCrop = {
            unit: 'px',
            x: 0,
            y: 0,
            width: 225,
            height: 150,
        };

        expect(() => {
            getCroppedImageBase64(mockImage, crop, 300, 200, MockImageValue);
        }).toThrow('No 2d context');
    });
});
