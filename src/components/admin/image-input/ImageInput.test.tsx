import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { convertFileToBase64, ImageInput, getImageSrc } from './ImageInput';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { Image, ImageValues } from '../../../types/common/image';

jest.mock('../confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, onClose }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="confirmation-modal">
                <button data-testid="confirm-button" onClick={onConfirm}>
                    Confirm
                </button>
                <button data-testid="cancel-button" onClick={onCancel}>
                    Cancel
                </button>
                <button data-testid="close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        );
    },
}));

const createImageFile = () => new File(['dummy content'], 'example.png', { type: 'image/png' });
const MockImageValue: ImageValues = {
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9eQ6vqoAAAAASUVORK5CYII=',
    mimeType: 'image/jpeg',
    size: 0,
};

const MockImage: Image = {
    id: 1,
    url: 'https://fastly.picsum.images/id/127/800/600.jpg?hmac=dEtPV01KgGCkVNl7r2XZX0hwXkWeQvsf7jsdrZtmwnc',
    mimeType: 'image/png',
};

describe('ImageInput', () => {
    let onChangeMock: jest.Mock;

    beforeEach(() => {
        onChangeMock = jest.fn();
        global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');
        global.URL.revokeObjectURL = jest.fn();

        jest.clearAllMocks();
    });

    it('renders placeholder when no image is selected', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER)).toBeInTheDocument();
        expect(screen.getByAltText(COMMON_TEXT_ADMIN.ALT.UPLOAD)).toBeInTheDocument();
    });

    it('renders image preview when ImageValue is provided', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);
        const previewImage = screen.getByTestId('preview-image');
        expect(previewImage).toBeInTheDocument();
        expect(previewImage).toHaveAttribute('src', `data:${MockImageValue.mimeType};base64,${MockImageValue.base64}`);
    });

    it('renders image preview when Image is provided', () => {
        render(<ImageInput value={MockImage} onChange={onChangeMock} />);
        const previewImage = screen.getByTestId('preview-image');
        expect(previewImage).toBeInTheDocument();
        expect(previewImage).toHaveAttribute('src', MockImage.url);
    });

    it('calls onChange when file is selected via input', async () => {
        const file = createImageFile();

        render(<ImageInput value={null} onChange={onChangeMock} />);

        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        fireEvent.change(fileInput, {
            target: { files: [file] },
        });

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith({
                base64: expect.any(String),
                mimeType: 'image/png',
                size: 13,
            });
        });
    });

    it('shows confirmation modal when remove button is clicked', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        fireEvent.click(removeButton);

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('calls onChange with null when confirm button is clicked in modal', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        fireEvent.click(removeButton);

        const confirmButton = screen.getByTestId('confirm-button');
        fireEvent.click(confirmButton);

        expect(onChangeMock).toHaveBeenCalledWith(null);
    });

    it('closes confirmation modal when cancel button is clicked', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        fireEvent.click(removeButton);

        const cancelButton = screen.getByTestId('cancel-button');
        fireEvent.click(cancelButton);

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('closes confirmation modal when close button is clicked', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        fireEvent.click(removeButton);

        const closeButton = screen.getByTestId('close-button');
        fireEvent.click(closeButton);

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('does not call onChange for non-image file', () => {
        const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });
        render(<ImageInput value={null} onChange={onChangeMock} />);

        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        fireEvent.change(fileInput, {
            target: { files: [file] },
        });

        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles drag and drop image', async () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const dropZone = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        const file = createImageFile();

        const data = {
            dataTransfer: {
                files: [file],
                types: ['Files'],
            },
        };

        fireEvent.dragOver(dropZone);
        fireEvent.drop(dropZone, data as unknown as DragEvent);

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith({
                base64: expect.any(String),
                mimeType: file.type,
                size: 13,
            });
        });
    });

    it('adds focus class on drag over and removes on drag leave', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.dragOver(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(true);

        fireEvent.dragLeave(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
    });

    it('does not open file dialog or allow drop when disabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });
        const input = wrapper.querySelector('input[type="file"]')!;

        expect(wrapper.classList.contains('image-input-wrapper-disabled')).toBe(true);

        fireEvent.click(wrapper);
        expect(document.activeElement).not.toBe(input);

        const file = createImageFile();
        fireEvent.drop(wrapper, {
            dataTransfer: { files: [file] },
        } as unknown as DragEvent);

        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles drag and drop when no files provided', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const dropZone = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        const data = {
            dataTransfer: {
                files: [],
                types: ['Files'],
            },
        };

        fireEvent.drop(dropZone, data as unknown as DragEvent);
        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles file input change when no files provided', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        fireEvent.change(fileInput, {
            target: { files: null },
        });

        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles mouse enter and leave events', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.mouseEnter(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(true);

        fireEvent.mouseLeave(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
    });

    it('does not add focus class on mouse enter when disabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.mouseEnter(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
    });

    it('does not add focus class on mouse leave when disabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.mouseLeave(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
    });

    it('handles keyboard events (Enter and Space)', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });
        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        const clickSpy = jest.spyOn(fileInput, 'click');

        fireEvent.keyDown(wrapper, { key: 'Enter' });
        expect(clickSpy).toHaveBeenCalled();

        clickSpy.mockClear();

        fireEvent.keyDown(wrapper, { key: ' ' });
        expect(clickSpy).toHaveBeenCalled();

        clickSpy.mockRestore();
    });

    it('does not handle keyboard events when disabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });
        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        const clickSpy = jest.spyOn(fileInput, 'click');

        fireEvent.keyDown(wrapper, { key: 'Enter' });
        expect(clickSpy).not.toHaveBeenCalled();

        fireEvent.keyDown(wrapper, { key: ' ' });
        expect(clickSpy).not.toHaveBeenCalled();

        clickSpy.mockRestore();
    });

    it('ignores non-Enter/Space keyboard events', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });
        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        const clickSpy = jest.spyOn(fileInput, 'click');

        fireEvent.keyDown(wrapper, { key: 'Escape' });
        expect(clickSpy).not.toHaveBeenCalled();

        clickSpy.mockRestore();
    });

    it('handles focus and blur events', () => {
        const onBlurMock = jest.fn();
        render(<ImageInput value={null} onChange={onChangeMock} onBlur={onBlurMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.focus(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(true);

        fireEvent.blur(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
        expect(onBlurMock).toHaveBeenCalled();
    });

    it('does not handle focus/blur when disabled', () => {
        const onBlurMock = jest.fn();
        render(<ImageInput value={null} onChange={onChangeMock} onBlur={onBlurMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.focus(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);

        fireEvent.blur(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
        expect(onBlurMock).toHaveBeenCalled();
    });

    it('calls onBlur even without onBlur prop', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        expect(() => fireEvent.blur(wrapper)).not.toThrow();
    });

    it('does not add focus class on drag over when disabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        fireEvent.dragOver(wrapper);
        expect(wrapper.classList.contains('image-input-wrapper-focused')).toBe(false);
    });

    it('clears input value when removing file through confirmation modal', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;

        Object.defineProperty(fileInput, 'value', {
            writable: true,
            value: 'test-file.png',
        });

        fireEvent.click(removeButton);
        const confirmButton = screen.getByTestId('confirm-button');
        fireEvent.click(confirmButton);

        expect(onChangeMock).toHaveBeenCalledWith(null);
        expect(fileInput.value).toBe('');
    });

    it('renders with custom id and name attributes', () => {
        render(<ImageInput value={null} onChange={onChangeMock} id="custom-id" name="custom-name" />);

        const fileInput = screen.getByTestId('image-input-hidden') as HTMLInputElement;
        expect(fileInput.id).toBe('custom-id');
        expect(fileInput.name).toBe('custom-name');
    });

    it('sets correct tabIndex when disabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        expect(wrapper.getAttribute('tabIndex')).toBe('-1');
    });

    it('sets correct tabIndex when enabled', () => {
        render(<ImageInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE,
        });

        expect(wrapper.getAttribute('tabIndex')).toBe('0');
    });

    it('should update the preview when the value prop changes to a new image', () => {
        const { rerender } = render(<ImageInput value={MockImage} onChange={onChangeMock} />);

        const preview = screen.getByTestId('preview-image') as HTMLImageElement;
        expect(preview.src).toBe(MockImage.url);

        rerender(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        expect(preview.src).toBe(`data:${MockImageValue.mimeType};base64,${MockImageValue.base64}`);
    });

    it('does not show delete button when disabled', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} disabled />);

        expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE })).not.toBeInTheDocument();
    });

    it('shows delete button when not disabled and image is present', () => {
        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE })).toBeInTheDocument();
    });

    it('stops propagation when delete button is clicked', () => {
        const mockStopPropagation = jest.fn();

        render(<ImageInput value={MockImageValue} onChange={onChangeMock} />);

        const deleteButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });

        const mockEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(mockEvent, 'stopPropagation', {
            value: mockStopPropagation,
            writable: false,
        });

        fireEvent(deleteButton, mockEvent);

        expect(mockStopPropagation).toHaveBeenCalled();
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    describe('convertFileToBase64', () => {
        it('should resolve with base64 string, mimeType, and size for a valid file', async () => {
            const file = new File(['test'], 'image.png', { type: 'image/png' });
            const result = await convertFileToBase64(file);

            expect(result.base64).toEqual(expect.any(String));
            expect(result.mimeType).toBe('image/png');
            expect(result.size).toBe(4);
        });

        it('should reject the promise if the FileReader fails', async () => {
            const file = new File(['test'], 'image.png', { type: 'image/png' });

            // Mock FileReader to simulate an error
            const error = new Error('FileReader Error');
            const mockReader = {
                readAsDataURL: jest.fn(),
                // Set the onerror property to be called immediately, now with correct types
                set onerror(callback: (reason?: any) => void) {
                    // The callback is the 'reject' function of the promise.
                    // We can safely call it with our mock error.
                    if (callback) {
                        callback(error);
                    }
                },
            };
            jest.spyOn(global, 'FileReader').mockImplementation(() => mockReader as any);

            // Ensure the promise rejects with the mocked error
            await expect(convertFileToBase64(file)).rejects.toThrow('FileReader Error');
        });

        it('should reject the promise if the FileReader encounters an error', async () => {
            const file = new File(['test'], 'image.png', { type: 'image/png' });
            const mockError = new DOMException('FileReader Error');

            // Mock the global FileReader to simulate an error
            jest.spyOn(global, 'FileReader').mockImplementation(() => {
                // Create a simple mock object that mimics FileReader's API
                // This avoids the recursive call that was causing the stack overflow.
                const mockReader = {
                    onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
                    readAsDataURL: jest.fn(function (this: any) {
                        // When readAsDataURL is called, we immediately trigger the onerror handler
                        // to simulate a failure.
                        if (this.onerror) {
                            this.onerror(mockError as any);
                        }
                    }),
                };
                return mockReader as any;
            });

            // We expect the promise to reject with the error we simulated.
            await expect(convertFileToBase64(file)).rejects.toBe(mockError);
        });

        it('should reject the promise if data URL format is invalid', async () => {
            const file = new File(['test'], 'image.png', { type: 'image/png' });

            // Mock FileReader to return invalid data URL format
            jest.spyOn(global, 'FileReader').mockImplementation(() => {
                const mockReader = {
                    onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
                    onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
                    result: 'invalid-data-url-format',
                    readAsDataURL: jest.fn(function (this: any) {
                        if (this.onload) {
                            this.onload({ target: { result: this.result } } as any);
                        }
                    }),
                };
                return mockReader as any;
            });

            await expect(convertFileToBase64(file)).rejects.toThrow('Invalid data URL format');
        });
    });

    describe('getImageSrc', () => {
        it('should return undefined when the input image is null', () => {
            expect(getImageSrc(null)).toBeUndefined();
        });

        // This tests the condition `if ('url' in img && img.url)` where `img.url` is not truthy.
        it('should return undefined for an Image object with an empty string URL', () => {
            const mockImage = {
                id: 1,
                url: '', // Falsy URL
                mimeType: 'image/png',
            };
            expect(getImageSrc(mockImage)).toBeUndefined();
        });

        // Test case 3: Input is an object that doesn't match expected shapes
        // This handles the final `return undefined` statement. It simulates receiving an object
        // that has neither a 'url' nor a 'base64' property.
        it('should return undefined for an object that does not have a url or base64 property', () => {
            const malformedImageObject = {
                someOtherProp: 'value',
            };
            // The function expects an object of type Image or ImageValues, but we cast to 'any'
            // to test this edge case where the object shape is incorrect.
            expect(getImageSrc(malformedImageObject as any)).toBeUndefined();
        });
    });
});
