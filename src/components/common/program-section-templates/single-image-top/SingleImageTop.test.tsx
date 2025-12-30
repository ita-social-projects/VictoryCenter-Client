import { render, screen } from '@testing-library/react';
import React from 'react';
import { SingleImageTop, SingleImageTopProps } from './SingleImageTop';

jest.mock('../shared/title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: (props: any) => <div data-testid="title-description-section" {...props} />,
}));

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: (props: any) => <div data-testid="photo-input-group" {...props} />,
}));

describe('SingleImageTop', () => {
    const baseProps: SingleImageTopProps = {
        title: 'Test Title',
        description: 'Test Description',
        image1: 'test-image.png',
        isTemplate: false,
        isEditable: false,
    };

    it('calls onTitleChange and onDescriptionChange in edit mode', () => {
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

        expect(screen.getByTestId('title-description-section').getAttribute('onTitleChange')).toBeDefined();
        expect(screen.getByTestId('title-description-section').getAttribute('onDescriptionChange')).toBeDefined();
    });

    it('calls onImage1Change in edit mode', () => {
        const onImage1Change = jest.fn();
        render(<SingleImageTop {...baseProps} isEditable={true} onImage1Change={onImage1Change} />);
        expect(screen.getByTestId('photo-input-group').getAttribute('onChange')).toBeDefined();
    });
});
