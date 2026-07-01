import { render, screen, fireEvent } from '@testing-library/react';
import { EditableFaqCard } from './EditableFaqCard';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const mockOnQuestionChange = jest.fn();
const mockOnAnswerChange = jest.fn();
const mockOnDelete = jest.fn();
const mockOnExpandToggle = jest.fn();

const defaultProps = {
    index: 0,
    idPrefix: 'test',
    questionText: 'Test Question',
    answerText: 'Test Answer',
    isExpanded: false,
    onQuestionChange: mockOnQuestionChange,
    onAnswerChange: mockOnAnswerChange,
    onDelete: mockOnDelete,
    onExpandToggle: mockOnExpandToggle,
};

describe('EditableFaqCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders closed card correctly', () => {
        render(<EditableFaqCard {...defaultProps} />);

        expect(screen.getByLabelText('Delete question')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Question')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Test Answer')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Expand answer' })).toBeInTheDocument();
    });

    it('renders expanded card correctly', () => {
        render(<EditableFaqCard {...defaultProps} isExpanded={true} />);

        expect(screen.getByDisplayValue('Test Answer')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Collapse answer' })).toBeInTheDocument();
    });

    it('calls onExpandToggle when expand button is clicked', () => {
        render(<EditableFaqCard {...defaultProps} />);

        const expandButton = screen.getByRole('button', { name: 'Expand answer' });
        fireEvent.click(expandButton);

        expect(mockOnExpandToggle).toHaveBeenCalledWith(0);
    });

    it('calls onQuestionChange when question is modified', () => {
        render(<EditableFaqCard {...defaultProps} />);

        const questionInput = screen.getByDisplayValue('Test Question');
        fireEvent.change(questionInput, { target: { value: 'New Question' } });

        expect(mockOnQuestionChange).toHaveBeenCalledWith(0, 'New Question');
    });

    it('calls onAnswerChange when answer is modified', () => {
        render(<EditableFaqCard {...defaultProps} isExpanded={true} />);

        const answerInput = screen.getByDisplayValue('Test Answer');
        fireEvent.change(answerInput, { target: { value: 'New Answer' } });

        expect(mockOnAnswerChange).toHaveBeenCalledWith(0, 'New Answer');
    });

    it('shows delete modal and handles cancel', () => {
        render(<EditableFaqCard {...defaultProps} />);

        const deleteBtn = screen.getByLabelText('Delete question');
        fireEvent.click(deleteBtn);

        expect(
            screen.getByText(
                SECTIONS_TEXT.SECTION.SINGLE_TITLE_QUESTION_ANSWER_PAIRS.MODAL.DELETE_QUESTION_CONFIRMATION,
            ),
        ).toBeInTheDocument();

        const cancelBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO });
        fireEvent.click(cancelBtn);

        expect(
            screen.queryByText(
                SECTIONS_TEXT.SECTION.SINGLE_TITLE_QUESTION_ANSWER_PAIRS.MODAL.DELETE_QUESTION_CONFIRMATION,
            ),
        ).not.toBeInTheDocument();
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('shows delete modal and handles confirm', () => {
        render(<EditableFaqCard {...defaultProps} />);

        const deleteBtn = screen.getByLabelText('Delete question');
        fireEvent.click(deleteBtn);

        const confirmBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES });
        fireEvent.click(confirmBtn);

        expect(mockOnDelete).toHaveBeenCalledWith(0);
    });

    it('validates question on blur', () => {
        render(<EditableFaqCard {...defaultProps} questionText="" />);

        const questionInput = screen.getAllByRole('textbox')[0];
        fireEvent.blur(questionInput);

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('validates answer on blur', () => {
        render(<EditableFaqCard {...defaultProps} answerText="" isExpanded={true} />);

        const answerInput = screen.getAllByRole('textbox')[1];
        fireEvent.blur(answerInput);

        expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
    });

    it('focuses question text area on mount if autoFocus is true', () => {
        render(<EditableFaqCard {...defaultProps} autoFocus={true} />);
        const questionInput = screen.getAllByRole('textbox')[0];
        expect(questionInput).toHaveFocus();
    });

    it('does not render delete button if canDelete is false', () => {
        render(<EditableFaqCard {...defaultProps} canDelete={false} />);
        expect(screen.queryByLabelText('Delete question')).not.toBeInTheDocument();
    });
});
