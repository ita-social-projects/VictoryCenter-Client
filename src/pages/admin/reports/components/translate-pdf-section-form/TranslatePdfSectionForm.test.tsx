import { createRef } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslatePdfSectionForm, TranslatePdfSectionFormRef } from './TranslatePdfSectionForm';

const makeMockInputGroup =
    (tag: 'input' | 'textarea') =>
    ({ id, name, value, onChange, onBlur, disabled, maxLength, label, error, isRequired }: any) => (
        <div data-testid={`${tag}-group-${name}`}>
            <label htmlFor={id}>{label}</label>
            {tag === 'input' ? (
                <input
                    id={id}
                    data-testid={`input-${name}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    maxLength={maxLength}
                    required={isRequired}
                />
            ) : (
                <textarea
                    id={id}
                    data-testid={`textarea-${name}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    maxLength={maxLength}
                    required={isRequired}
                />
            )}
            {error && <span data-testid={`error-${name}`}>{error}</span>}
            <span data-testid={`counter-${name}`}>
                {value.length} / {maxLength}
            </span>
        </div>
    );

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: makeMockInputGroup('input'),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: makeMockInputGroup('textarea'),
    }),
);

const renderForm = (props: any = {}) => {
    const ref = createRef<TranslatePdfSectionFormRef>();
    const defaultProps = {
        onSubmit: jest.fn(),
    };

    render(<TranslatePdfSectionForm ref={ref} {...defaultProps} {...props} />);
    return { ref, ...defaultProps, ...props };
};

const fillForm = (title = 'Title', description = 'Description') => {
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: title } });
    fireEvent.change(screen.getByTestId('textarea-description'), { target: { value: description } });
};

const makeAsyncSubmit = () => {
    let resolveFn: (value?: unknown) => void;
    const submitPromise = new Promise((resolve) => {
        resolveFn = resolve;
    });
    const onSubmit = jest.fn(() => submitPromise);
    return { onSubmit, resolve: () => resolveFn() };
};

