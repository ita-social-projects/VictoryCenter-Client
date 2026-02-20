import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleDescriptionSection, TitleDescriptionSectionProps } from './TitleDescriptionSection';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';

jest.mock('@/hooks/admin/use-program-section-validation', () => ({
    useProgramSectionValidation: jest.fn(),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({
        label,
        value,
        onChange,
        onBlur,
        id,
        maxLength,
        placeholder,
        className,
        error,
        disabled,
    }: {
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
        id: string;
        maxLength: number;
        placeholder: string;
        className?: string;
        error?: string;
        disabled?: boolean;
    }) => (
        <div data-testid={`input-group-${id}`} className={className} data-error={error || ''}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                maxLength={maxLength}
                placeholder={placeholder}
                disabled={disabled}
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
            onBlur,
            id,
            maxLength,
            rows,
            error,
            disabled,
            currentLength,
        }: {
            label: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
            id: string;
            maxLength: number;
            rows: number;
            error?: string;
            disabled?: boolean;
            currentLength?: number;
        }) => (
            <div
                data-testid={`textarea-group-${id}`}
                data-error={error || ''}
                data-current-length={currentLength ?? ''}
            >
                <label htmlFor={id}>{label}</label>
                <textarea
                    id={id}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    rows={rows}
                    disabled={disabled}
                />
            </div>
        ),
    }),
);

const useProgramSectionValidationMock = useProgramSectionValidation as unknown as jest.Mock;

