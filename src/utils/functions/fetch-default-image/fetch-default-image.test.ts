import { fetchDefaultImageAsImageValues } from './fetch-default-image';

describe('fetchDefaultImageAsImageValues', () => {
    let mockImg: Record<string, any>;
    let mockCtx: Record<string, any>;
    let mockCanvas: Record<string, any>;
    const originalImage = window.Image;
    const originalCreateElement = document.createElement.bind(document);

    beforeEach(() => {
        mockImg = {};

        mockCtx = {
            imageSmoothingQuality: '',
            drawImage: jest.fn(),
        };

        mockCanvas = {
            width: 0,
            height: 0,
            getContext: jest.fn().mockReturnValue(mockCtx),
            toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,abc123base64data'),
        };

        (window as any).Image = jest.fn(() => mockImg);

        jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'canvas') {
                return mockCanvas as unknown as HTMLCanvasElement;
            }
            return originalCreateElement(tag);
        });
    });

    afterEach(() => {
        (window as any).Image = originalImage;
        jest.restoreAllMocks();
    });

    it('should set image src to the provided URL', () => {
        fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        expect(mockImg.src).toBe('https://example.com/photo.png');
    });

    it('should resolve with base64 and mimeType on successful load', async () => {
        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        const result = await promise;

        expect(result).toEqual({
            base64: 'abc123base64data',
            mimeType: 'image/jpeg',
        });
    });

    it('should create canvas with correct dimensions', async () => {
        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        await promise;

        expect(mockCanvas.width).toBe(600);
        expect(mockCanvas.height).toBe(500);
    });

    it('should draw image on canvas with correct parameters', async () => {
        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        await promise;

        expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImg, 0, 0, 600, 500);
    });

    it('should call toDataURL with jpeg format and 0.85 quality', async () => {
        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        await promise;

        expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.85);
    });

    it('should set imageSmoothingQuality to high', async () => {
        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        await promise;

        expect(mockCtx.imageSmoothingQuality).toBe('high');
    });

    it('should reject when canvas 2d context is not available', async () => {
        mockCanvas.getContext = jest.fn().mockReturnValue(null);

        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        await expect(promise).rejects.toThrow('Canvas 2d context is not available');
    });

    it('should reject when image fails to load', async () => {
        const promise = fetchDefaultImageAsImageValues('https://example.com/broken.png', 600, 500);

        mockImg.onerror();

        await expect(promise).rejects.toThrow('Failed to load image: https://example.com/broken.png');
    });

    it('should reject when an error is thrown inside onload', async () => {
        const testError = new Error('toDataURL failed');
        mockCanvas.toDataURL = jest.fn().mockImplementation(() => {
            throw testError;
        });

        const promise = fetchDefaultImageAsImageValues('https://example.com/photo.png', 600, 500);

        mockImg.onload();

        await expect(promise).rejects.toThrow('toDataURL failed');
    });
});
