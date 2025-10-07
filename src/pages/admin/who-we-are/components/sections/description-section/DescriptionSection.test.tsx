import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DescriptionSection, DescriptionSectionProps } from './DescriptionSection';
import '@testing-library/jest-dom';
import { ContentType } from '../../../../../../types/common/about-us';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';

// Mock child components to isolate the component being tested
jest.mock('../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit', () => ({
    TextAreaWithCharacterLimit: ({ onChange, value, maxLength, onBlur, name, id }: any) => (
        <textarea
            data-testid="mock-textarea"
            onChange={onChange}
            value={value}
            maxLength={maxLength}
            onBlur={onBlur}
            name={name}
            id={id}
        />
    ),
}));

jest.mock('../../../../../public/about-us-page/our-mission/OurMission', () => ({
    OurMission: ({ description, className, navigate }: any) => (
        <div data-testid="mock-our-mission" className={className}>
            <p>{description}</p>
        </div>
    ),
}));

// Mock the validation function to control its behavior during tests
jest.mock('../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(),
    },
}));

describe('DescriptionSection', () => {
    // Declare mock functions for props
    let mockOnChange: jest.Mock;
    let mockOnPublish: jest.Mock;
    let mockSetIsPublishButtonActive: jest.Mock;
    const descriptionLimit = 500;
    const initialDescription = 'This is an initial test description.';

    // Setup function to render the component with consistent props
    const renderComponent = (props: Partial<DescriptionSectionProps> = {}) => {
        const defaultProps: DescriptionSectionProps = {
            content: [
                {
                    id: 1,
                    contentType: ContentType.Description,
                    description: initialDescription,
                    image: null,
                    imageId: null,
                    title: null,
                },
            ],
            descriptionLimit,
            onChange: mockOnChange,
            onPublish: mockOnPublish,
            isPublishButtonActive: false,
            setIsPublishButtonActive: mockSetIsPublishButtonActive,
        };
        return render(<DescriptionSection {...defaultProps} {...props} />);
    };

    // Reset mocks before each test
    beforeEach(() => {
        mockOnChange = jest.fn();
        mockOnPublish = jest.fn();
        mockSetIsPublishButtonActive = jest.fn();
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(null);
    });

    // Test for initial rendering
    it('should render the description section with initial content', () => {
        renderComponent();
        expect(screen.getByTestId('mock-our-mission')).toHaveTextContent(initialDescription);
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        const textarea = screen.getByTestId('mock-textarea');
        expect(textarea).toHaveValue(initialDescription);
        expect(textarea).toHaveAttribute('maxLength', descriptionLimit.toString());
        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeInTheDocument();
        expect(publishButton).toBeDisabled();
    });

    // Test for handling `null` content prop
    it('should not render anything if content is null', () => {
        const { container } = renderComponent({ content: undefined });
        expect(container).toBeEmptyDOMElement();
    });

    // Test for handling content without a description item
    it('should not render anything if there is no description content item', () => {
        const { container } = renderComponent({
            content: [
                {
                    id: 2,
                    contentType: ContentType.Image, // A different content type
                    description: '',
                    image: null,
                    imageId: null,
                    title: null,
                },
            ],
        });
        expect(container).toBeEmptyDOMElement();
    });

    // Test for text area change handling
    it('should call onChange and setIsPublishButtonActive on text area change', () => {
        renderComponent();
        const textarea = screen.getByTestId('mock-textarea');
        const newText = 'This is a new test description.';
        fireEvent.change(textarea, { target: { value: newText } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                description: newText,
                contentType: ContentType.Description,
            }),
        );
        expect(mockSetIsPublishButtonActive).toHaveBeenCalledWith(true);
    });

    // Test for validation and error display
    it('should show an error message and disable the publish button when validation fails', async () => {
        const errorMessage = 'Description is too short.';
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(errorMessage);

        renderComponent();
        const textarea = screen.getByTestId('mock-textarea');

        fireEvent.blur(textarea); // Trigger the onBlur event for validation

        // Use waitFor to handle state updates from onBlur
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
            expect(publishButton).toBeDisabled();
        });
    });

    // Test for publish button click
    it('should call onPublish when the publish button is clicked and no error is present', () => {
        renderComponent({ isPublishButtonActive: true });

        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeEnabled();

        fireEvent.click(publishButton);
        expect(mockOnPublish).toHaveBeenCalled();
    });
});
