import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TitleDescriptionSection } from './TitleDescriptionSection';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({
        value,
        onChange,
        id,
        label,
        placeholder,
    }: {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        id: string;
        label: string;
        placeholder: string;
    }) => (
        <div data-testid={`group-${id}`}>
            <label htmlFor={id}>{label}</label>
            <input id={id} data-testid={`input-${id}`} value={value} onChange={onChange} placeholder={placeholder} />
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            value,
            onChange,
            id,
            label,
        }: {
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            id: string;
            label: string;
        }) => (
            <div data-testid={`group-${id}`}>
                <label htmlFor={id}>{label}</label>
                <textarea id={id} data-testid={`input-${id}`} value={value} onChange={onChange} />
            </div>
        ),
    }),
);

describe('TitleDescriptionSection', () => {
    describe('View Mode (isEditable=false)', () => {
        it('should render title and description in view mode by default', () => {
            render(<TitleDescriptionSection title="Test Title" description="Test Description" />);

            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });

        it('should render empty title and description when not provided', () => {
            render(<TitleDescriptionSection />);

            expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('');
            expect(screen.getByText('', { selector: 'p' })).toBeInTheDocument();
        });

        it('should not render input fields in view mode', () => {
            render(<TitleDescriptionSection title="Test" description="Desc" />);

            expect(screen.queryByTestId('input-section-title')).not.toBeInTheDocument();
            expect(screen.queryByTestId('input-section-description')).not.toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<TitleDescriptionSection className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });

        it('should apply template class when isTemplate is true', () => {
            const { container } = render(<TitleDescriptionSection isTemplate={true} />);

            expect(container.firstChild).toHaveClass('template');
        });

        it('should not apply template class when isTemplate is false', () => {
            const { container } = render(<TitleDescriptionSection isTemplate={false} />);

            expect(container.firstChild).not.toHaveClass('template');
        });
    });

    describe('Edit Mode (isEditable=true)', () => {
        it('should render input fields when isEditable is true', () => {
            render(<TitleDescriptionSection isEditable={true} />);

            expect(screen.getByTestId('input-section-title')).toBeInTheDocument();
            expect(screen.getByTestId('input-section-description')).toBeInTheDocument();
        });

        it('should not render h2 and p elements when isEditable is true', () => {
            render(<TitleDescriptionSection isEditable={true} title="Test" description="Desc" />);

            expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
            expect(screen.queryByText('Desc', { selector: 'p' })).not.toBeInTheDocument();
        });

        it('should apply editable class when isEditable is true', () => {
            const { container } = render(<TitleDescriptionSection isEditable={true} />);

            expect(container.firstChild).toHaveClass('editable');
        });

        it('should display title value in input field', () => {
            render(<TitleDescriptionSection isEditable={true} title="Editable Title" />);

            expect(screen.getByTestId('input-section-title')).toHaveValue('Editable Title');
        });

        it('should display description value in textarea', () => {
            render(<TitleDescriptionSection isEditable={true} description="Editable Description" />);

            expect(screen.getByTestId('input-section-description')).toHaveValue('Editable Description');
        });

        it('should call onTitleChange when title input changes', () => {
            const mockOnTitleChange = jest.fn();
            render(<TitleDescriptionSection isEditable={true} onTitleChange={mockOnTitleChange} />);

            const input = screen.getByTestId('input-section-title');
            fireEvent.change(input, { target: { value: 'New Title' } });

            expect(mockOnTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('should call onDescriptionChange when description textarea changes', () => {
            const mockOnDescriptionChange = jest.fn();
            render(<TitleDescriptionSection isEditable={true} onDescriptionChange={mockOnDescriptionChange} />);

            const textarea = screen.getByTestId('input-section-description');
            fireEvent.change(textarea, { target: { value: 'New Description' } });

            expect(mockOnDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('should not throw when onTitleChange is not provided', () => {
            render(<TitleDescriptionSection isEditable={true} />);

            const input = screen.getByTestId('input-section-title');

            expect(() => {
                fireEvent.change(input, { target: { value: 'Test' } });
            }).not.toThrow();
        });

        it('should not throw when onDescriptionChange is not provided', () => {
            render(<TitleDescriptionSection isEditable={true} />);

            const textarea = screen.getByTestId('input-section-description');

            expect(() => {
                fireEvent.change(textarea, { target: { value: 'Test' } });
            }).not.toThrow();
        });
    });

    describe('Combined Props', () => {
        it('should apply both template and editable classes when both are true', () => {
            const { container } = render(<TitleDescriptionSection isTemplate={true} isEditable={true} />);

            expect(container.firstChild).toHaveClass('template');
            expect(container.firstChild).toHaveClass('editable');
        });

        it('should apply custom className along with template and editable classes', () => {
            const { container } = render(
                <TitleDescriptionSection isTemplate={true} isEditable={true} className="my-custom-class" />,
            );

            expect(container.firstChild).toHaveClass('template');
            expect(container.firstChild).toHaveClass('editable');
            expect(container.firstChild).toHaveClass('my-custom-class');
        });
    });
});
