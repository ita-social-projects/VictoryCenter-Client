import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { TranslateDisclaimerForm } from './TranslateDisclaimerForm';

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ id, value, onChange, onBlur, disabled, error }: any) => (
            <>
                <textarea
                    data-testid={id}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled ?? false}
                />
                {error && <span data-testid={`${id}-error`}>{error}</span>}
            </>
        ),
    }),
);

const DESCRIPTION_INPUT = 'translate-disclaimer-description';
const REQUIRED_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
const MIN_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.min);
const MAX_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max);

describe('TranslateDisclaimerForm', () => {
    it('renders description textarea', () => {
        render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

        expect(screen.getByTestId(DESCRIPTION_INPUT)).toBeInTheDocument();
    });

    it('renders with empty value by default', () => {
        render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

        expect(screen.getByTestId(DESCRIPTION_INPUT)).toHaveValue('');
    });

    it('pre-fills description when initialData is provided', () => {
        render(
            <TranslateDisclaimerForm onSubmit={jest.fn()} initialData={{ description: 'Pre-filled description' }} />,
        );

        expect(screen.getByTestId(DESCRIPTION_INPUT)).toHaveValue('Pre-filled description');
    });

    it('disables textarea when formDisabled is true', () => {
        render(<TranslateDisclaimerForm onSubmit={jest.fn()} formDisabled={true} />);

        expect(screen.getByTestId(DESCRIPTION_INPUT)).toBeDisabled();
    });

    it('textarea is enabled by default', () => {
        render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

        expect(screen.getByTestId(DESCRIPTION_INPUT)).not.toBeDisabled();
    });

    it('normalizes consecutive spaces on change', () => {
        render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

        fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'hello  world' } });

        expect(screen.getByTestId(DESCRIPTION_INPUT)).toHaveValue('hello world');
    });

    it('trims and normalizes text on blur', () => {
        render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

        fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: '  hello   world  ' } });
        fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));

        expect(screen.getByTestId(DESCRIPTION_INPUT)).toHaveValue('hello world');
    });

    describe('validation', () => {
        it('shows required error on blur when description is empty', () => {
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

            fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));

            expect(screen.getByTestId(`${DESCRIPTION_INPUT}-error`)).toHaveTextContent(REQUIRED_ERROR);
        });

        it('shows required error on blur when description is only whitespace', () => {
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: '   ' } });
            fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));

            expect(screen.getByTestId(`${DESCRIPTION_INPUT}-error`)).toHaveTextContent(REQUIRED_ERROR);
        });

        it('shows min length error on blur when description is too short', () => {
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'a' } });
            fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));

            expect(screen.getByTestId(`${DESCRIPTION_INPUT}-error`)).toHaveTextContent(MIN_ERROR);
        });

        it('shows max length error on blur when description is too long', () => {
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

            const longText = 'a'.repeat(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max + 1);
            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: longText } });
            fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));

            expect(screen.getByTestId(`${DESCRIPTION_INPUT}-error`)).toHaveTextContent(MAX_ERROR);
        });

        it('clears error when description becomes valid on re-blur', () => {
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'a' } });
            fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));
            expect(screen.getByTestId(`${DESCRIPTION_INPUT}-error`)).toBeInTheDocument();

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'Valid description text' } });
            fireEvent.blur(screen.getByTestId(DESCRIPTION_INPUT));
            expect(screen.queryByTestId(`${DESCRIPTION_INPUT}-error`)).not.toBeInTheDocument();
        });

        it('does not show error before blur', () => {
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} />);

            expect(screen.queryByTestId(`${DESCRIPTION_INPUT}-error`)).not.toBeInTheDocument();
        });
    });

    describe('onValidationChange', () => {
        it('reports valid when description is valid', () => {
            const onValidationChange = jest.fn();
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} onValidationChange={onValidationChange} />);

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), {
                target: { value: 'Valid description text' },
            });

            expect(onValidationChange).toHaveBeenLastCalledWith(true);
        });

        it('reports invalid when description is empty', () => {
            const onValidationChange = jest.fn();
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} onValidationChange={onValidationChange} />);

            expect(onValidationChange).toHaveBeenLastCalledWith(false);
        });

        it('reports invalid when description is too short', () => {
            const onValidationChange = jest.fn();
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} onValidationChange={onValidationChange} />);

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'a' } });

            expect(onValidationChange).toHaveBeenLastCalledWith(false);
        });

        it('reports invalid when description exceeds max length', () => {
            const onValidationChange = jest.fn();
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} onValidationChange={onValidationChange} />);

            const longText = 'a'.repeat(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max + 1);
            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: longText } });

            expect(onValidationChange).toHaveBeenLastCalledWith(false);
        });
    });

    describe('onDirtyChange', () => {
        it('reports dirty when description is changed from empty default', () => {
            const onDirtyChange = jest.fn();
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} onDirtyChange={onDirtyChange} />);

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'some text' } });

            expect(onDirtyChange).toHaveBeenLastCalledWith(true);
        });

        it('reports not dirty when description matches initialData', () => {
            const onDirtyChange = jest.fn();
            render(
                <TranslateDisclaimerForm
                    onSubmit={jest.fn()}
                    initialData={{ description: 'existing text' }}
                    onDirtyChange={onDirtyChange}
                />,
            );

            fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), { target: { value: 'existing text' } });

            expect(onDirtyChange).toHaveBeenLastCalledWith(false);
        });

        it('reports not dirty on initial render with no initialData', () => {
            const onDirtyChange = jest.fn();
            render(<TranslateDisclaimerForm onSubmit={jest.fn()} onDirtyChange={onDirtyChange} />);

            expect(onDirtyChange).toHaveBeenLastCalledWith(false);
        });
    });

    it('calls onSubmit with form values when submitted via ref', async () => {
        const onSubmit = jest.fn();
        const ref = { current: null as any };

        render(<TranslateDisclaimerForm ref={ref} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByTestId(DESCRIPTION_INPUT), {
            target: { value: 'Valid description text' },
        });

        await waitFor(() => {
            if (ref.current?.isValid()) {
                ref.current.submit();
            }
        });

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ description: 'Valid description text' }));
    });

    it('does not call onSubmit when description is invalid', async () => {
        const onSubmit = jest.fn();
        const ref = { current: null as any };

        render(<TranslateDisclaimerForm ref={ref} onSubmit={onSubmit} />);

        await waitFor(() => {
            ref.current?.submit();
        });

        await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    });
});
