import React from 'react';
import { render, screen } from '@testing-library/react';
import { SingleImageBottom, SingleImageBottomProps } from './SingleImageBottom';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';

const mockTitleDescriptionSection = jest.fn();
const mockPhotoInputGroup = jest.fn();

jest.mock('../shared/title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: (props: any) => {
        mockTitleDescriptionSection(props);
        return <div data-testid="title-description-section" />;
    },
}));

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: (props: any) => {
        mockPhotoInputGroup(props);
        return <div data-testid="photo-input-group" />;
    },
}));

const getLastCallProps = (fn: jest.Mock) => fn.mock.calls[fn.mock.calls.length - 1]?.[0];

const renderSingleImageBottom = (props: Partial<SingleImageBottomProps> = {}) =>
    render(<SingleImageBottom {...props} />);

describe('SingleImageBottom', () => {
    beforeEach(() => {
        mockTitleDescriptionSection.mockClear();
        mockPhotoInputGroup.mockClear();
    });

    it('renders non-editable layout: shows image and passes isTemplate to TitleDescriptionSection', () => {
        renderSingleImageBottom({
            title: 'T',
            description: 'D',
            image1: 'test-image.jpg',
            isTemplate: true,
            isEditable: false,
        });

        const img = screen.getByRole('img', { name: /img1-of-single-image-bottom/i });
        expect(img).toHaveAttribute('src', 'test-image.jpg');
        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockPhotoInputGroup).not.toHaveBeenCalled();

        expect(getLastCallProps(mockTitleDescriptionSection)).toEqual(
            expect.objectContaining({
                title: 'T',
                description: 'D',
                isTemplate: true,
                className: 'top-section',
            }),
        );
    });

    it('renders editable layout: wires handlers and configures PhotoInputGroup', () => {
        const onTitleChange = jest.fn();
        const onDescriptionChange = jest.fn();
        const onImage1Change = jest.fn();

        renderSingleImageBottom({
            title: 'T',
            description: 'D',
            image1: 'base64-data',
            isEditable: true,
            onTitleChange,
            onDescriptionChange,
            onImage1Change,
        });

        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /img1-of-single-image-bottom/i })).not.toBeInTheDocument();

        expect(getLastCallProps(mockTitleDescriptionSection)).toEqual(
            expect.objectContaining({
                title: 'T',
                description: 'D',
                isEditable: true,
                onTitleChange,
                onDescriptionChange,
                className: 'top-section',
            }),
        );

        const photoProps = getLastCallProps(mockPhotoInputGroup);
        expect(photoProps).toEqual(
            expect.objectContaining({
                id: 'section-image-1',
                name: 'section-image-1',
                className: 'program-section-image-input',
                cropWidth: PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropWidth,
                cropHeight: PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropHeight,
                minWidth: PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minWidth,
                minHeight: PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minHeight,
                value: { base64: 'base64-data', mimeType: '' },
                onChange: expect.any(Function),
            }),
        );

        photoProps.onChange({ base64: 'new', mimeType: 'image/png' });
        expect(onImage1Change).toHaveBeenCalledWith({ base64: 'new', mimeType: 'image/png' });
    });

    it('uses null value for PhotoInputGroup when image1 is empty (editable branch)', () => {
        renderSingleImageBottom({
            image1: '',
            isEditable: true,
        });

        const photoProps = getLastCallProps(mockPhotoInputGroup);
        expect(photoProps).toEqual(expect.objectContaining({ value: null }));
    });

    it('uses a fallback onChange when onImage1Change is not provided', () => {
        renderSingleImageBottom({
            isEditable: true,
        });

        const photoProps = getLastCallProps(mockPhotoInputGroup);
        expect(photoProps.onChange).toEqual(expect.any(Function));
        expect(() => photoProps.onChange(null)).not.toThrow();
    });

    it('applies template/editable CSS module class toggles on the container', () => {
        const { container, rerender } = renderSingleImageBottom({ isTemplate: true, isEditable: false });
        expect(container.firstChild).toHaveClass('container');
        expect(container.firstChild).toHaveClass('template');
        expect(container.firstChild).not.toHaveClass('editable');

        rerender(<SingleImageBottom isTemplate={false} isEditable={true} />);
        expect(container.firstChild).toHaveClass('editable');
        expect(container.firstChild).not.toHaveClass('template');
    });
});
