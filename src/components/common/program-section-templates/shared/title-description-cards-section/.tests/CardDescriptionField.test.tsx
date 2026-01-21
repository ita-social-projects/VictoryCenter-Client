import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardDescriptionField } from '../CardDescriptionField';

jest.mock('@/components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ htmlFor, text, isRequired }: any) => (
        <label data-testid="input-label" htmlFor={htmlFor}>
            {text}
            {isRequired && <span data-testid="required">*</span>}
        </label>
    ),
}));

jest.mock('@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter', () => ({
    InputErrorWithCharacterCounter: ({ error, currentLength, maxLength, counterId, htmlFor }: any) => (
        <div data-testid="error-counter">
            <span data-testid="current-length">{currentLength}</span>
            <span data-testid="max-length">{maxLength}</span>
            {error && <span data-testid="error-text">{error}</span>}
            <span data-testid="counter-id">{counterId}</span>
            <span data-testid="counter-for">{htmlFor}</span>
        </div>
    ),
}));

jest.mock('@/components/admin/textarea-with-bullets/TextAreaWithBulletBehavior', () => ({
    TextAreaWithBulletBehavior: (props: any) => <textarea data-testid="textarea" {...props} />,
}));

describe('CardDescriptionField', () => {
    const baseProps = {
        label: 'Description',
        id: 'description',
        name: 'description',
        value: 'Initial text',
        maxLength: 200,
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders label, textarea and counter', () => {
        render(<CardDescriptionField {...baseProps} />);

        expect(screen.getByTestId('input-label')).toBeInTheDocument();
        expect(screen.getByTestId('textarea')).toBeInTheDocument();
        expect(screen.getByTestId('error-counter')).toBeInTheDocument();
    });

    it('renders correct label text and required indicator', () => {
        render(<CardDescriptionField {...baseProps} isRequired />);

        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByTestId('required')).toBeInTheDocument();
    });

    it('passes value to textarea', () => {
        render(<CardDescriptionField {...baseProps} />);

        expect(screen.getByTestId('textarea')).toHaveValue('Initial text');
    });

    it('passes placeholder, rows and disabled props', () => {
        render(<CardDescriptionField {...baseProps} placeholder="Enter description" rows={5} disabled />);

        const textarea = screen.getByTestId('textarea');

        expect(textarea).toHaveAttribute('placeholder', 'Enter description');
        expect(textarea).toHaveAttribute('rows', '5');
        expect(textarea).toBeDisabled();
    });

    it('calls onChange when textarea value changes', () => {
        render(<CardDescriptionField {...baseProps} />);

        fireEvent.change(screen.getByTestId('textarea'), {
            target: { value: 'Updated text' },
        });

        expect(baseProps.onChange).toHaveBeenCalled();
    });

    it('calls onBlur and onFocus callbacks', () => {
        const onBlur = jest.fn();
        const onFocus = jest.fn();

        render(<CardDescriptionField {...baseProps} onBlur={onBlur} onFocus={onFocus} />);

        const textarea = screen.getByTestId('textarea');

        fireEvent.focus(textarea);
        fireEvent.blur(textarea);

        expect(onFocus).toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalled();
    });

    it('uses value length as currentLength when currentLength is not provided', () => {
        render(<CardDescriptionField {...baseProps} />);

        expect(screen.getByTestId('current-length')).toHaveTextContent(baseProps.value.length.toString());
    });

    it('uses provided currentLength instead of value length', () => {
        render(<CardDescriptionField {...baseProps} currentLength={42} />);

        expect(screen.getByTestId('current-length')).toHaveTextContent('42');
    });

    it('renders error message when error is provided', () => {
        render(<CardDescriptionField {...baseProps} error="Description is required" />);

        expect(screen.getByTestId('error-text')).toHaveTextContent('Description is required');
    });

    it('passes correct counterId and htmlFor to error counter', () => {
        render(<CardDescriptionField {...baseProps} />);

        expect(screen.getByTestId('counter-id')).toHaveTextContent('description-character-count');
        expect(screen.getByTestId('counter-for')).toHaveTextContent('description');
    });
});
