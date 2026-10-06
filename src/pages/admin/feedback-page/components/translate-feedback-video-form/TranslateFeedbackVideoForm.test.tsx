import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFeedbackVideoForm, TranslateFeedbackVideoFormRef } from './TranslateFeedbackVideoForm';
import {
    expectFormPreventsDefaultSubmit,
    expectFormRefExposesDirtyState,
    expectFieldsDisabledWhenFormDisabled,
} from '@/utils/test-mocks/test-mocks';

const renderForm = (props: any = {}) => {
    const ref = createRef<TranslateFeedbackVideoFormRef>();
    const defaultProps = { onSubmit: jest.fn() };

    render(<TranslateFeedbackVideoForm ref={ref} {...defaultProps} {...props} />);
    return { ref, ...defaultProps, ...props };
};

describe('TranslateFeedbackVideoForm', () => {
    it('renders form and field empty by default', () => {
        renderForm();

        expect(screen.getByTestId('translate-feedback-video-form')).toBeInTheDocument();
        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('');
    });

    it('fills field with initialData', () => {
        renderForm({ initialData: { title: 'My video' } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('My video');
    });

    it('updates field on change', () => {
        renderForm();

        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'New title' } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('New title');
    });

    it('shows required error on blur when title is empty', () => {
        renderForm();

        fireEvent.blur(screen.getByLabelText(/Заголовок/));

        expect(screen.getByLabelText(/Заголовок/)).toBeInvalid();
    });

    it('submits form via ref with value', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'Video title' } });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledWith({ title: 'Video title' });
    });

    it('exposes isDirty via ref', () => {
        const { ref } = renderForm();

        expectFormRefExposesDirtyState(ref, () =>
            fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'Video title' } }),
        );
    });

    it('disables field when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expectFieldsDisabledWhenFormDisabled([/Заголовок/]);
    });

    it('truncates typed input at the character limit', () => {
        renderForm();

        const longTitle = 'a'.repeat(201);
        fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: longTitle } });

        expect(screen.getByLabelText(/Заголовок/)).toHaveValue('a'.repeat(200));
    });

    it('does not submit when initialData exceeds max length', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({
            onSubmit,
            initialData: { title: 'a'.repeat(201) },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('prevents default behavior on native form submit', () => {
        renderForm();

        expectFormPreventsDefaultSubmit('translate-feedback-video-form');
    });
});
