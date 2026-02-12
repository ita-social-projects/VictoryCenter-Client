import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TranslateFaqForm, TranslateFaqFormRef } from './TranslateFaqForm';
import { FAQ_VALIDATION } from '@/const/admin/faq';

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, id, error }: any) => (
        <div data-testid={`${id}-wrapper`}>
            <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
            {error && <span data-testid={`${id}-error`}>{error}</span>}
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, id, error }: any) => (
            <div data-testid={`${id}-wrapper`}>
                <textarea data-testid={id} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
                {error && <span data-testid={`${id}-error`}>{error}</span>}
            </div>
        ),
    }),
);

const TEST_DATA = {
    question: 'What is FAQ? This needs to be long enough.',
    answer: 'Frequently Asked Questions '.repeat(5),
    newQuestion: 'New question? Also long enough.',
    newAnswer: 'New answer '.repeat(10),
    shortQuestion: 'Short',
    shortAnswer: 'Short',
};

const FIELD_IDS = {
    form: 'translate-faq-form',
    question: 'question',
    answer: 'answer',
    controls: 'translation-controls',
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
        questionError: screen.queryByTestId(`${FIELD_IDS.question}-error`),
        answerError: screen.queryByTestId(`${FIELD_IDS.answer}-error`),
    });

    const fillForm = (question: string, answer: string) => {
        const fields = getFields();
        fireEvent.change(fields.question, { target: { value: question } });
        fireEvent.change(fields.answer, { target: { value: answer } });
    };

    it('renders form and structural elements', () => {
        renderForm();
        const fields = getFields();

        expect(screen.getByTestId(FIELD_IDS.form)).toBeInTheDocument();
        expect(fields.question).toBeInTheDocument();
        expect(fields.answer).toBeInTheDocument();
        expect(fields.questionError).not.toBeInTheDocument();
        expect(fields.answerError).not.toBeInTheDocument();
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

    it('shows validation error when leaving empty required fields (onBlur)', () => {
        renderForm();
        const fields = getFields();

        fireEvent.focus(fields.question);
        fireEvent.blur(fields.question);

        fireEvent.focus(fields.answer);
        fireEvent.blur(fields.answer);

        expect(screen.getByTestId(`${FIELD_IDS.question}-error`)).toHaveTextContent(
            FAQ_VALIDATION.question.getRequiredError(),
        );
        expect(screen.getByTestId(`${FIELD_IDS.answer}-error`)).toHaveTextContent(
            FAQ_VALIDATION.answer.getRequiredWhenPublishingError(),
        );
    });

    it('shows validation error for too short text on blur', () => {
        renderForm();

        fillForm(TEST_DATA.shortQuestion, TEST_DATA.shortAnswer);
        const fields = getFields();

        fireEvent.blur(fields.question);
        fireEvent.blur(fields.answer);

        expect(screen.getByTestId(`${FIELD_IDS.question}-error`)).toHaveTextContent(
            FAQ_VALIDATION.question.getMinError(),
        );
        expect(screen.getByTestId(`${FIELD_IDS.answer}-error`)).toHaveTextContent(FAQ_VALIDATION.answer.getMinError());
    });

    it('submits form via ref with valid data', async () => {
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

    it('blocks submit via ref with invalid data', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fillForm(TEST_DATA.shortQuestion, TEST_DATA.shortAnswer);

        await act(async () => {
            try {
                await ref.current?.submit();
            } catch {
            }
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('exposes isValid and isDirty via ref correctly', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(false);
        expect(ref.current?.isDirty()).toBe(false);

        fillForm(TEST_DATA.question, TEST_DATA.answer);

        expect(ref.current?.isDirty()).toBe(true);
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        const fields = getFields();
        expect(fields.question).toBeDisabled();
        expect(fields.answer).toBeDisabled();
    });
});
