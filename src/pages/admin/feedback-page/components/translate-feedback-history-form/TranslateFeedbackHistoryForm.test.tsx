import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFeedbackHistoryForm, TranslateFeedbackHistoryFormRef } from './TranslateFeedbackHistoryForm';
import {
    expectFormPreventsDefaultSubmit,
    expectFormRefExposesDirtyState,
    expectFieldsDisabledWhenFormDisabled,
} from '@/utils/test-mocks/test-mocks';

const renderForm = (props: any = {}) => {
    const ref = createRef<TranslateFeedbackHistoryFormRef>();
    const defaultProps = { onSubmit: jest.fn() };

    render(<TranslateFeedbackHistoryForm ref={ref} {...defaultProps} {...props} />);
    return { ref, ...defaultProps, ...props };
};

describe('TranslateFeedbackHistoryForm', () => {
    it('renders form and fields empty by default', () => {
        renderForm();

        expect(screen.getByTestId('translate-feedback-history-form')).toBeInTheDocument();
        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('');
        expect(screen.getByLabelText(/Історія/)).toHaveValue('');
    });

    it('fills fields with initialData', () => {
        renderForm({ initialData: { title: 'My story', story: 'Long story text' } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('My story');
        expect(screen.getByLabelText(/Історія/)).toHaveValue('Long story text');
    });

    it('updates fields on change', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'New title' } });
        fireEvent.change(screen.getByLabelText(/Історія/), { target: { value: 'New story' } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('New title');
        expect(screen.getByLabelText(/Історія/)).toHaveValue('New story');
    });

    it('shows required error on blur when title is empty', () => {
        renderForm();

        fireEvent.blur(screen.getByLabelText(/Заголовок/));

        expect(screen.getByLabelText(/Заголовок/)).toBeInvalid();
    });

    it('trims and validates story on blur', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Історія/), { target: { value: '  padded story  ' } });
        fireEvent.blur(screen.getByLabelText(/Історія/));

        expect(screen.getByLabelText(/Історія/)).toHaveValue('padded story');
        expect(screen.getByLabelText(/Історія/)).toBeValid();
    });

    it('preserves line breaks in story while typing, matching the base Add-history modal', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Історія/), { target: { value: 'Line one\nLine two' } });

        expect(screen.getByLabelText(/Історія/)).toHaveValue('Line one\nLine two');
    });

    it('collapses multiple spaces while typing without stripping the whole value', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'a   b   c' } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('a b c');
    });

    it('submits form via ref with trimmed values', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'Valid Title' } });
        fireEvent.change(screen.getByLabelText(/Історія/), { target: { value: 'Valid Story Text' } });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ title: 'Valid Title', story: 'Valid Story Text' });
    });

    it('exposes isValid and isDirty via ref', () => {
        const { ref } = renderForm();

        expectFormRefExposesDirtyState(ref, () =>
            fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'Title' } }),
        );
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expectFieldsDisabledWhenFormDisabled([/Заголовок/, /Історія/]);
    });

    it('truncates typed input at the character limit instead of allowing it to exceed max', () => {
        renderForm();

        const longTitle = 'a'.repeat(51);
        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: longTitle } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('a'.repeat(50));
    });

    it('does not submit when initialData title exceeds max length', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: { title: 'a'.repeat(51), story: 'Story' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('prevents default behavior on native form submit', () => {
        renderForm();

        expectFormPreventsDefaultSubmit('translate-feedback-history-form');
    });
});
