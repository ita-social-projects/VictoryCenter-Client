import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DescriptionAuthorPairCard } from './DescriptionAuthorPairCard';

const mockTextAreaProps = jest.fn();
const mockInputProps = jest.fn();

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: (props: any) => {
        mockInputProps(props);
        const { id, value, onChange } = props;
        return <input data-testid={`input-${id}`} value={value} onChange={onChange} />;
    },
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: (props: any) => {
            mockTextAreaProps(props);
            const { id, value, onChange } = props;
            return <textarea data-testid={`textarea-${id}`} value={value} onChange={onChange} />;
        },
    }),
);

jest.mock('@/const/admin/programs', () => ({
    PROGRAMS_TEXT: {
        SECTION: {
            CARD: {
                FORM: {
                    DESCRIPTION: { TEXT: 'Description', PLACEHOLDER: 'Description placeholder' },
                    AUTHOR: { TEXT: 'Author', PLACEHOLDER: 'Author placeholder' },
                },
            },
        },
    },
    PROGRAM_SECTION_VALIDATION: {
        cardDescription: { max: 200 },
        cardAuthor: { max: 50 },
    },
}));

jest.mock('@/assets/icons/delete.svg', () => ({
    ReactComponent: () => <svg data-testid="delete-icon" />,
}));

const setup = (props: React.ComponentProps<typeof DescriptionAuthorPairCard>) => {
    mockTextAreaProps.mockClear();
    mockInputProps.mockClear();
    return render(<DescriptionAuthorPairCard {...props} />);
};

describe('DescriptionAuthorPairCard', () => {
    it('renders preview text when not editable', () => {
        setup({ description: 'D', author: 'A', index: 0, isEditable: false });

        expect(screen.getByText('D')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.queryByLabelText('delete')).not.toBeInTheDocument();
    });

    it('renders editable fields and delete button when editable', () => {
        setup({ description: 'D', author: 'A', index: 2, isEditable: true });

        expect(screen.getByLabelText('delete')).toBeInTheDocument();
        expect(screen.getByTestId('delete-icon')).toBeInTheDocument();

        expect(screen.getByTestId('textarea-pair-description-2')).toBeInTheDocument();
        expect(screen.getByTestId('input-pair-author-2')).toBeInTheDocument();
    });

    it('calls onDelete with index', () => {
        const onDelete = jest.fn();
        setup({ description: 'D', author: 'A', index: 3, isEditable: true, onDelete });

        fireEvent.click(screen.getByLabelText('delete'));

        expect(onDelete).toHaveBeenCalledWith(3);
    });

    it('does not crash when delete clicked without onDelete', () => {
        setup({ description: 'D', author: 'A', index: 1, isEditable: true });

        fireEvent.click(screen.getByLabelText('delete'));

        expect(true).toBe(true);
    });

    it('calls onDescriptionChange with index and value', () => {
        const onDescriptionChange = jest.fn();
        setup({
            description: '',
            author: 'A',
            index: 4,
            isEditable: true,
            onDescriptionChange,
        });

        fireEvent.change(screen.getByTestId('textarea-pair-description-4'), { target: { value: 'X' } });

        expect(onDescriptionChange).toHaveBeenCalledWith(4, 'X');
    });

    it('does not crash when description changes without onDescriptionChange', () => {
        setup({
            description: '',
            author: 'A',
            index: 5,
            isEditable: true,
        });

        fireEvent.change(screen.getByTestId('textarea-pair-description-5'), { target: { value: 'X' } });

        expect(true).toBe(true);
    });

    it('calls onAuthorChange with index and value', () => {
        const onAuthorChange = jest.fn();
        setup({
            description: 'D',
            author: '',
            index: 6,
            isEditable: true,
            onAuthorChange,
        });

        fireEvent.change(screen.getByTestId('input-pair-author-6'), { target: { value: 'Y' } });

        expect(onAuthorChange).toHaveBeenCalledWith(6, 'Y');
    });

    it('does not crash when author changes without onAuthorChange', () => {
        setup({
            description: 'D',
            author: '',
            index: 7,
            isEditable: true,
        });

        fireEvent.change(screen.getByTestId('input-pair-author-7'), { target: { value: 'Y' } });

        expect(true).toBe(true);
    });

    it('passes ids based on index to inputs', () => {
        setup({ description: 'D', author: 'A', index: 9, isEditable: true });

        expect(mockTextAreaProps).toHaveBeenCalled();
        expect(mockInputProps).toHaveBeenCalled();

        expect(mockTextAreaProps.mock.calls[0][0].id).toBe('pair-description-9');
        expect(mockInputProps.mock.calls[0][0].id).toBe('pair-author-9');
    });
});
