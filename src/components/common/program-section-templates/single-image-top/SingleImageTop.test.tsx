import { render, screen } from '@testing-library/react';
import React from 'react';
import { SingleImageTop, SingleImageTopProps } from './SingleImageTop';

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

describe('SingleImageTop', () => {
    const baseProps: SingleImageTopProps = {
        title: 'Test Title',
        description: 'Test Description',
        image1: 'test-image.png',
        isTemplate: false,
        isEditable: false,
    };

    beforeEach(() => {
        mockTitleDescriptionSection.mockClear();
        mockPhotoInputGroup.mockClear();
    });

    it('passes title/description handlers to TitleDescriptionSection in edit mode', () => {
        const onTitleChange = jest.fn();
        const onDescriptionChange = jest.fn();
        render(
            <SingleImageTop
                {...baseProps}
                isEditable={true}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />,
        );

        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: baseProps.title,
                description: baseProps.description,
                isEditable: true,
                onTitleChange,
                onDescriptionChange,
            }),
        );
    });

    it('passes onImage1Change to PhotoInputGroup in edit mode', () => {
        const onImage1Change = jest.fn();
        render(<SingleImageTop {...baseProps} isEditable={true} onImage1Change={onImage1Change} />);

        expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        expect(mockPhotoInputGroup).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'section-image-1',
                name: 'section-image-1',
                onChange: onImage1Change,
            }),
        );
    });

    it('uses a fallback onChange when onImage1Change is missing', () => {
        render(<SingleImageTop {...baseProps} isEditable={true} />);

        const photoProps = mockPhotoInputGroup.mock.calls[0]?.[0];
        expect(photoProps).toEqual(expect.any(Object));
        expect(photoProps.onChange).toEqual(expect.any(Function));
    });

    it('renders correctly in non-edit mode', () => {
        const { container } = render(<SingleImageTop {...baseProps} isEditable={false} />);

        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img).toHaveAttribute('src', baseProps.image1);
        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: baseProps.title,
                description: baseProps.description,
                isTemplate: false,
            }),
        );
    });

    it('renders with isTemplate=true', () => {
        const { container } = render(<SingleImageTop {...baseProps} isTemplate={true} />);
        expect(container.firstChild).toHaveClass('template');
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                isTemplate: true,
            }),
        );
    });

    it('renders with default props', () => {
        const { container } = render(<SingleImageTop />);

        expect(container.firstChild).toBeInTheDocument();
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img).not.toHaveAttribute('src');
        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '',
                description: '',
                isTemplate: false,
            }),
        );
    });

    it('applies correct classNames for isTemplate and isEditable', () => {
        const { container, rerender } = render(<SingleImageTop isTemplate={true} isEditable={false} />);
        expect(container.firstChild).toHaveClass('template');
        rerender(<SingleImageTop isTemplate={false} isEditable={true} />);
        expect(container.firstChild).toHaveClass('editable');
    });
});
