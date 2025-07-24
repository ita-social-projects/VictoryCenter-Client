import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoInput } from './PhotoInput';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

const createImageFile = () => new File(['dummy content'], 'example.png', { type: 'image/png' });

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

    it('renders image preview when string value is provided', () => {
        render(<PhotoInput value="http://example.com/image.jpg" onChange={onChangeMock} />);
        expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
    });

    it('renders image preview when file value is provided', () => {
        const file = createImageFile();
        render(<PhotoInput value={file} onChange={onChangeMock} />);
        expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
    });

    it('calls onChange when file is selected via input', () => {
        const file = createImageFile();

        render(<PhotoInput value={null} onChange={onChangeMock} />);

        const fileInput = screen.getByTestId('photo-input-hidden') as HTMLInputElement;

        fireEvent.change(fileInput, {
            target: { files: [file] },
        });

        expect(onChangeMock).toHaveBeenCalledWith(file);
    });

    it('calls onChange with null when remove button is clicked', () => {
        const file = createImageFile();
        render(<PhotoInput value={file} onChange={onChangeMock} />);

        const removeButton = screen.getByRole('button');
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

    it('handles drag and drop image', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const dropZone = screen.getByText(/перетягніть файл/i).parentElement!;

        const file = createImageFile();

        const data = {
            dataTransfer: {
                files: [file],
                types: ['Files'],
            },
        };

        fireEvent.dragOver(dropZone);
        fireEvent.drop(dropZone, data as unknown as DragEvent);

        expect(onChangeMock).toHaveBeenCalledWith(file);
    });

    it('adds focus class on drag over and removes on drag leave', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} />);
        const wrapper = screen.getByText(/перетягніть файл/i).closest('.photo-input-wrapper')!;

        fireEvent.dragOver(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(true);

        fireEvent.dragLeave(wrapper);
        expect(wrapper.classList.contains('photo-input-wrapper-focused')).toBe(false);
    });

    it('does not open file dialog or allow drop when disabled', () => {
        render(<PhotoInput value={null} onChange={onChangeMock} disabled />);
        const wrapper = screen.getByText(/перетягніть файл/i).closest('.photo-input-wrapper')!;
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
});
