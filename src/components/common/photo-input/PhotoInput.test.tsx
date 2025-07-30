import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhotoInput from './PhotoInput';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ImageValues } from '../../../types/Image';

const createImageFile = () => new File(['dummy content'], 'example.png', { type: 'image/png' });
const MockImageValue: ImageValues = {
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9eQ6vqoAAAAASUVORK5CYII=',
    mimeType: 'image/jpeg',
    size: 0,
};

describe('PhotoInput', () => {
    let onChangeMock: jest.Mock;

    beforeEach(() => {
        onChangeMock = jest.fn();
        global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');
        global.URL.revokeObjectURL = jest.fn();
        jest.clearAllMocks();
    });

    it('renders placeholder when no image is selected', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER)).toBeInTheDocument();
        expect(screen.getByAltText(COMMON_TEXT_ADMIN.ALT.UPLOAD)).toBeInTheDocument();
    });

    it('renders image preview when ImageValue is provided', () => {
        render(<PhotoInput value={MockImageValue} onChange={onChangeMock} />);
        const previewImage = screen.getByTestId('preview-image');
        expect(previewImage).toBeInTheDocument();
        expect(previewImage).toHaveAttribute('src', `data:${MockImageValue.mimeType};base64,${MockImageValue.base64}`);
    });

    it('calls onChange when file is selected via input', async () => {
        const file = createImageFile();

        render(<PhotoInput value={null} onChange={onChangeMock} />);

        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

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

    it('calls onChange with null when remove button is clicked', () => {
        render(<PhotoInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        fireEvent.click(removeButton);

        expect(onChangeMock).toHaveBeenCalledWith(null);
    });

    it('does not call onChange for non-image file', () => {
        const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });
        render(<PhotoInput value={null} onChange={onChangeMock} />);

        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        fireEvent.change(fileInput, {
            target: { files: [file] },
        });

        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles drag and drop image', async () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const dropZone = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
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
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.dragOver(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(true);

        fireEvent.dragLeave(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
    });

    it('does not open file dialog or allow drop when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });
        const input = wrapper.querySelector('input[type="file"]')!;

        expect(wrapper.classList.contains('photo-input-wrapper-disabled')).toBe(true);

        fireEvent.click(wrapper);
        expect(document.activeElement).not.toBe(input);

        const file = createImageFile();
        fireEvent.drop(wrapper, {
            dataTransfer: { files: [file] },
        } as unknown as DragEvent);

        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles drag and drop when no files provided', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const dropZone = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
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
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        fireEvent.change(fileInput, {
            target: { files: null },
        });

        expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('handles mouse enter and leave events', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.mouseEnter(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(true);

        fireEvent.mouseLeave(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
    });

    it('does not add focus class on mouse enter when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.mouseEnter(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
    });

    it('does not add focus class on mouse leave when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.mouseLeave(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
    });

    it('handles keyboard events (Enter and Space)', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });
        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        const clickSpy = jest.spyOn(fileInput, 'click');

        fireEvent.keyDown(wrapper, { key: 'Enter' });
        expect(clickSpy).toHaveBeenCalled();

        clickSpy.mockClear();

        fireEvent.keyDown(wrapper, { key: ' ' });
        expect(clickSpy).toHaveBeenCalled();

        clickSpy.mockRestore();
    });

    it('does not handle keyboard events when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });
        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        const clickSpy = jest.spyOn(fileInput, 'click');

        fireEvent.keyDown(wrapper, { key: 'Enter' });
        expect(clickSpy).not.toHaveBeenCalled();

        fireEvent.keyDown(wrapper, { key: ' ' });
        expect(clickSpy).not.toHaveBeenCalled();

        clickSpy.mockRestore();
    });

    it('ignores non-Enter/Space keyboard events', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });
        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        const clickSpy = jest.spyOn(fileInput, 'click');

        fireEvent.keyDown(wrapper, { key: 'Escape' });
        expect(clickSpy).not.toHaveBeenCalled();

        clickSpy.mockRestore();
    });

    it('handles focus and blur events', () => {
        const onBlurMock = jest.fn();
        render(<PhotoInput value={null} onChange={onChangeMock} onBlur={onBlurMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.focus(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(true);

        fireEvent.blur(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
        expect(onBlurMock).toHaveBeenCalled();
    });

    it('does not handle focus/blur when disabled', () => {
        const onBlurMock = jest.fn();
        render(<PhotoInput value={null} onChange={onChangeMock} onBlur={onBlurMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.focus(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);

        fireEvent.blur(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
        expect(onBlurMock).toHaveBeenCalled();
    });

    it('calls onBlur even without onBlur prop', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        expect(() => fireEvent.blur(wrapper)).not.toThrow();
    });

    it('does not add focus class on drag over when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        fireEvent.dragOver(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
    });

    it('clears input value when removing file', () => {
        render(<PhotoInput value={MockImageValue} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.ALT.DELETE });
        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        Object.defineProperty(fileInput, 'value', {
            writable: true,
            value: 'test-file.png',
        });

        fireEvent.click(removeButton);

        expect(onChangeMock).toHaveBeenCalledWith(null);
        expect(fileInput.value).toBe('');
    });

    it('renders with custom id and name attributes', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} id="custom-id" name="custom-name" />);

        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;
        expect(fileInput.id).toBe('custom-id');
        expect(fileInput.name).toBe('custom-name');
    });

    it('sets correct tabIndex when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        expect(wrapper.getAttribute('tabIndex')).toBe('-1');
    });

    it('sets correct tabIndex when enabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByRole('button', {
            name: COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo',
        });

        expect(wrapper.getAttribute('tabIndex')).toBe('0');
    });
});
