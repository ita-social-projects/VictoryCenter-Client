import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DescriptionSection, DescriptionSectionProps } from './DescriptionSection';
import '@testing-library/jest-dom';
import { ContentType } from '@/types/common/about-us';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { OurMissionProps } from '@/pages/public/about-us-page/our-mission/OurMission';
import { RichTextInputGroupProps } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({
        label,
        onChange,
        value,
        maxLength,
        onBlur,
        name,
        id,
        error,
        disabled,
    }: RichTextInputGroupProps & { disabled?: boolean }) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                data-testid={`mock-rich-input-${id}`}
                onChange={(e) => !disabled && onChange(e.target.value)}
                value={value}
                maxLength={maxLength}
                onBlur={onBlur}
                name={name}
                id={id}
                disabled={disabled}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

jest.mock('@/pages/public/about-us-page/our-mission/OurMission', () => ({
    OurMission: ({ description, className }: OurMissionProps) => (
        <div data-testid="mock-our-mission" className={className}>
            <p>{description}</p>
        </div>
    ),
}));

jest.mock('@/validation/admin/who-we-are-schema/WhoWeAreSchema', () => ({
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(),
    },
}));

describe('DescriptionSection', () => {
    let mockOnChange: jest.Mock;
    let mockOnPublish: jest.Mock;
    let mockOnTranslate: jest.Mock;
    const descriptionLimit = 500;
    const initialDescription = 'This is an initial test description.';

    const buildProps = (overrides: Partial<DescriptionSectionProps> = {}): DescriptionSectionProps => ({
        content: [
            {
                id: 1,
                contentType: ContentType.Description,
                description: initialDescription,
                image: null,
                imageId: null,
                title: null,
                localizations: [],
            },
        ],
        descriptionLimit,
        onChange: mockOnChange,
        onPublish: mockOnPublish,
        onTranslate: mockOnTranslate,
        isPublishButtonActive: false,
        language: { id: 1, code: 'uk', name: 'Ukrainian' },
        ...overrides,
    });

    const renderComponent = (props: Partial<DescriptionSectionProps> = {}) =>
        render(<DescriptionSection {...buildProps(props)} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        mockOnPublish = jest.fn();
        mockOnTranslate = jest.fn();
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(null);
    });

    it('should render the description section with initial content', () => {
        renderComponent();
        expect(screen.getByTestId('mock-our-mission')).toHaveTextContent(initialDescription);
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        const descriptionInput = screen.getByTestId('mock-rich-input-1');
        expect(descriptionInput).toHaveValue(initialDescription);
        expect(descriptionInput).toHaveAttribute('maxLength', descriptionLimit.toString());
        const publishButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED });
        expect(publishButton).toBeInTheDocument();
        expect(publishButton).toBeDisabled();
    });

    it('should not render anything if content is null', () => {
        const { container } = renderComponent({ content: undefined });
        expect(container).toBeEmptyDOMElement();
    });

    it('should not render anything if there is no description content item', () => {
        const { container } = renderComponent({
            content: [
                {
                    id: 2,
                    contentType: ContentType.Image,
                    description: '',
                    image: null,
                    imageId: null,
                    title: null,
                    localizations: [],
                },
            ],
        });
        expect(container).toBeEmptyDOMElement();
    });

    it('should call onChange on text area change', () => {
        renderComponent();
        const descriptionInput = screen.getByTestId('mock-rich-input-1');
        const newText = 'This is a new test description.';
        fireEvent.change(descriptionInput, { target: { value: newText } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                description: newText,
                contentType: ContentType.Description,
            }),
        );
    });

    it('should show an error message and disable the publish button when validation fails', async () => {
        const errorMessage = 'Description is too short.';
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(errorMessage);

        renderComponent();
        const descriptionInput = screen.getByTestId('mock-rich-input-1');

        fireEvent.blur(descriptionInput);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
            expect(publishButton).toBeDisabled();
        });
    });

    it('should call onPublish when the publish button is clicked and no error is present', () => {
        renderComponent({ isPublishButtonActive: true });

        const publishButton = screen.getByRole('button', { name: 'Опублікувати' });
        expect(publishButton).toBeEnabled();

        fireEvent.click(publishButton);
        expect(mockOnPublish).toHaveBeenCalled();
    });

    it('should disable translate button when publish button is active', () => {
        renderComponent({ isPublishButtonActive: true });

        const translateButton = screen.getByRole('button', { name: 'Translate' });

        expect(translateButton).toBeDisabled();
    });

    it('should not allow editing and should hide publish button for non-base language', () => {
        renderComponent({ language: { id: 2, code: 'en', name: 'English' } });

        const descriptionInput = screen.getByTestId('mock-rich-input-1');
        expect(descriptionInput).toBeDisabled();

        fireEvent.change(descriptionInput, { target: { value: 'Attempt edit' } });
        expect(mockOnChange).not.toHaveBeenCalled();

        expect(
            screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }),
        ).not.toBeInTheDocument();
    });

    it('should hide validation error when switching to non-base language', async () => {
        const errorMessage = 'Description is too short.';
        (WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText as jest.Mock).mockReturnValue(errorMessage);

        const { rerender } = renderComponent();
        const descriptionInput = screen.getByTestId('mock-rich-input-1');

        fireEvent.blur(descriptionInput);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        rerender(<DescriptionSection {...buildProps({ language: { id: 2, code: 'en', name: 'English' } })} />);

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
});
