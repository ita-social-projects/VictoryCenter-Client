import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextOnly } from './TextOnly';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, id }: any) => (
        <input data-testid={`input-${id}`} value={value} onChange={onChange} />
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, id }: any) => (
            <textarea data-testid={`input-${id}`} value={value} onChange={onChange} />
        ),
    }),
);

describe('TextOnly', () => {
    it('should render title and description in view mode', () => {
        render(<TextOnly title="Test Title" description="Test Description" />);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render input fields when isEditable is true', () => {
        render(<TextOnly isEditable={true} title="Edit Title" description="Edit Desc" />);

        expect(screen.getByTestId('input-section-title')).toHaveValue('Edit Title');
        expect(screen.getByTestId('input-section-description')).toHaveValue('Edit Desc');
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should call onChange handlers when inputs change', () => {
        const onTitleChange = jest.fn();
        const onDescriptionChange = jest.fn();
        render(<TextOnly isEditable={true} onTitleChange={onTitleChange} onDescriptionChange={onDescriptionChange} />);

        fireEvent.change(screen.getByTestId('input-section-title'), { target: { value: 'New' } });
        fireEvent.change(screen.getByTestId('input-section-description'), { target: { value: 'Desc' } });

        expect(onTitleChange).toHaveBeenCalledWith('New');
        expect(onDescriptionChange).toHaveBeenCalledWith('Desc');
    });

    it('should apply template and editable classes correctly', () => {
        const { container, rerender } = render(<TextOnly isTemplate={true} />);
        expect(container.firstChild).toHaveClass('template');

        rerender(<TextOnly isEditable={true} />);
        expect(container.firstChild).toHaveClass('editable');
    });
});
