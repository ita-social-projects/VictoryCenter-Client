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

const TEST_DATA = {
    question: 'What is FAQ?',
    answer: 'Frequently Asked Questions',
    newQuestion: 'New question?',
    newAnswer: 'New answer',
    validQuestion: 'Valid question?',
    validAnswer: 'Valid answer',
};

const FIELD_IDS = {
    form: 'translate-faq-form',
    question: 'question',
    answer: 'answer',
    select: 'select',
};

describe('TranslateFaqForm', () => {
    const renderForm = (props: any = {}) => {
        const ref = createRef<TranslateFaqFormRef>();
        render(<TranslateFaqForm ref={ref} onSubmit={jest.fn()} {...props} />);
        return { ref };
    };

    const getFields = () => ({
        question: screen.getByTestId(FIELD_IDS.question),
        answer: screen.getByTestId(FIELD_IDS.answer),
    });

    const fillForm = (question: string, answer: string) => {
        const fields = getFields();
        fireEvent.change(fields.question, { target: { value: question } });
        fireEvent.change(fields.answer, { target: { value: answer } });
    };

    it('renders form and fields', () => {
        renderForm();

        expect(screen.getByTestId(FIELD_IDS.form)).toBeInTheDocument();
        expect(screen.getByTestId(FIELD_IDS.question)).toBeInTheDocument();
        expect(screen.getByTestId(FIELD_IDS.answer)).toBeInTheDocument();
        expect(screen.getByTestId(FIELD_IDS.select)).toBeInTheDocument();
    });

    it('fills fields with initialData', () => {
        renderForm({
            initialData: {
                question: TEST_DATA.question,
                answer: TEST_DATA.answer,
            },
        });

        const fields = getFields();
        expect(fields.question).toHaveValue(TEST_DATA.question);
        expect(fields.answer).toHaveValue(TEST_DATA.answer);
    });

    it('updates fields on change', () => {
        renderForm();

        fillForm(TEST_DATA.newQuestion, TEST_DATA.newAnswer);

        const fields = getFields();
        expect(fields.question).toHaveValue(TEST_DATA.newQuestion);
        expect(fields.answer).toHaveValue(TEST_DATA.newAnswer);
    });

    it('submits form via ref', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fillForm(TEST_DATA.question, TEST_DATA.answer);

        await act(async () => {
            await ref.current?.submit();
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            question: TEST_DATA.question,
            answer: TEST_DATA.answer,
        });
    });

    it('exposes isValid and isDirty via ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(false);
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        const fields = getFields();
        expect(fields.question).toBeDisabled();
        expect(fields.answer).toBeDisabled();
    });

    describe('Form validation', () => {
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

            fillForm(TEST_DATA.validQuestion, TEST_DATA.validAnswer);

            await act(async () => {
                await ref.current?.submit();
            });

            expect(onSubmit).toHaveBeenCalledTimes(1);
        });
    });
});
