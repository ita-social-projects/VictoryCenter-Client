import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CropModal } from './CropperModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ImageValues } from '@/types/common/image';
import { PixelCrop } from 'react-image-crop';

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
let resizeObserverCallback: ResizeObserverCallback | null = null;

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

beforeEach(() => {
    resizeObserverCallback = null;
    global.ResizeObserver = jest.fn().mockImplementation((callback: ResizeObserverCallback) => {
        resizeObserverCallback = callback;
        return {
            observe: jest.fn(),
            disconnect: jest.fn(),
            unobserve: jest.fn(),
        };
    }) as typeof ResizeObserver;
});

jest.mock('react-image-crop', () => {
    const MockReactCrop = ({
        children,
        onChange,
        onComplete,
        crop,
    }: {
        children: React.ReactNode;
        onChange: (crop: any) => void;
        onComplete: (crop: any) => void;
        crop?: any;
    }) => {
        return (
            <div
                data-testid="react-crop-mock"
                data-crop={JSON.stringify(crop)}
                ref={(element) => {
                    if (element) {
                        (element as any).mockOnChange = onChange;
                        (element as any).mockOnComplete = onComplete;
                    }
                }}
            >
                {children}
                <button
                    data-testid="mock-crop-change"
                    onClick={() =>
                        onChange({
                            unit: 'px',
                            x: 10,
                            y: 10,
                            width: 100,
                            height: 100,
                        })
                    }
                >
                    Change Crop
                </button>
                <button
                    data-testid="mock-crop-complete"
                    onClick={() =>
                        onComplete({
                            unit: 'px',
                            x: 20,
                            y: 20,
                            width: 50,
                            height: 50,
                        })
                    }
                >
                    Complete Crop
                </button>
            </div>
        );
    };

    return {
        __esModule: true,
        default: MockReactCrop,
        centerCrop: jest.fn(),
        makeAspectCrop: jest.fn(),
        Crop: {},
        PixelCrop: {},
    };
});

const MockImageValue: ImageValues = {
    base64: 'iVBORw0goAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9eQ6vqoAAAAASUVORK5CYII=',
    mimeType: 'image/jpeg',
};

interface DefaultProps {
    src: ImageValues | null;
    onChange: jest.Mock;
    height: number;
    width: number;
    onCancel: jest.Mock;
    isOpen: boolean;
}

const defaultProps: DefaultProps = {
    src: MockImageValue,
    onChange: jest.fn(),
    height: 200,
    width: 300,
    onCancel: jest.fn(),
    isOpen: true,
};

const mockImageLoad = (element: HTMLImageElement | null) => {
    if (!element) return;
    Object.defineProperties(element, {
        naturalWidth: { value: 600, writable: true },
        naturalHeight: { value: 400, writable: true },
        width: { value: 450, writable: true },
        height: { value: 300, writable: true },
    });
    fireEvent.load(element);
};

const mockImageLoadWithDimensions = (
    element: HTMLImageElement | null,
    dimensions: { naturalWidth: number; naturalHeight: number; width: number; height: number },
) => {
    if (!element) return;
    Object.defineProperties(element, {
        naturalWidth: { value: dimensions.naturalWidth, writable: true },
        naturalHeight: { value: dimensions.naturalHeight, writable: true },
        width: { value: dimensions.width, writable: true },
        height: { value: dimensions.height, writable: true },
    });
    fireEvent.load(element);
};