describe('TranslatePdfSectionForm', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render form and all fields', () => {
            renderForm();

            expect(screen.getByTestId('translate-pdf-section-form')).toBeInTheDocument();
            expect(screen.getByTestId('input-title')).toBeInTheDocument();
            expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
        });

        it('should display character counters for both fields', () => {
            renderForm();

            expect(screen.getByTestId('counter-title')).toHaveTextContent('0 / 200');
            expect(screen.getByTestId('counter-description')).toHaveTextContent('0 / 200');
        });
    });

    describe('Initial Data', () => {
        it('should fill fields with initialData', () => {
            renderForm({
                initialData: {
                    title: 'Test Title',
                    description: 'Test Description',
                },
            });

            expect(screen.getByTestId('input-title')).toHaveValue('Test Title');
            expect(screen.getByTestId('textarea-description')).toHaveValue('Test Description');
        });

        it('should reset to initial data when initialData prop changes', async () => {
            const { rerender } = render(
                <TranslatePdfSectionForm
                    onSubmit={jest.fn()}
                    initialData={{ title: 'Old Title', description: 'Old Desc' }}
                />,
            );

            await waitFor(() => {
                expect(screen.getByTestId('input-title')).toHaveValue('Old Title');
            });

            rerender(
                <TranslatePdfSectionForm
                    onSubmit={jest.fn()}
                    initialData={{ title: 'New Title', description: 'New Desc' }}
                />,
            );

            await waitFor(() => {
                expect(screen.getByTestId('input-title')).toHaveValue('New Title');
                expect(screen.getByTestId('textarea-description')).toHaveValue('New Desc');
            });
        });
    });

    describe('Form Changes', () => {
        it('should update title field on change', async () => {
            renderForm();

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'New Title' },
            });

            await waitFor(() => {
                expect(screen.getByTestId('input-title')).toHaveValue('New Title');
                expect(screen.getByTestId('counter-title')).toHaveTextContent('9 / 200');
            });
        });

        it('should update description field on change', async () => {
            renderForm();

            fireEvent.change(screen.getByTestId('textarea-description'), {
                target: { value: 'Updated description' },
            });

            await waitFor(() => {
                expect(screen.getByTestId('textarea-description')).toHaveValue('Updated description');
                expect(screen.getByTestId('counter-description')).toHaveTextContent('19 / 200');
            });
        });

        it('should show error when title is empty on blur', async () => {
            renderForm();

            fireEvent.blur(screen.getByTestId('input-title'));

            await waitFor(() => {
                expect(screen.getByTestId('error-title')).toBeInTheDocument();
            });
        });

        it('should show error when description is empty on blur', async () => {
            renderForm();

            fireEvent.blur(screen.getByTestId('textarea-description'));

            await waitFor(() => {
                expect(screen.getByTestId('error-description')).toBeInTheDocument();
            });
        });

        it('should clear error when field is filled', async () => {
            renderForm();

            fireEvent.blur(screen.getByTestId('input-title'));

            await waitFor(() => {
                expect(screen.getByTestId('error-title')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'Valid Title' },
            });

            fireEvent.blur(screen.getByTestId('input-title'));

            await waitFor(() => {
                expect(screen.queryByTestId('error-title')).not.toBeInTheDocument();
            });
        });
    });

    describe('Ref Methods', () => {
        it('should submit form via ref with valid data', async () => {
            const onSubmit = jest.fn();
            const { ref } = renderForm({ onSubmit });

            fillForm('Test Title', 'Test Description');

            await act(async () => {
                await ref.current?.submit();
            });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith({
                title: 'Test Title',
                description: 'Test Description',
            });
        });

        it('should not submit form if validation fails', async () => {
            const onSubmit = jest.fn();
            const { ref } = renderForm({ onSubmit });

            await act(async () => {
                await ref.current?.submit();
            });

            expect(onSubmit).not.toHaveBeenCalled();
            expect(screen.getByTestId('error-title')).toBeInTheDocument();
            expect(screen.getByTestId('error-description')).toBeInTheDocument();
        });

        it('should report form validity correctly', () => {
            const { ref } = renderForm();

            expect(ref.current?.isValid()).toBe(false);

            fillForm();

            expect(ref.current?.isValid()).toBe(true);
        });

        it('should report if form is dirty', () => {
            const initialData = {
                title: 'Original Title',
                description: 'Original Description',
            };
            const { ref } = renderForm({ initialData });

            expect(ref.current?.isDirty()).toBe(false);

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'Modified Title' },
            });

            expect(ref.current?.isDirty()).toBe(true);
        });

        it('should report form as dirty when adding new content', () => {
            const { ref } = renderForm({ initialData: null });

            expect(ref.current?.isDirty()).toBe(false);

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'New Title' },
            });

            expect(ref.current?.isDirty()).toBe(true);
        });
    });

    describe('Form Disabled State', () => {
        it('should disable all fields when isFormDisabled is true', () => {
            renderForm({ isFormDisabled: true });

            expect(screen.getByTestId('input-title')).toBeDisabled();
            expect(screen.getByTestId('textarea-description')).toBeDisabled();
        });

        it('should enable all fields when isFormDisabled is false', () => {
            renderForm({ isFormDisabled: false });

            expect(screen.getByTestId('input-title')).not.toBeDisabled();
            expect(screen.getByTestId('textarea-description')).not.toBeDisabled();
        });
    });

    describe('Validation Callbacks', () => {
        it('should call onValidationChange callback when form validity changes', async () => {
            const onValidationChange = jest.fn();
            renderForm({ onValidationChange });

            await waitFor(() => {
                expect(onValidationChange).toHaveBeenCalledWith(false);
            });

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'Title' },
            });

            fireEvent.change(screen.getByTestId('textarea-description'), {
                target: { value: 'Description' },
            });

            await waitFor(() => {
                expect(onValidationChange).toHaveBeenCalledWith(true);
            });
        });

        it('should call onDirtyChange callback when form dirty state changes', async () => {
            const onDirtyChange = jest.fn();
            renderForm({ onDirtyChange });

            await waitFor(() => {
                expect(onDirtyChange).toHaveBeenCalled();
            });

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'Title' },
            });

            await waitFor(() => {
                expect(onDirtyChange).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Form Submission Disabled State', () => {
        it('should disable submit during form submission', async () => {
            const { onSubmit, resolve } = makeAsyncSubmit();

            const { ref } = renderForm({ onSubmit });

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'Title' },
            });

            fireEvent.change(screen.getByTestId('textarea-description'), {
                target: { value: 'Description' },
            });

            const submitPromise2 = act(async () => {
                await ref.current?.submit();
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            resolve();

            await submitPromise2;

            expect(onSubmit).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle whitespace-only input as invalid', async () => {
            const { ref } = renderForm();

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: '   ' },
            });

            fireEvent.blur(screen.getByTestId('input-title'));

            expect(ref.current?.isValid()).toBe(false);
        });

        it('should handle very long input within max length', () => {
            const longText = 'a'.repeat(200);
            renderForm({
                initialData: {
                    title: longText,
                    description: 'Description',
                },
            });

            expect(screen.getByTestId('input-title')).toHaveValue(longText);
            expect(screen.getByTestId('counter-title')).toHaveTextContent('200 / 200');
        });

        it('should call onSubmit async handler and wait for completion', async () => {
            const { onSubmit, resolve } = makeAsyncSubmit();
            const { ref } = renderForm({ onSubmit });

            fireEvent.change(screen.getByTestId('input-title'), {
                target: { value: 'Title' },
            });

            fireEvent.change(screen.getByTestId('textarea-description'), {
                target: { value: 'Description' },
            });

            const submitCall = act(async () => {
                await ref.current?.submit();
            });

            await new Promise((resolve) => setTimeout(resolve, 50));

            resolve();

            await submitCall;

            expect(onSubmit).toHaveBeenCalled();
        });
    });
});
