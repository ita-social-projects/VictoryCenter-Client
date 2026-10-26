import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaqForm, FaqFormRef } from './FaqForm';
import { FAQ_VALIDATION } from '@/const/admin/faq';

jest.mock('@/components/admin/input-groups/multi-select-input-group/MultiSelectInputGroup', () => ({
    MultiSelectInputGroup: (props: any) => {
        // Call getOptionId and getOptionName to cover those lines
        if (props.options && props.options.length > 0) {
            props.getOptionId(props.options[0]);
            props.getOptionName(props.options[0]);
        }
        return (
            <div data-testid="multi-select-input-group">
                <input
                    data-testid="pages-input"
                    value={props.value.map((p: any) => p.title).join(',')}
                    onChange={(e) => props.onChange([{ id: 1, title: e.target.value, slug: 'slug' }])}
                    onBlur={props.onBlur}
                    disabled={props.disabled}
                />
                {props.error && <span data-testid="pages-error">{props.error}</span>}
            </div>
        );
    },
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: (props: any) => (
        <div data-testid="input-with-char-limit">
            <input
                data-testid="question-input"
                value={props.value}
                onChange={props.onChange}
                onBlur={props.onBlur}
                disabled={props.disabled}
            />
            {props.error && <span data-testid="question-error">{props.error}</span>}
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: (props: any) => (
            <div data-testid="textarea-with-char-limit">
                <textarea
                    data-testid="answer-input"
                    value={props.value}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    disabled={props.disabled}
                />
                {props.error && <span data-testid="answer-error">{props.error}</span>}
            </div>
        ),
    }),
);

const mockPages = [
    { id: 1, title: 'Page 1', slug: 'page-1' },
    { id: 2, title: 'Page 2', slug: 'page-2' },
];

describe('FaqForm', () => {
    it('renders all fields', () => {
        render(<FaqForm onSubmit={jest.fn()} pages={mockPages} />);
        expect(screen.getByTestId('multi-select-input-group')).toBeInTheDocument();
        expect(screen.getByTestId('input-with-char-limit')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-with-char-limit')).toBeInTheDocument();
    });

    it('calls onChange for question, answer, and pages', () => {
        render(<FaqForm onSubmit={jest.fn()} pages={mockPages} />);
        fireEvent.change(screen.getByTestId('question-input'), { target: { value: 'New question' } });
        fireEvent.blur(screen.getByTestId('question-input'));
        fireEvent.change(screen.getByTestId('answer-input'), { target: { value: 'New answer' } });
        fireEvent.blur(screen.getByTestId('answer-input'));
        fireEvent.change(screen.getByTestId('pages-input'), { target: { value: 'Page 1' } });
        fireEvent.blur(screen.getByTestId('pages-input'));
        expect(screen.getByTestId('question-input')).toHaveValue('New question');
        expect(screen.getByTestId('answer-input')).toHaveValue('New answer');
        expect(screen.getByTestId('pages-input')).toHaveValue('Page 1');
    });

    it('disables fields when isFormDisabled is true', () => {
        render(<FaqForm onSubmit={jest.fn()} pages={mockPages} isFormDisabled={true} />);
        expect(screen.getByTestId('question-input')).toBeDisabled();
        expect(screen.getByTestId('answer-input')).toBeDisabled();
        expect(screen.getByTestId('pages-input')).toBeDisabled();
    });

    it('shows errors when provided', () => {
        const initialData = { questionText: '', answerText: '', pages: [] };
        render(<FaqForm onSubmit={jest.fn()} initialData={initialData} pages={mockPages} />);
        fireEvent.blur(screen.getByTestId('question-input'));
        fireEvent.blur(screen.getByTestId('answer-input'));
        fireEvent.blur(screen.getByTestId('pages-input'));
        // Error spans should be present if validation fails
        expect(screen.getByTestId('question-error')).toBeInTheDocument();
        expect(screen.getByTestId('answer-error')).toBeInTheDocument();
        expect(screen.getByTestId('pages-error')).toBeInTheDocument();
    });

    it('allows saving a draft without an answer', () => {
        const ref = createRef<FaqFormRef>();

        render(
            <FaqForm
                ref={ref}
                onSubmit={jest.fn()}
                initialData={{
                    questionText: 'Valid question',
                    answerText: '',
                    pages: mockPages,
                }}
            />,
        );

        expect(ref.current?.isValid(false)).toBe(true);
    });

    it('requires an answer when publishing', () => {
        const ref = createRef<FaqFormRef>();

        render(
            <FaqForm
                ref={ref}
                onSubmit={jest.fn()}
                initialData={{
                    questionText: 'Valid question',
                    answerText: '',
                    pages: mockPages,
                }}
            />,
        );

        expect(ref.current?.isValid(true)).toBe(false);
    });

    it('allows publishing when all fields are valid', () => {
        const ref = createRef<FaqFormRef>();

        render(
            <FaqForm
                ref={ref}
                onSubmit={jest.fn()}
                initialData={{
                    questionText: 'Valid question',
                    answerText: 'A'.repeat(FAQ_VALIDATION.answer.min),
                    pages: mockPages,
                }}
            />,
        );

        expect(ref.current?.isValid(true)).toBe(true);
    });

    it('requires question and pages when saving a draft', () => {
        const ref = createRef<FaqFormRef>();

        render(
            <FaqForm
                ref={ref}
                onSubmit={jest.fn()}
                initialData={{
                    questionText: '',
                    answerText: '',
                    pages: [],
                }}
            />,
        );

        expect(ref.current?.isValid(false)).toBe(false);
    });

    it('keeps question validation error until the input becomes valid', () => {
        render(<FaqForm onSubmit={jest.fn()} pages={mockPages} />);

        const questionInput = screen.getByTestId('question-input');

        fireEvent.blur(questionInput);
        expect(screen.getByTestId('question-error')).toBeInTheDocument();

        fireEvent.change(questionInput, { target: { value: 'A' } });
        expect(screen.getByTestId('question-error')).toBeInTheDocument();

        fireEvent.change(questionInput, {
            target: { value: 'A'.repeat(FAQ_VALIDATION.question.min) },
        });
        expect(screen.queryByTestId('question-error')).not.toBeInTheDocument();
    });

    it('keeps answer validation error until the input becomes valid', () => {
        render(<FaqForm onSubmit={jest.fn()} pages={mockPages} />);

        const answerInput = screen.getByTestId('answer-input');

        fireEvent.blur(answerInput);
        expect(screen.getByTestId('answer-error')).toBeInTheDocument();

        fireEvent.change(answerInput, { target: { value: 'A' } });
        expect(screen.getByTestId('answer-error')).toBeInTheDocument();

        fireEvent.change(answerInput, {
            target: { value: 'A'.repeat(FAQ_VALIDATION.answer.min) },
        });
        expect(screen.queryByTestId('answer-error')).not.toBeInTheDocument();
    });
});
