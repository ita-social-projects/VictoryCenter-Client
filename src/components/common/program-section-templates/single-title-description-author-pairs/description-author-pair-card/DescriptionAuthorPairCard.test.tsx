import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentType } from '@/types/common/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';

import { DescriptionAuthorPairCard } from './DescriptionAuthorPairCard';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

jest.mock('@/utils/functions/program-section-template-validation/programSectionTemplateValidation', () => ({
    getProgramSectionTemplateMaxLength: jest.fn(() => 50),
}));

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
        validateContentText: jest.fn(),
    },
}));

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
}));

jest.mock('@/assets/icons/delete.svg', () => ({
    ReactComponent: () => <svg data-testid="delete-icon" />,
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: (props: any) => {
        const { id, value, onChange, onBlur, error } = props;
        return (
            <div data-testid={`input-group-${id}`} data-error={error ?? ''}>
                <input data-testid={`input-${id}`} value={value} onChange={onChange} onBlur={onBlur} />
            </div>
        );
    },
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: (props: any) => {
            const { id, value, onChange, onBlur, error } = props;
            return (
                <div data-testid={`textarea-group-${id}`} data-error={error ?? ''}>
                    <textarea data-testid={`textarea-${id}`} value={value} onChange={onChange} onBlur={onBlur} />
                </div>
            );
        },
    }),
);

const validateContentTextMock = PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText as unknown as jest.Mock<
    string | undefined
>;

type DescriptionAuthorPairCardProps = React.ComponentProps<typeof DescriptionAuthorPairCard>;

const renderCard = (overrides: Partial<DescriptionAuthorPairCardProps> = {}) => {
    const props: DescriptionAuthorPairCardProps = {
        description: 'D',
        author: 'A',
        index: 0,
        isEditable: true,
        ...overrides,
    };

    return render(<DescriptionAuthorPairCard {...props} />);
};

describe('DescriptionAuthorPairCard', () => {
    beforeEach(() => {
        validateContentTextMock.mockReset();
        validateContentTextMock.mockReturnValue(undefined);
    });

    it('renders preview when not editable', () => {
        renderCard({ isEditable: false, description: 'Desc', author: 'Auth' });

        expect(screen.getByText('Desc')).toBeInTheDocument();
        expect(screen.getByText('Auth')).toBeInTheDocument();
        expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('textarea-pair-description-0')).not.toBeInTheDocument();
        expect(screen.queryByTestId('input-pair-author-0')).not.toBeInTheDocument();
    });

    it('renders editable inputs and hides delete for first card', () => {
        renderCard({ index: 0 });

        expect(screen.getByTestId('textarea-pair-description-0')).toBeInTheDocument();
        expect(screen.getByTestId('input-pair-author-0')).toBeInTheDocument();
        expect(screen.queryByLabelText('delete')).not.toBeInTheDocument();
    });

    it('renders delete for cards after the first and calls onDelete', () => {
        const onDelete = jest.fn();
        renderCard({ index: 2, onDelete });

        fireEvent.click(screen.getByLabelText('delete'));

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(2);
    });

    it('does not throw when delete clicked without onDelete', () => {
        renderCard({ index: 1, onDelete: undefined });

        fireEvent.click(screen.getByLabelText('delete'));

        expect(true).toBe(true);
    });

    it('calls change handlers with index and value', () => {
        const onDescriptionChange = jest.fn();
        const onAuthorChange = jest.fn();

        renderCard({ index: 4, description: '', author: '', onDescriptionChange, onAuthorChange });

        fireEvent.change(screen.getByTestId('textarea-pair-description-4'), { target: { value: 'New desc' } });
        fireEvent.change(screen.getByTestId('input-pair-author-4'), { target: { value: 'New author' } });

        expect(onDescriptionChange).toHaveBeenCalledWith(4, 'New desc');
        expect(onAuthorChange).toHaveBeenCalledWith(4, 'New author');
    });

    it('validates on blur and re-validates on change after an error appears', async () => {
        validateContentTextMock.mockReturnValue('error');

        renderCard({ index: 3, description: '', author: '' });

        fireEvent.blur(screen.getByTestId('textarea-pair-description-3'));
        fireEvent.blur(screen.getByTestId('input-pair-author-3'));

        expect(validateContentTextMock).toHaveBeenCalledTimes(2);
        expect(validateContentTextMock).toHaveBeenNthCalledWith(
            1,
            '',
            ContentType.Description,
            true,
            ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
        );
        expect(validateContentTextMock).toHaveBeenNthCalledWith(
            2,
            '',
            ContentType.Author,
            true,
            ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
        );

        await waitFor(() => {
            expect(screen.getByTestId('textarea-group-pair-description-3')).toHaveAttribute('data-error', 'error');
            expect(screen.getByTestId('input-group-pair-author-3')).toHaveAttribute('data-error', 'error');
        });

        validateContentTextMock.mockReturnValue(undefined);

        fireEvent.change(screen.getByTestId('textarea-pair-description-3'), { target: { value: 'X' } });
        fireEvent.change(screen.getByTestId('input-pair-author-3'), { target: { value: 'Y' } });

        expect(validateContentTextMock).toHaveBeenCalledTimes(4);

        await waitFor(() => {
            expect(screen.getByTestId('textarea-group-pair-description-3')).toHaveAttribute('data-error', '');
            expect(screen.getByTestId('input-group-pair-author-3')).toHaveAttribute('data-error', '');
        });
    });
});