describe('TitleDescriptionSection', () => {
    const TEMPLATE = ProgramSectionTemplate.TextOnly;

    const defaultProps: TitleDescriptionSectionProps = {
        template: TEMPLATE,
        title: '',
        description: '',
        className: '',
        mode: ProgramSectionMode.Published,
    };

    const setupHook = (overrides?: Partial<ReturnType<typeof useProgramSectionValidation>>) => {
        useProgramSectionValidationMock.mockImplementation(
            ({
                onTitleChange,
                onDescriptionChange,
            }: {
                onTitleChange?: (v: string) => void;
                onDescriptionChange?: (v: string) => void;
            }) => {
                const handleTitleChange = jest.fn((e: React.ChangeEvent<HTMLInputElement>) =>
                    onTitleChange?.(e.target.value),
                );
                const handleTitleBlur = jest.fn((e: React.FocusEvent<HTMLInputElement>) =>
                    onTitleChange?.(e.target.value.trim()),
                );

                const handleDescriptionChange = jest.fn((e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onDescriptionChange?.(e.target.value),
                );
                const handleDescriptionBlur = jest.fn((e: React.FocusEvent<HTMLTextAreaElement>) =>
                    onDescriptionChange?.(e.target.value.trim()),
                );

                return {
                    titleError: undefined,
                    descriptionError: undefined,
                    handleTitleChange,
                    handleTitleBlur,
                    handleDescriptionChange,
                    handleDescriptionBlur,
                    ...overrides,
                };
            },
        );
    };

    const renderComponent = (overrideProps: Partial<TitleDescriptionSectionProps> = {}) => {
        setupHook();
        return render(<TitleDescriptionSection {...defaultProps} {...overrideProps} />);
    };

    const renderBare = (overrideProps: Partial<TitleDescriptionSectionProps> = {}) => {
        setupHook();
        return render(<TitleDescriptionSection template={TEMPLATE} {...overrideProps} />);
    };

    const getTitleHeading = () => screen.queryByRole('heading', { level: 2 });

    const getTitleInput = () =>
        screen.queryByLabelText(PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT) as HTMLInputElement | null;
    const getDescriptionTextarea = () =>
        screen.queryByLabelText(PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT) as HTMLTextAreaElement | null;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls useProgramSectionValidation with callbacks, template, and flags', () => {
        const onTitleChange = jest.fn();
        const onDescriptionChange = jest.fn();

        renderComponent({ onTitleChange, onDescriptionChange, isPublishing: true, validationResetKey: 7 });

        expect(useProgramSectionValidationMock).toHaveBeenCalledTimes(1);
        expect(useProgramSectionValidationMock).toHaveBeenCalledWith(
            expect.objectContaining({
                onTitleChange,
                onDescriptionChange,
                template: TEMPLATE,
                isPublishing: true,
                resetKey: 7,
            }),
        );
    });

    describe('Published / non-editable', () => {
        it('renders title and description as text', () => {
            const { container } = renderComponent({
                title: 'Test Title',
                description: 'Test Description',
                mode: ProgramSectionMode.Published,
            });

            expect(getTitleHeading()).toBeInTheDocument();
            expect(getTitleHeading()).toHaveTextContent('Test Title');

            expect(screen.getByText('Test Description')).toBeInTheDocument();

            expect(getTitleInput()).not.toBeInTheDocument();
            expect(getDescriptionTextarea()).not.toBeInTheDocument();

            expect(container.firstElementChild).not.toHaveClass('form-container');
        });

        it('applies titleClassName and descriptionClassName', () => {
            renderComponent({
                title: 'Title',
                description: 'Desc',
                mode: ProgramSectionMode.Published,
                titleClassName: 't-class',
                descriptionClassName: 'd-class',
            });

            expect(getTitleHeading()).toHaveClass('t-class');
            expect(screen.getByText('Desc')).toHaveClass('d-class');
        });

        it('uses defaults when props omitted', () => {
            const { container } = renderBare();

            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('');
            expect(container.querySelector('.description')).toHaveTextContent('');

            expect(getTitleInput()).not.toBeInTheDocument();
            expect(getDescriptionTextarea()).not.toBeInTheDocument();
        });
    });

    describe('Edit mode', () => {
        it('renders input fields with values', () => {
            renderComponent({
                title: 'Test Title',
                description: 'Test Description',
                mode: ProgramSectionMode.Edit,
            });

            expect(getTitleInput()).toBeInTheDocument();
            expect(getTitleInput()).toHaveValue('Test Title');

            expect(getDescriptionTextarea()).toBeInTheDocument();
            expect(getDescriptionTextarea()).toHaveValue('Test Description');

            expect(getTitleHeading()).not.toBeInTheDocument();
        });

        it('wires onChange to callbacks through hook handlers', () => {
            const onTitleChange = jest.fn();
            const onDescriptionChange = jest.fn();

            renderComponent({
                title: 'Initial Title',
                description: 'Initial Description',
                mode: ProgramSectionMode.Edit,
                onTitleChange,
                onDescriptionChange,
            });

            fireEvent.change(getTitleInput()!, { target: { value: 'New Title' } });
            fireEvent.change(getDescriptionTextarea()!, { target: { value: 'New Description' } });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('wires onBlur to callbacks through hook handlers', () => {
            const onTitleChange = jest.fn();
            const onDescriptionChange = jest.fn();

            renderComponent({
                mode: ProgramSectionMode.Edit,
                onTitleChange,
                onDescriptionChange,
            });

            fireEvent.blur(getTitleInput()!, { target: { value: '  Title  ' } });
            fireEvent.blur(getDescriptionTextarea()!, { target: { value: '  Desc  ' } });

            expect(onTitleChange).toHaveBeenLastCalledWith('Title');
            expect(onDescriptionChange).toHaveBeenLastCalledWith('Desc');
        });

        it('uses template maxLength rules for inputs', () => {
            const titleMax = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);
            const descriptionMax = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Description);

            renderComponent({
                mode: ProgramSectionMode.Edit,
                template: TEMPLATE,
            });

            const titleInput = getTitleInput()!;
            expect(titleInput).toHaveAttribute('maxLength', String(titleMax));
            expect(titleInput).toHaveAttribute('placeholder', PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER);

            const descriptionTextarea = getDescriptionTextarea()!;
            expect(descriptionTextarea).toHaveAttribute('maxLength', String(descriptionMax));
            expect(descriptionTextarea).toHaveAttribute('rows', '10');
        });

        it('passes errors from hook to inputs', () => {
            setupHook({ titleError: 't-err', descriptionError: 'd-err' });

            render(<TitleDescriptionSection {...defaultProps} mode={ProgramSectionMode.Edit} />);

            const titleGroup = getTitleInput()!.closest('div');
            const descriptionGroup = getDescriptionTextarea()!.closest('div');

            expect(titleGroup).toHaveAttribute('data-error', 't-err');
            expect(descriptionGroup).toHaveAttribute('data-error', 'd-err');
        });

        it('passes trimmed currentLength to description group', () => {
            renderComponent({
                mode: ProgramSectionMode.Edit,
                description: '   Hello world   ',
            });

            const descriptionGroup = getDescriptionTextarea()!.closest('div');
            expect(descriptionGroup).toHaveAttribute('data-current-length', String('Hello world'.length));
        });
    });

    describe('View mode', () => {
        it('disables inputs', () => {
            renderComponent({
                mode: ProgramSectionMode.View,
                title: 'Title',
                description: 'Desc',
            });

            expect(getTitleInput()).toBeDisabled();
            expect(getDescriptionTextarea()).toBeDisabled();
        });
    });

    describe('Template mode', () => {
        it('renders as text and applies template class', () => {
            const { container } = renderComponent({
                mode: ProgramSectionMode.Template,
                title: 'T',
                description: 'D',
            });

            expect(getTitleHeading()).toBeInTheDocument();
            expect(screen.getByText('D')).toBeInTheDocument();

            expect(getTitleInput()).not.toBeInTheDocument();
            expect(getDescriptionTextarea()).not.toBeInTheDocument();

            expect(container.querySelector('.container')).toHaveClass('template');
        });
    });

    describe('CSS classes', () => {
        it('applies custom className', () => {
            const { container } = renderComponent({ className: 'custom-class' });
            expect(container.querySelector('.container')).toHaveClass('custom-class');
        });

        it('applies form-container class when mode is Edit', () => {
            const { container } = renderComponent({ mode: ProgramSectionMode.Edit });
            expect(container.querySelector('.container')).toHaveClass('form-container');
        });

        it('applies form-container class when mode is View', () => {
            const { container } = renderComponent({ mode: ProgramSectionMode.View });
            expect(container.querySelector('.container')).toHaveClass('form-container');
        });
    });
});
