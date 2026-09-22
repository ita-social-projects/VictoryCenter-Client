import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFeedbackReviewForm, TranslateFeedbackReviewFormRef } from './TranslateFeedbackReviewForm';
import { expectFormPreventsDefaultSubmit } from '@/utils/test-mocks/test-mocks';

const renderForm = (props: any = {}) => {
    const ref = createRef<TranslateFeedbackReviewFormRef>();
    const defaultProps = { onSubmit: jest.fn() };

    render(<TranslateFeedbackReviewForm ref={ref} {...defaultProps} {...props} />);
    return { ref, ...defaultProps, ...props };
};

describe('TranslateFeedbackReviewForm', () => {
    it('renders form and fields empty by default', () => {
        renderForm();

        expect(screen.getByTestId('translate-feedback-review-form')).toBeInTheDocument();
        expect(screen.getByLabelText(/Ім'я/)).toHaveValue('');
        expect(screen.getByLabelText(/Відгук/)).toHaveValue('');
    });

    it('fills fields with initialData', () => {
        renderForm({ initialData: { authorName: 'Jane', text: 'Great!' } });

        expect(screen.getByLabelText(/Ім'я/)).toHaveValue('Jane');
        expect(screen.getByLabelText(/Відгук/)).toHaveValue('Great!');
    });

    it('updates fields on change', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Ім'я/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Відгук/), { target: { value: 'Nice' } });

        expect(screen.getByLabelText(/Ім'я/)).toHaveValue('John');
        expect(screen.getByLabelText(/Відгук/)).toHaveValue('Nice');
    });

    it('shows required error on blur when authorName is empty', () => {
        renderForm();

        fireEvent.blur(screen.getByLabelText(/Ім'я/));

        expect(screen.getByLabelText(/Ім'я/)).toBeInvalid();
    });

    it('trims and validates text on blur', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Відгук/), { target: { value: '  nice enough  ' } });
        fireEvent.blur(screen.getByLabelText(/Відгук/));

        expect(screen.getByLabelText(/Відгук/)).toHaveValue('nice enough');
        expect(screen.getByLabelText(/Відгук/)).toBeValid();
    });

    it('preserves line breaks in text while typing, matching the base Add-review modal', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Відгук/), { target: { value: 'Line one\nLine two' } });

        expect(screen.getByLabelText(/Відгук/)).toHaveValue('Line one\nLine two');
    });

    it('collapses multiple spaces while typing without stripping the whole value', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Ім'я/), { target: { value: 'a   b   c' } });

        expect(screen.getByLabelText(/Ім'я/)).toHaveValue('a b c');
    });

    it('submits form via ref with values', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByLabelText(/Ім'я/), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Відгук/), { target: { value: 'Nice service overall' } });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ authorName: 'John', text: 'Nice service overall' });
    });

    it('exposes isDirty via ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isDirty()).toBe(false);

        fireEvent.change(screen.getByLabelText(/Ім'я/), { target: { value: 'John' } });

        expect(ref.current?.isDirty()).toBe(true);
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByLabelText(/Ім'я/)).toBeDisabled();
        expect(screen.getByLabelText(/Відгук/)).toBeDisabled();
    });

    it('truncates typed input at the character limit', () => {
        renderForm();

        const longText = 'a'.repeat(501);
        fireEvent.change(screen.getByLabelText(/Відгук/), { target: { value: longText } });

        expect(screen.getByLabelText(/Відгук/)).toHaveValue('a'.repeat(500));
    });

    it('does not submit when initialData exceeds max length', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: { authorName: 'a'.repeat(201), text: 'Nice' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('prevents default behavior on native form submit', () => {
        renderForm();

        expectFormPreventsDefaultSubmit('translate-feedback-review-form');
    });
});
