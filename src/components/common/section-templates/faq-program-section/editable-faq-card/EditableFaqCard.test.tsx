import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditableFaqCard } from './EditableFaqCard';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ label, id, value, onChange, onBlur, error }: any) => (
            <div data-testid={`textarea-${id}`}>
                <label>{label}</label>
                <textarea data-testid={id} value={value} onChange={onChange} onBlur={onBlur} />
                {error && <span data-testid={`error-${id}`}>{error}</span>}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <h2>{title}</h2>
                <button data-testid="confirm-delete-btn" onClick={onConfirm}>
                    Yes
                </button>
                <button data-testid="cancel-delete-btn" onClick={onCancel}>
                    No
                </button>
            </div>
        ) : null,
}));

jest.mock('@/assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-icon" {...props} />,
}));
jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="close-icon" {...props} />,
}));

jest.mock('@/const/common/action-icons', () => ({
    ACTION_ICONS: {
        delete: {
            hover: (props: any) => <svg data-testid="delete-icon" {...props} />,
        },
    },
}));

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
        validateFaqQuestion: jest.fn((val) => (val ? undefined : 'Question is required')),
        validateFaqAnswer: jest.fn((val) => (val ? undefined : 'Answer is required')),
    },
}));

describe('EditableFaqCard', () => {
    const defaultProps = {
        index: 0,
        idPrefix: 'test',
        questionText: 'Test Question',
        answerText: 'Test Answer',
        isExpanded: true,
        autoFocus: false,
        canDelete: true,
        onQuestionChange: jest.fn(),
        onAnswerChange: jest.fn(),
        onDelete: jest.fn(),
        onExpandToggle: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<EditableFaqCard {...defaultProps} />);

        expect(screen.getByTestId('test-faq-question-0')).toHaveValue('Test Question');
        expect(screen.getByTestId('test-faq-answer-0')).toHaveValue('Test Answer');
        expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
    });

    it('does not render delete button when canDelete is false', () => {
        render(<EditableFaqCard {...defaultProps} canDelete={false} />);
        expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
    });

    it('does not render answer field when isExpanded is false', () => {
        render(<EditableFaqCard {...defaultProps} isExpanded={false} />);
        expect(screen.queryByTestId('test-faq-answer-0')).not.toBeInTheDocument();
    });

    it('calls onExpandToggle when expand button is clicked', () => {
        render(<EditableFaqCard {...defaultProps} isExpanded={false} />);
        const button = screen.getByLabelText('Expand answer');
        fireEvent.click(button);
        expect(defaultProps.onExpandToggle).toHaveBeenCalledWith(0);
    });

    it('calls onQuestionChange when question is modified', () => {
        render(<EditableFaqCard {...defaultProps} />);
        const textarea = screen.getByTestId('test-faq-question-0');
        fireEvent.change(textarea, { target: { value: 'New Question' } });
        expect(defaultProps.onQuestionChange).toHaveBeenCalledWith(0, 'New Question');
    });

    it('calls onAnswerChange when answer is modified', () => {
        render(<EditableFaqCard {...defaultProps} />);
        const textarea = screen.getByTestId('test-faq-answer-0');
        fireEvent.change(textarea, { target: { value: 'New Answer' } });
        expect(defaultProps.onAnswerChange).toHaveBeenCalledWith(0, 'New Answer');
    });

    it('validates question on blur', async () => {
        render(<EditableFaqCard {...defaultProps} questionText="" />);
        const textarea = screen.getByTestId('test-faq-question-0');
        fireEvent.blur(textarea);
        expect(PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateFaqQuestion).toHaveBeenCalled();
    });

    it('validates answer on blur', async () => {
        render(<EditableFaqCard {...defaultProps} answerText="" />);
        const textarea = screen.getByTestId('test-faq-answer-0');
        fireEvent.blur(textarea);
        expect(PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateFaqAnswer).toHaveBeenCalled();
    });

    it('opens delete modal when delete button is clicked', () => {
        render(<EditableFaqCard {...defaultProps} />);
        const deleteBtn = screen.getByLabelText('Delete question');
        fireEvent.click(deleteBtn);
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('calls onDelete when delete is confirmed', () => {
        render(<EditableFaqCard {...defaultProps} />);
        const deleteBtn = screen.getByLabelText('Delete question');
        fireEvent.click(deleteBtn);

        const confirmBtn = screen.getByTestId('confirm-delete-btn');
        fireEvent.click(confirmBtn);

        expect(defaultProps.onDelete).toHaveBeenCalledWith(0);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('closes delete modal when cancel is clicked', () => {
        render(<EditableFaqCard {...defaultProps} />);
        const deleteBtn = screen.getByLabelText('Delete question');
        fireEvent.click(deleteBtn);

        const cancelBtn = screen.getByTestId('cancel-delete-btn');
        fireEvent.click(cancelBtn);

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('focuses textarea on mount if autoFocus is true', () => {
        render(<EditableFaqCard {...defaultProps} autoFocus={true} />);
        const textarea = screen.getByTestId('test-faq-question-0');
        expect(textarea).toHaveFocus();
    });
});
