import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FaqProgramSection, FaqProgramSectionProps } from './FaqProgramSection';
import { SectionMode } from '@/types/common/sections';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FaqQuestion } from '@/types/admin/faq';
import { VisibilityStatus } from '@/types/admin/common';

jest.mock('@/hooks/admin/use-program-section-validation', () => ({
    useProgramSectionValidation: jest.fn(),
}));

jest.mock('@/components/public/faq-section/faq-card/FaqCard', () => ({
    FaqCard: ({ faq, className }: { faq: any; className?: string }) => (
        <div data-testid={`faq-card-${faq.id}`} className={className}>
            <div data-testid="question">{faq.questionText}</div>
            <div data-testid="answer">{faq.answerText}</div>
        </div>
    ),
}));

jest.mock('./editable-faq-card/EditableFaqCard', () => ({
    EditableFaqCard: ({
        index,
        questionText,
        answerText,
        isExpanded,
        autoFocus,
        canDelete,
        onQuestionChange,
        onAnswerChange,
        onDelete,
        onExpandToggle,
    }: {
        index: number;
        questionText: string;
        answerText: string;
        isExpanded: boolean;
        autoFocus?: boolean;
        canDelete?: boolean;
        onQuestionChange: (i: number, v: string) => void;
        onAnswerChange: (i: number, v: string) => void;
        onDelete: (i: number) => void;
        onExpandToggle: (i: number) => void;
    }) => (
        <div
            data-testid={`editable-faq-card-${index}`}
            data-expanded={isExpanded}
            data-auto-focus={autoFocus}
            data-can-delete={canDelete}
        >
            <input
                data-testid={`question-input-${index}`}
                value={questionText}
                onChange={(e) => onQuestionChange(index, e.target.value)}
                aria-label="Question"
            />
            <input
                data-testid={`answer-input-${index}`}
                value={answerText}
                onChange={(e) => onAnswerChange(index, e.target.value)}
                aria-label="Answer"
            />
            <button data-testid={`delete-button-${index}`} onClick={() => onDelete(index)}>
                Delete
            </button>
            <button data-testid={`expand-button-${index}`} onClick={() => onExpandToggle(index)}>
                Toggle
            </button>
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
            currentLength,
            className,
        }: {
            label: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
            id: string;
            maxLength: number;
            rows: number;
            error?: string;
            currentLength?: number;
            className?: string;
        }) => (
            <div
                data-testid={`textarea-group-${id}`}
                data-error={error || ''}
                data-current-length={currentLength ?? ''}
                className={className}
            >
                <label htmlFor={id}>{label}</label>
                <textarea
                    id={id}
                    data-testid={`textarea-${id}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    rows={rows}
                />
            </div>
        ),
    }),
);

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        type,
        className,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        type?: 'button' | 'submit' | 'reset';
        className?: string;
    }) => (
        <button data-testid="add-faq-button" onClick={onClick} disabled={disabled} type={type} className={className}>
            {children}
        </button>
    ),
}));

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
        validateFaqQuestion: (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return 'Field is required';
            if (trimmed.length < 3) return 'Too short';
            if (trimmed.length > 200) return 'Too long';
            return undefined;
        },
        validateFaqAnswer: (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return 'Field is required';
            if (trimmed.length < 5) return 'Too short';
            if (trimmed.length > 500) return 'Too long';
            return undefined;
        },
    },
}));

const useProgramSectionValidationMock = useProgramSectionValidation as jest.MockedFunction<
    typeof useProgramSectionValidation
>;

const createFaqQuestion = (overrides: Partial<FaqQuestion> = {}): FaqQuestion => ({
    id: 1,
    questionText: 'Test Question',
    answerText: 'Test Answer',
    status: VisibilityStatus.Published,
    pages: [],
    localizations: [],
    ...overrides,
});

describe('FaqProgramSection', () => {
    const defaultProps: FaqProgramSectionProps = {
        questions: [],
        mode: SectionMode.View,
        faqPairs: [],
    };

    const setupHook = (overrides?: Partial<ReturnType<typeof useProgramSectionValidation>>) => {
        useProgramSectionValidationMock.mockImplementation(({ onTitleChange }: any) => {
            const handleTitleChange = jest.fn((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                onTitleChange?.(e.target.value),
            );
            const handleTitleBlur = jest.fn((e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                onTitleChange?.(e.target.value.trim()),
            );

            return {
                titleError: undefined,
                descriptionError: undefined,
                handleTitleChange,
                handleTitleBlur,
                handleDescriptionChange: jest.fn(),
                handleDescriptionBlur: jest.fn(),
                ...overrides,
            };
        });
    };

    const renderComponent = (overrideProps: Partial<FaqProgramSectionProps> = {}) => {
        setupHook();
        return render(<FaqProgramSection {...defaultProps} {...overrideProps} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('View mode', () => {
        it('renders FAQ section with default title and questions', () => {
            const questions = [createFaqQuestion({ id: 1 }), createFaqQuestion({ id: 2 })];
            renderComponent({ questions, mode: SectionMode.View });

            expect(screen.getByText(COMMON_TEXT_ADMIN.TAB.FAQ)).toBeInTheDocument();
            expect(screen.getByTestId('faq-card-1')).toBeInTheDocument();
            expect(screen.getByTestId('faq-card-2')).toBeInTheDocument();
        });

        it('renders faqPairs when no questions provided', () => {
            const faqPairs = [createFaqQuestion({ id: 1, questionText: 'Pair Question', answerText: 'Pair Answer' })];
            renderComponent({ faqPairs, mode: SectionMode.View });

            expect(screen.getByText('Pair Question')).toBeInTheDocument();
        });
    });

    describe('Edit mode', () => {
        it('renders editable title input with empty value when no title provided', () => {
            renderComponent({ mode: SectionMode.Edit });

            const textarea = screen.getByRole('textbox', { name: /заголовок/i });
            expect(textarea).toHaveValue('');
        });

        it('displays title validation error', () => {
            setupHook({ titleError: 'Title is too long' });
            render(<FaqProgramSection {...defaultProps} mode={SectionMode.Edit} />);

            const textareaGroup = screen.getByTestId(/textarea-group-.*-faq-title/);
            expect(textareaGroup).toHaveAttribute('data-error', 'Title is too long');
        });

        it('auto-adds first FAQ pair on mount', async () => {
            const onAddFaqPair = jest.fn();
            renderComponent({ mode: SectionMode.Edit, onAddFaqPair, faqPairs: [] });

            await waitFor(() => {
                expect(onAddFaqPair).toHaveBeenCalledWith('', '');
            });
        });

        it('renders editable FAQ cards', () => {
            const faqPairs = [
                createFaqQuestion({ id: 1, questionText: 'Q1', answerText: 'A1' }),
                createFaqQuestion({ id: 2, questionText: 'Q2', answerText: 'A2' }),
            ];
            renderComponent({ mode: SectionMode.Edit, faqPairs });

            expect(screen.getByTestId('editable-faq-card-0')).toBeInTheDocument();
            expect(screen.getByTestId('editable-faq-card-1')).toBeInTheDocument();
        });

        it('handles FAQ question and answer changes', () => {
            const onFaqQuestionChange = jest.fn();
            const onFaqAnswerChange = jest.fn();
            const faqPairs = [createFaqQuestion({ id: 1, questionText: 'Q', answerText: 'A' })];

            renderComponent({ mode: SectionMode.Edit, faqPairs, onFaqQuestionChange, onFaqAnswerChange });

            fireEvent.change(screen.getByTestId('question-input-0'), { target: { value: 'Updated Q' } });
            fireEvent.change(screen.getByTestId('answer-input-0'), { target: { value: 'Updated A' } });

            expect(onFaqQuestionChange).toHaveBeenCalledWith(0, 'Updated Q');
            expect(onFaqAnswerChange).toHaveBeenCalledWith(0, 'Updated A');
        });

        it('handles FAQ pair deletion', () => {
            const onDeleteFaqPair = jest.fn();
            const faqPairs = [
                createFaqQuestion({ id: 1, questionText: 'Q1', answerText: 'A1' }),
                createFaqQuestion({ id: 2, questionText: 'Q2', answerText: 'A2' }),
            ];

            renderComponent({ mode: SectionMode.Edit, faqPairs, onDeleteFaqPair });

            fireEvent.click(screen.getByTestId('delete-button-0'));

            expect(onDeleteFaqPair).toHaveBeenCalledWith(0);
        });

        it('handles expand/collapse toggle', () => {
            const faqPairs = [createFaqQuestion({ id: 1, questionText: 'Q1', answerText: 'A1' })];
            renderComponent({ mode: SectionMode.Edit, faqPairs });

            const expandButton = screen.getByTestId('expand-button-0');

            expect(screen.getByTestId('editable-faq-card-0')).toHaveAttribute('data-expanded', 'true');

            fireEvent.click(expandButton);
            expect(screen.getByTestId('editable-faq-card-0')).toHaveAttribute('data-expanded', 'false');

            fireEvent.click(expandButton);
            expect(screen.getByTestId('editable-faq-card-0')).toHaveAttribute('data-expanded', 'true');
        });

        it('handles add FAQ pair', () => {
            const onAddFaqPair = jest.fn();
            const faqPairs = [createFaqQuestion({ id: 1, questionText: 'Valid Q', answerText: 'Valid A' })];

            renderComponent({ mode: SectionMode.Edit, faqPairs, onAddFaqPair });

            fireEvent.click(screen.getByTestId('add-faq-button'));

            expect(onAddFaqPair).toHaveBeenCalledWith('', '');
        });

        it('disables add button when FAQ pairs have validation errors', () => {
            const faqPairs = [createFaqQuestion({ id: 1, questionText: 'Q', answerText: 'A' })];
            renderComponent({ mode: SectionMode.Edit, faqPairs });

            expect(screen.getByTestId('add-faq-button')).toBeDisabled();
        });

        it('enables add button when all FAQ pairs are valid', () => {
            const faqPairs = [createFaqQuestion({ id: 1, questionText: 'Valid Question', answerText: 'Valid Answer' })];
            renderComponent({ mode: SectionMode.Edit, faqPairs });

            expect(screen.getByTestId('add-faq-button')).not.toBeDisabled();
        });
    });

    describe('CSS classes', () => {
        it('applies correct CSS classes for each mode', () => {
            const { container: viewContainer } = renderComponent({ mode: SectionMode.View });
            expect(viewContainer.querySelector('.faq-section')).toBeInTheDocument();

            const { container: editContainer } = renderComponent({ mode: SectionMode.Edit });
            expect(editContainer.querySelector('.editable')).toBeInTheDocument();
        });
    });
});
