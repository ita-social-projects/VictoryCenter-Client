import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TranslateFaqForm, TranslateFaqFormRef } from './TranslateFaqForm';

jest.mock('@/components/common/select/Select', () => {
    const Select = ({ children }: any) => <div data-testid="select">{children}</div>;

    Select.Option = ({ children }: any) => <div data-testid="select-option">{children}</div>;

    return { Select };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, disabled, id }: any) => (
        <input data-testid={id} value={value} onChange={onChange} disabled={disabled} />
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, disabled, id }: any) => (
            <textarea data-testid={id} value={value} onChange={onChange} disabled={disabled} />
        ),
    }),
);

const renderForm = (props: any = {}) => {
    const ref = createRef<TranslateFaqFormRef>();

    render(<TranslateFaqForm ref={ref} onSubmit={jest.fn()} {...props} />);

    return { ref };
};

describe('TranslateFaqForm', () => {
    it('renders form and fields', () => {
        renderForm();

        expect(screen.getByTestId('translate-faq-form')).toBeInTheDocument();
        expect(screen.getByTestId('question')).toBeInTheDocument();
        expect(screen.getByTestId('answer')).toBeInTheDocument();
        expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('fills fields with initialData', () => {
        renderForm({
            initialData: {
                question: 'What is FAQ?',
                answer: 'Frequently Asked Questions',
            },
        });

        expect(screen.getByTestId('question')).toHaveValue('What is FAQ?');
        expect(screen.getByTestId('answer')).toHaveValue('Frequently Asked Questions');
    });

    it('updates fields on change', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('question'), {
            target: { value: 'New question?' },
        });

        fireEvent.change(screen.getByTestId('answer'), {
            target: { value: 'New answer' },
        });

        expect(screen.getByTestId('question')).toHaveValue('New question?');
        expect(screen.getByTestId('answer')).toHaveValue('New answer');
    });

    it('submits form via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('question'), {
            target: { value: 'What is FAQ?' },
        });

        fireEvent.change(screen.getByTestId('answer'), {
            target: { value: 'Frequently Asked Questions' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            question: 'What is FAQ?',
            answer: 'Frequently Asked Questions',
        });
    });

    it('exposes isValid and isDirty via ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(false);
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByTestId('question')).toBeDisabled();
        expect(screen.getByTestId('answer')).toBeDisabled();
    });

    it('validates required fields on submit', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        await act(async () => {
            try {
                await ref.current?.submit();
            } catch {
                // Expected validation error
            }
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('passes validation with valid data', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('question'), {
            target: { value: 'Valid question?' },
        });

        fireEvent.change(screen.getByTestId('answer'), {
            target: { value: 'Valid answer' },
        });

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
