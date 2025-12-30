import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SingleImageBottom, SingleImageBottomProps } from './SingleImageBottom';
import { ImageValues } from '@/types/common/image';

// Mock the shared components - we test TitleDescriptionSection separately
jest.mock('../shared/title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: ({
        title,
        description,
        isTemplate,
        isEditable,
        onTitleChange,
        onDescriptionChange,
        className,
    }: {
        title?: string;
        description?: string;
        isTemplate?: boolean;
        isEditable?: boolean;
        onTitleChange?: (value: string) => void;
        onDescriptionChange?: (value: string) => void;
        className?: string;
    }) => (
        <div
            data-testid="title-description-section"
            data-title={title}
            data-description={description}
            data-classname={className}
        >
            {isTemplate && <span data-testid="template-flag">template</span>}
            {isEditable && <span data-testid="editable-flag">editable</span>}
            {onTitleChange && (
                <button
                    data-testid="trigger-title-change"
                    onClick={() => onTitleChange('New Title')}
                    aria-label="Trigger title change"
                >
                    Trigger Title Change
                </button>
            )}
            {onDescriptionChange && (
                <button
                    data-testid="trigger-description-change"
                    onClick={() => onDescriptionChange('New Description')}
                    aria-label="Trigger description change"
                >
                    Trigger Description Change
                </button>
            )}
        </div>
    ),
}));

// Mock PhotoInputGroup
jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: ({
        id,
        value,
        onChange,
        cropWidth,
        cropHeight,
        minWidth,
        minHeight,
        imageLabel,
        imageSubText,
        className,
    }: {
        id: string;
        value: ImageValues | null;
        onChange: (file: ImageValues | null) => void;
        cropWidth: number;
        cropHeight: number;
        minWidth: number;
        minHeight: number;
        imageLabel: string;
        imageSubText: string;
        className?: string;
    }) => (
        <div
            data-testid={`photo-input-group-${id}`}
            data-crop-width={cropWidth}
            data-crop-height={cropHeight}
            data-min-width={minWidth}
            data-min-height={minHeight}
            data-image-label={imageLabel}
            data-image-subtext={imageSubText}
            className={className}
        >
            {value ? (
                <span data-testid={`has-image-${id}`}>Has Image</span>
            ) : (
                <span data-testid={`no-image-${id}`}>No Image</span>
            )}
            <button
                type="button"
                data-testid={`upload-button-${id}`}
                onClick={() => onChange({ base64: 'test-base64', mimeType: 'image/png' })}
                aria-label="Upload image"
            >
                Upload
            </button>
            <button
                type="button"
                data-testid={`remove-button-${id}`}
                onClick={() => onChange(null)}
                aria-label="Remove image"
            >
                Remove
            </button>
        </div>
    ),
}));

