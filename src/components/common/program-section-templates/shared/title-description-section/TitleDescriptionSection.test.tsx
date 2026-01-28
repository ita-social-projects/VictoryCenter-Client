import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleDescriptionSection, TitleDescriptionSectionProps } from './TitleDescriptionSection';
import { PROGRAMS_TEXT } from '@/const/admin/programs';

// Mock the input group components
jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({
        label,
        value,
        onChange,
        id,
        maxLength,
        placeholder,
        className,
    }: {
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        id: string;
        maxLength: number;
        placeholder: string;
        className?: string;
    }) => (
        <div data-testid={`input-group-${id}`} className={className}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                data-testid={`title-input-${id}`}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
            />
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            value,
            onChange,
            id,
            maxLength,
            rows,
        }: {
            label: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            id: string;
            maxLength: number;
            rows: number;
        }) => (
            <div data-testid={`textarea-group-${id}`}>
                <label htmlFor={id}>{label}</label>
                <textarea
                    id={id}
                    data-testid={`description-textarea-${id}`}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    rows={rows}
                />
            </div>
        ),
    }),
);

describe('TitleDescriptionSection', () => {
    const defaultProps: TitleDescriptionSectionProps = {
        title: '',
        description: '',
        className: '',
        isTemplate: false,
        isEditable: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderTitleDescriptionSection = (overrideProps: Partial<TitleDescriptionSectionProps> = {}) =>
        render(<TitleDescriptionSection {...defaultProps} {...overrideProps} />);

    const renderBareTitleDescriptionSection = (overrideProps: Partial<TitleDescriptionSectionProps> = {}) =>
        render(<TitleDescriptionSection {...overrideProps} />);

    // Element getters
    const getTitleHeading = () => screen.queryByRole('heading', { level: 2 });
    const getDescriptionParagraph = (text?: string) => {
        if (text) {
            return screen.queryByText(text);
        }
        const container = document.querySelector('.container');
        return container?.querySelector('.description') || null;
    };
    const getTitleInput = () => screen.queryByTestId('title-input-section-title');
    const getDescriptionTextarea = () => screen.queryByTestId('description-textarea-section-description');

    describe('Non-editable mode', () => {
        it('uses default values when props are omitted', () => {
            const { container } = renderBareTitleDescriptionSection();

            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('');
            expect(container.querySelector('.description')).toHaveTextContent('');
            expect(container.firstChild).toHaveClass('container');
            expect(container.firstChild).not.toHaveClass('template');
            expect(container.firstChild).not.toHaveClass('editable');
        });

        it('renders title and description as text when not editable', () => {
            renderTitleDescriptionSection({
                title: 'Test Title',
                description: 'Test Description',
                isEditable: false,
            });

            expect(getTitleHeading()).toBeInTheDocument();
            expect(getTitleHeading()).toHaveTextContent('Test Title');
            const description = getDescriptionParagraph('Test Description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveTextContent('Test Description');
        });

        it('renders empty title and description when values are empty', () => {
            const { container } = renderTitleDescriptionSection({
                title: '',
                description: '',
                isEditable: false,
            });

            expect(getTitleHeading()).toBeInTheDocument();
            expect(getTitleHeading()).toHaveTextContent('');
            const description = container.querySelector('.description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveTextContent('');
        });

        it('does not render input fields when not editable', () => {
            renderTitleDescriptionSection({
                title: 'Test Title',
                description: 'Test Description',
                isEditable: false,
            });

            expect(getTitleInput()).not.toBeInTheDocument();
            expect(getDescriptionTextarea()).not.toBeInTheDocument();
        });
    });

    describe('Editable mode', () => {
        it('renders input fields when editable', () => {
            renderTitleDescriptionSection({
                title: 'Test Title',
                description: 'Test Description',
                isEditable: true,
            });

            expect(getTitleInput()).toBeInTheDocument();
            expect(getTitleInput()).toHaveValue('Test Title');
            expect(getDescriptionTextarea()).toBeInTheDocument();
            expect(getDescriptionTextarea()).toHaveValue('Test Description');
        });

        it('does not render heading and paragraph when editable', () => {
            renderTitleDescriptionSection({
                title: 'Test Title',
                description: 'Test Description',
                isEditable: true,
            });

            const heading = screen.queryByRole('heading', { level: 2 });
            expect(heading).not.toBeInTheDocument();
        });

        it('calls onTitleChange when title input changes', () => {
            const onTitleChange = jest.fn();
            renderTitleDescriptionSection({
                title: 'Initial Title',
                isEditable: true,
                onTitleChange,
            });

            const titleInput = getTitleInput();
            expect(titleInput).toBeInTheDocument();

            fireEvent.change(titleInput!, { target: { value: 'New Title' } });

            expect(onTitleChange).toHaveBeenCalledTimes(1);
            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('calls onDescriptionChange when description textarea changes', () => {
            const onDescriptionChange = jest.fn();
            renderTitleDescriptionSection({
                description: 'Initial Description',
                isEditable: true,
                onDescriptionChange,
            });

            const descriptionTextarea = getDescriptionTextarea();
            expect(descriptionTextarea).toBeInTheDocument();

            fireEvent.change(descriptionTextarea!, { target: { value: 'New Description' } });

            expect(onDescriptionChange).toHaveBeenCalledTimes(1);
            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('does not call callbacks when they are not provided', () => {
            renderTitleDescriptionSection({
                title: 'Test Title',
                description: 'Test Description',
                isEditable: true,
            });

            const titleInput = getTitleInput();
            const descriptionTextarea = getDescriptionTextarea();

            fireEvent.change(titleInput!, { target: { value: 'New Title' } });
            fireEvent.change(descriptionTextarea!, { target: { value: 'New Description' } });

            // Should not throw errors
            expect(titleInput).toBeInTheDocument();
            expect(descriptionTextarea).toBeInTheDocument();
        });

        it('passes correct props to InputWithCharacterLimitGroup', () => {
            renderTitleDescriptionSection({
                title: 'Test Title',
                isEditable: true,
            });

            const inputGroup = screen.getByTestId('input-group-section-title');
            expect(inputGroup).toBeInTheDocument();

            const titleInput = getTitleInput();
            expect(titleInput).toHaveAttribute('id', 'section-title');
            expect(titleInput).toHaveAttribute('maxLength', '60');
            expect(titleInput).toHaveAttribute('placeholder', PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER);
        });

        it('passes correct props to TextAreaWithCharacterLimitGroup', () => {
            renderTitleDescriptionSection({
                description: 'Test Description',
                isEditable: true,
            });

            const textareaGroup = screen.getByTestId('textarea-group-section-description');
            expect(textareaGroup).toBeInTheDocument();

            const descriptionTextarea = getDescriptionTextarea();
            expect(descriptionTextarea).toHaveAttribute('id', 'section-description');
            expect(descriptionTextarea).toHaveAttribute('maxLength', '600');
            expect(descriptionTextarea).toHaveAttribute('rows', '10');
        });
    });

    describe('CSS classes', () => {
        it('applies custom className to container', () => {
            const { container } = renderTitleDescriptionSection({
                className: 'custom-class',
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('custom-class');
        });

        it('applies template class when isTemplate is true', () => {
            const { container } = renderTitleDescriptionSection({
                isTemplate: true,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('template');
        });

        it('applies editable class when isEditable is true', () => {
            const { container } = renderTitleDescriptionSection({
                isEditable: true,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('editable');
        });

        it('applies multiple classes when multiple props are true', () => {
            const { container } = renderTitleDescriptionSection({
                className: 'custom-class',
                isTemplate: true,
                isEditable: true,
            });

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).toHaveClass('custom-class');
            expect(sectionContainer).toHaveClass('template');
            expect(sectionContainer).toHaveClass('editable');
        });
    });

    describe('Default values', () => {
        it('uses empty strings as default for title and description', () => {
            const { container } = renderTitleDescriptionSection();

            expect(getTitleHeading()).toBeInTheDocument();
            expect(getTitleHeading()).toHaveTextContent('');
            const description = container.querySelector('.description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveTextContent('');
        });

        it('defaults isTemplate to false', () => {
            const { container } = renderTitleDescriptionSection();

            const sectionContainer = container.querySelector('.container');
            expect(sectionContainer).not.toHaveClass('template');
        });

        it('defaults isEditable to false', () => {
            renderTitleDescriptionSection();

            expect(getTitleInput()).not.toBeInTheDocument();
            expect(getDescriptionTextarea()).not.toBeInTheDocument();
        });
    });
});