describe('CropModal', () => {
    let mockGetContext: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCanvas.toDataURL.mockImplementation(() => 'data:image/jpeg;base64,MOCKED_CROPPED_BASE64');

        mockCanvasContext.drawImage.mockClear();

        mockGetContext = jest.spyOn(mockCanvas, 'getContext');
        mockGetContext.mockImplementation((contextType: string) => (contextType === '2d' ? mockCanvasContext : null));

        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        mockGetContext.mockRestore();
    });

    it('Does not render when isOpen=false', () => {
        render(<CropModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('Редагувати фото')).not.toBeInTheDocument();
    });

    it('Renders title and buttons when isOpen=true', () => {
        render(<CropModal {...defaultProps} />);
        expect(screen.getByText('Редагувати фото')).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
    });

    it('Renders loader when src=null', () => {
        render(<CropModal {...defaultProps} src={null} />);
        const loader = document.querySelector('.cropper-container .loader');
        expect(loader).toBeInTheDocument();
    });

    it('Renders ReactCrop and img with correct src when image is present', () => {
        render(<CropModal {...defaultProps} />);
        expect(screen.getByTestId('react-crop-mock')).toBeInTheDocument();
        const imgElement = screen.getByAltText('Crop target');
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute('src', `data:${MockImageValue.mimeType};base64,${MockImageValue.base64}`);
    });

    it('Calls onCancel when "Cancel" button is clicked', () => {
        render(<CropModal {...defaultProps} />);
        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        fireEvent.click(cancelButton);
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('Handles image load and sets initial crop', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');

        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            const cropMock = screen.getByTestId('react-crop-mock');
            const cropData = JSON.parse(cropMock.dataset.crop!);

            expect(cropData.unit).toBe('px');
            expect(cropData.width).toBeCloseTo(225);
            expect(cropData.height).toBeCloseTo(150);
            expect(cropData.x).toBeCloseTo(112.5);
            expect(cropData.y).toBeCloseTo(75);
        });
    });

    it('Handles onChange event from ReactCrop', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');
        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            expect(JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!)).toHaveProperty('width');
        });

        const cropChangeButton = screen.getByTestId('mock-crop-change');
        fireEvent.click(cropChangeButton);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.x).toBe(10);
            expect(cropData.y).toBe(10);
            expect(cropData.width).toBe(225);
            expect(cropData.height).toBe(150);
        });
    });

    it('Handles onComplete event from ReactCrop', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');
        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            expect(JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!)).toHaveProperty('width');
        });

        const cropCompleteButton = screen.getByTestId('mock-crop-complete');
        fireEvent.click(cropCompleteButton);

        const submitButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
            expect(mockCanvasContext.drawImage).toHaveBeenCalledWith(
                imgElement,
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                0,
                0,
                300,
                200,
            );
        });
    });

    it('Calls onChange with cropped image data when "Submit" is clicked', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');

        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            expect(JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!)).toHaveProperty('x');
        });

        const submitButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockCanvas.toDataURL).toHaveBeenCalledWith(MockImageValue.mimeType);
            expect(defaultProps.onChange).toHaveBeenCalledWith({
                base64: 'MOCKED_CROPPED_BASE64',
                mimeType: MockImageValue.mimeType,
            });
        });
    });

    it('Handles situation when getCroppedImageBase64 returns null', async () => {
        const { rerender } = render(<CropModal {...defaultProps} />);
        rerender(<CropModal {...defaultProps} src={null} />);

        const submitButton = screen.queryByText(COMMON_TEXT_ADMIN.BUTTON.YES);

        if (submitButton) {
            fireEvent.click(submitButton);
        }

        expect(defaultProps.onChange).not.toHaveBeenCalled();
        expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });

    it('Does not initialize crop when image dimensions are missing', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target') as HTMLImageElement;

        mockImageLoadWithDimensions(imgElement, {
            naturalWidth: 0,
            naturalHeight: 0,
            width: 0,
            height: 0,
        });

        await waitFor(() => {
            expect(screen.getByTestId('react-crop-mock').dataset.crop).toBeUndefined();
        });
    });

    it('Ignores crop changes before crop is initialized', () => {
        render(<CropModal {...defaultProps} />);

        fireEvent.click(screen.getByTestId('mock-crop-change'));

        expect(screen.getByTestId('react-crop-mock').dataset.crop).toBeUndefined();
    });

    it('Restricts crop movement within image bounds', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');
        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            expect(JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!).x).toBeCloseTo(112.5);
        });

        const newCrop: PixelCrop = {
            unit: 'px',
            x: 500,
            y: 500,
            width: 225,
            height: 150,
        };

        const reactCropElement = screen.getByTestId('react-crop-mock');
        act(() => {
            (reactCropElement as any).mockOnChange(newCrop);
        });

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.x).toBeCloseTo(225);
            expect(cropData.y).toBeCloseTo(150);
        });
    });

    it('Restricts crop movement to zero when dragged beyond top or left bounds', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');
        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            expect(JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!).x).toBeCloseTo(112.5);
        });

        const reactCropElement = screen.getByTestId('react-crop-mock');
        act(() => {
            (reactCropElement as any).mockOnChange({
                unit: 'px',
                x: -50,
                y: -40,
                width: 225,
                height: 150,
            });
        });

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.x).toBe(0);
            expect(cropData.y).toBe(0);
        });
    });

    it('Recalculates crop when image dimensions change on window resize', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target');

        mockImageLoad(imgElement as HTMLImageElement);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.x).toBeCloseTo(112.5);
        });

        Object.defineProperties(imgElement, {
            width: { value: 300, writable: true },
            height: { value: 200, writable: true },
        });

        fireEvent.resize(window);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.width).toBeCloseTo(150);
            expect(cropData.x).toBeCloseTo(75);
        });
    });

    it('Recalculates crop when image dimensions change after load without window resize', async () => {
        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target') as HTMLImageElement;

        mockImageLoad(imgElement);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.width).toBeCloseTo(225);
            expect(cropData.height).toBeCloseTo(150);
        });

        Object.defineProperties(imgElement, {
            width: { value: 300, writable: true },
            height: { value: 200, writable: true },
        });

        resizeObserverCallback?.([] as ResizeObserverEntry[], {} as ResizeObserver);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.width).toBeCloseTo(150);
            expect(cropData.height).toBeCloseTo(100);
            expect(cropData.x).toBeCloseTo(75);
            expect(cropData.y).toBeCloseTo(50);
        });
    });

    it('Recalculates crop on window resize when ResizeObserver is unavailable', async () => {
        global.ResizeObserver = undefined as unknown as typeof ResizeObserver;

        render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target') as HTMLImageElement;

        mockImageLoad(imgElement);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.width).toBeCloseTo(225);
        });

        Object.defineProperties(imgElement, {
            width: { value: 300, writable: true },
            height: { value: 200, writable: true },
        });

        fireEvent.resize(window);

        await waitFor(() => {
            const cropData = JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!);
            expect(cropData.width).toBeCloseTo(150);
            expect(cropData.height).toBeCloseTo(100);
        });
    });

    it('Ignores crop changes when image ref is cleared', async () => {
        const { rerender } = render(<CropModal {...defaultProps} />);
        const imgElement = screen.getByAltText('Crop target') as HTMLImageElement;

        mockImageLoad(imgElement);

        await waitFor(() => {
            expect(JSON.parse(screen.getByTestId('react-crop-mock').dataset.crop!).width).toBeCloseTo(225);
        });

        const reactCropElement = screen.getByTestId('react-crop-mock');
        const oldOnChange = (reactCropElement as any).mockOnChange;

        rerender(<CropModal {...defaultProps} src={null} />);

        act(() => {
            oldOnChange({
                unit: 'px',
                x: 10,
                y: 10,
                width: 225,
                height: 150,
            });
        });

        expect(defaultProps.onChange).not.toHaveBeenCalled();
        expect(screen.queryByTestId('react-crop-mock')).not.toBeInTheDocument();
    });
});