describe('SingleImageBottom', () => {
    const defaultProps: SingleImageBottomProps = {
        title: '',
        description: '',
        image1: '',
        isTemplate: false,
        isEditable: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderSingleImageBottom = (overrideProps: Partial<SingleImageBottomProps> = {}) =>
        render(<SingleImageBottom {...defaultProps} {...overrideProps} />);

    // Element getters
    const getTitleDescriptionSection = () => screen.getByTestId('title-description-section');
    const getPhotoInputGroup = () => screen.queryByTestId('photo-input-group-section-image-1');

    describe('Non-editable mode', () => {
        it('renders TitleDescriptionSection with correct props when not editable', () => {
            renderSingleImageBottom({
                title: 'Test Title',
                description: 'Test Description',
                isTemplate: true,
                isEditable: false,
            });

            const section = getTitleDescriptionSection();
            expect(section).toBeInTheDocument();
            expect(section).toHaveAttribute('data-title', 'Test Title');
            expect(section).toHaveAttribute('data-description', 'Test Description');
            expect(screen.getByTestId('template-flag')).toBeInTheDocument();
            expect(screen.queryByTestId('editable-flag')).not.toBeInTheDocument();
        });

        it('renders image when image1 is provided and not editable', () => {
            const { container } = renderSingleImageBottom({
                image1: 'test-image.jpg',
                isEditable: false,
            });

            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'test-image.jpg');
        });

        it('does not render PhotoInputGroup when not editable', () => {
            renderSingleImageBottom({
                isEditable: false,
            });

            expect(getPhotoInputGroup()).not.toBeInTheDocument();
        });

        it('renders image element with empty src when image1 is empty and not editable', () => {
            const { container } = renderSingleImageBottom({
                image1: '',
                isEditable: false,
            });

            const image = container.querySelector('img');
            expect(image).toBeTruthy();
        });
    });

    describe('Editable mode', () => {
        it('renders TitleDescriptionSection with editable flag when editable', () => {
            renderSingleImageBottom({
                title: 'Test Title',
                description: 'Test Description',
                isEditable: true,
            });

            const section = getTitleDescriptionSection();
            expect(section).toBeInTheDocument();
            expect(screen.getByTestId('editable-flag')).toBeInTheDocument();
            expect(screen.queryByTestId('template-flag')).not.toBeInTheDocument();
        });

        it('renders PhotoInputGroup when editable', () => {
            renderSingleImageBottom({
                isEditable: true,
            });

            const photoInput = getPhotoInputGroup();
            expect(photoInput).toBeInTheDocument();
            expect(photoInput).toHaveAttribute('data-crop-width', '1330');
            expect(photoInput).toHaveAttribute('data-crop-height', '680');
            expect(photoInput).toHaveAttribute('data-min-width', '1330');
            expect(photoInput).toHaveAttribute('data-min-height', '680');
        });

        it('does not render image element when editable', () => {
            const { container } = renderSingleImageBottom({
                image1: 'test-image.jpg',
                isEditable: true,
            });

            const image = container.querySelector('img');
            expect(image).not.toBeInTheDocument();
        });

        it('passes image value to PhotoInputGroup when image1 is provided', () => {
            renderSingleImageBottom({
                image1: 'base64-image-data',
                isEditable: true,
            });

            expect(screen.getByTestId('has-image-section-image-1')).toBeInTheDocument();
            expect(screen.queryByTestId('no-image-section-image-1')).not.toBeInTheDocument();
        });

        it('passes null to PhotoInputGroup when image1 is empty', () => {
            renderSingleImageBottom({
                image1: '',
                isEditable: true,
            });

            expect(screen.getByTestId('no-image-section-image-1')).toBeInTheDocument();
            expect(screen.queryByTestId('has-image-section-image-1')).not.toBeInTheDocument();
        });

        it('calls onImage1Change when PhotoInputGroup onChange is triggered', () => {
            const onImage1Change = jest.fn();
            renderSingleImageBottom({
                isEditable: true,
                onImage1Change,
            });

            const uploadButton = screen.getByTestId('upload-button-section-image-1');
            fireEvent.click(uploadButton);

            expect(onImage1Change).toHaveBeenCalledTimes(1);
            expect(onImage1Change).toHaveBeenCalledWith({ base64: 'test-base64', mimeType: 'image/png' });
        });

        it('calls onImage1Change with null when image is removed', () => {
            const onImage1Change = jest.fn();
            renderSingleImageBottom({
                isEditable: true,
                onImage1Change,
            });

            const removeButton = screen.getByTestId('remove-button-section-image-1');
            fireEvent.click(removeButton);

            expect(onImage1Change).toHaveBeenCalledTimes(1);
            expect(onImage1Change).toHaveBeenCalledWith(null);
        });

        it('does not throw error when onImage1Change is not provided', () => {
            renderSingleImageBottom({
                isEditable: true,
            });

            const uploadButton = screen.getByTestId('upload-button-section-image-1');
            expect(() => fireEvent.click(uploadButton)).not.toThrow();
        });

        it('forwards onTitleChange to TitleDescriptionSection', () => {
            const onTitleChange = jest.fn();
            renderSingleImageBottom({
                isEditable: true,
                onTitleChange,
            });

            const triggerButton = screen.getByTestId('trigger-title-change');
            fireEvent.click(triggerButton);

            expect(onTitleChange).toHaveBeenCalledTimes(1);
            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('forwards onDescriptionChange to TitleDescriptionSection', () => {
            const onDescriptionChange = jest.fn();
            renderSingleImageBottom({
                isEditable: true,
                onDescriptionChange,
            });

            const triggerButton = screen.getByTestId('trigger-description-change');
            fireEvent.click(triggerButton);

            expect(onDescriptionChange).toHaveBeenCalledTimes(1);
            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });
    });

    describe('CSS classes', () => {
        it('applies template class when isTemplate is true', () => {
            const { container } = renderSingleImageBottom({
                isTemplate: true,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('template');
        });

        it('applies editable class when isEditable is true', () => {
            const { container } = renderSingleImageBottom({
                isEditable: true,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('editable');
        });

        it('applies both template and editable classes when both are true', () => {
            const { container } = renderSingleImageBottom({
                isTemplate: true,
                isEditable: true,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('template');
            expect(sectionContainer).toHaveClass('editable');
        });

        it('does not apply template or editable classes when both are false', () => {
            const { container } = renderSingleImageBottom({
                isTemplate: false,
                isEditable: false,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).not.toHaveClass('template');
            expect(sectionContainer).not.toHaveClass('editable');
        });
    });

    describe('PhotoInputGroup configuration', () => {
        it('passes correct image configuration from PROGRAM_SECTION_IMAGE_CONFIGS', () => {
            renderSingleImageBottom({
                isEditable: true,
            });

            const photoInput = getPhotoInputGroup();
            expect(photoInput).toHaveAttribute('data-crop-width', '1330');
            expect(photoInput).toHaveAttribute('data-crop-height', '680');
            expect(photoInput).toHaveAttribute('data-min-width', '1330');
            expect(photoInput).toHaveAttribute('data-min-height', '680');
        });

        it('passes correct id and name to PhotoInputGroup', () => {
            renderSingleImageBottom({
                isEditable: true,
            });

            const photoInput = getPhotoInputGroup();
            expect(photoInput).toHaveAttribute('data-testid', 'photo-input-group-section-image-1');
        });

        it('passes correct className to PhotoInputGroup', () => {
            renderSingleImageBottom({
                isEditable: true,
            });

            const photoInput = getPhotoInputGroup();
            expect(photoInput).toHaveClass('program-section-image-input');
        });
    });

    describe('Default values', () => {
        it('uses empty strings as default for title, description, and image1', () => {
            renderSingleImageBottom();

            const section = getTitleDescriptionSection();
            expect(section).toHaveAttribute('data-title', '');
            expect(section).toHaveAttribute('data-description', '');
        });

        it('defaults isTemplate to false', () => {
            const { container } = renderSingleImageBottom();

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).not.toHaveClass('template');
        });

        it('defaults isEditable to false', () => {
            renderSingleImageBottom();

            expect(getPhotoInputGroup()).not.toBeInTheDocument();
            expect(screen.queryByTestId('editable-flag')).not.toBeInTheDocument();
        });
    });

    describe('Image value transformation', () => {
        it('transforms image1 string to ImageValues object with base64 when editable', () => {
            renderSingleImageBottom({
                image1: 'base64-string-data',
                isEditable: true,
            });

            expect(screen.getByTestId('has-image-section-image-1')).toBeInTheDocument();
        });

        it('handles empty image1 string correctly', () => {
            renderSingleImageBottom({
                image1: '',
                isEditable: true,
            });

            expect(screen.getByTestId('no-image-section-image-1')).toBeInTheDocument();
        });
    });
});
