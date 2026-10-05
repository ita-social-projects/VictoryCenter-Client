import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    TranslateHistorySectionForm,
    TranslateHistorySectionFormProps,
    TranslateHistorySectionFormRef,
    TranslateHistorySectionFormValues,
    TranslateHistorySectionFormErrorState,
} from './TranslateHistorySectionForm';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import {
    HISTORY_TRANSLATION_VALIDATION,
    HISTORY_TRANSLATION_VALIDATION_FUNCTIONS,
    HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS,
} from '@/validation/admin/history-translation-schema/history-translation-schema';
const mockUseFormManager = jest.fn();

jest.mock('@/hooks/admin/use-form-manager/useFormManager', () => ({
    useFormManager: (...args: unknown[]) => mockUseFormManager(...args),
}));

jest.mock('@/validation/admin/history-translation-schema/history-translation-schema', () => ({
    HISTORY_TRANSLATION_VALIDATION: {
        title: { max: 100 },
        description: { max: 600 },
    },
    HISTORY_TRANSLATION_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateDescription: jest.fn(),
    },
    HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateDescription: jest.fn(),
    },
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({
        label,
        value,
        onChange,
        onBlur,
        id,
        name,
        maxLength,
        placeholder,
        className,
        error,
        disabled,
    }: {
        label: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
        id: string;
        name?: string;
        maxLength: number;
        placeholder?: string;
        className?: string;
        error?: string;
        disabled?: boolean;
    }) => (
        <div data-testid={`input-group-${id}`} className={className} data-error={error || ''}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                maxLength={maxLength}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    ),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            value,
            onChange,
            onBlur,
            id,
            name,
            maxLength,
            rows,
            autoGrow,
            error,
            disabled,
            placeholder,
        }: {
            label: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
            id: string;
            name?: string;
            maxLength: number;
            rows?: number;
            autoGrow?: boolean;
            error?: string;
            placeholder?: string;
            disabled?: boolean;
        }) => (
            <div data-testid={`textarea-group-${id}`} data-error={error || ''} data-auto-grow={String(!!autoGrow)}>
                <label htmlFor={id}>{label}</label>
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    rows={rows}
                    disabled={disabled}
                    placeholder={placeholder}
                />
            </div>
        ),
    }),
);

type FormManagerOptions = {
    defaultFormState: TranslateHistorySectionFormValues;
    initialData: TranslateHistorySectionFormValues | null;
    validateForm: (state: TranslateHistorySectionFormValues) => TranslateHistorySectionFormErrorState;
    onValidationChange?: (isValid: boolean) => void;
    ref: React.Ref<TranslateHistorySectionFormRef>;
    onSubmit: (data: TranslateHistorySectionFormValues) => void | Promise<void>;
};

type FormManagerOverrides = {
    errors?: TranslateHistorySectionFormErrorState;
    isSubmitting?: boolean;
};

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

const TITLE_LABEL = '*Заголовок';
const DESCRIPTION_LABEL = '*Опис';

const validateTitleMock = HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateTitle as jest.Mock;
const validateDescriptionMock = HISTORY_TRANSLATION_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;
const blurValidateTitleMock = HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateTitle as jest.Mock;
const blurValidateDescriptionMock = HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;

const defaultProps: TranslateHistorySectionFormProps = {
    onSubmit: jest.fn(),
};

const setupFormManager = ({ errors: errorOverrides, isSubmitting = false }: FormManagerOverrides = {}) => {
    mockUseFormManager.mockImplementation((options: FormManagerOptions) => {
        const [formState, setFormState] = React.useState<TranslateHistorySectionFormValues>(
            options.initialData ?? options.defaultFormState,
        );
        const [errors, setErrors] = React.useState<TranslateHistorySectionFormErrorState>({});

        return {
            formState,
            setFormState,
            errors: { ...errors, ...errorOverrides },
            setErrors,
            isSubmitting,
        };
    });
};

type RenderFormProps = Partial<TranslateHistorySectionFormProps> & React.RefAttributes<TranslateHistorySectionFormRef>;

const renderForm = (props: RenderFormProps = {}, managerOverrides: FormManagerOverrides = {}) => {
    setupFormManager(managerOverrides);
    return render(<TranslateHistorySectionForm {...defaultProps} {...props} />);
};

const getManagerOptions = (): FormManagerOptions => mockUseFormManager.mock.calls[0][0];

const getForm = () => screen.getByTestId('translate-history-section-form');
const getTitleInput = () => screen.getByLabelText(TITLE_LABEL) as HTMLInputElement;
const getDescriptionTextarea = () => screen.getByLabelText(DESCRIPTION_LABEL) as HTMLTextAreaElement;
const getTitleGroup = () => screen.getByTestId('input-group-history-translation-title');
const getDescriptionGroup = () => screen.getByTestId('textarea-group-history-translation-description');

const typeInto = (element: FieldElement, value: string) => fireEvent.change(element, { target: { value } });

const FIELDS = [
    {
        name: 'title',
        getElement: getTitleInput,
        getGroup: getTitleGroup,
        changeValidator: validateTitleMock,
        blurValidator: blurValidateTitleMock,
        otherGetElement: getDescriptionTextarea,
    },
    {
        name: 'description',
        getElement: getDescriptionTextarea,
        getGroup: getDescriptionGroup,
        changeValidator: validateDescriptionMock,
        blurValidator: blurValidateDescriptionMock,
        otherGetElement: getTitleInput,
    },
] as const;

describe('TranslateHistorySectionForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        [validateTitleMock, validateDescriptionMock, blurValidateTitleMock, blurValidateDescriptionMock].forEach(
            (mock) => mock.mockReturnValue(undefined),
        );
    });

    describe('Rendering', () => {
        it('renders the form with title input and description textarea', () => {
            renderForm();

            expect(getForm()).toBeInTheDocument();
            expect(getForm()).toHaveAttribute('novalidate');
            expect(getTitleInput()).toBeInTheDocument();
            expect(getDescriptionTextarea()).toBeInTheDocument();
        });

        it('passes placeholders, limits, names and row settings to the fields', () => {
            renderForm();

            expect(getTitleInput()).toHaveAttribute('name', 'title');
            expect(getTitleInput()).toHaveAttribute('placeholder', SECTIONS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER);
            expect(getTitleInput()).toHaveAttribute('maxLength', String(HISTORY_TRANSLATION_VALIDATION.title.max));

            expect(getDescriptionTextarea()).toHaveAttribute('name', 'description');
            expect(getDescriptionTextarea()).toHaveAttribute(
                'placeholder',
                SECTIONS_TEXT.SECTION.FORM.DESCRIPTION.PLACEHOLDER,
            );
            expect(getDescriptionTextarea()).toHaveAttribute(
                'maxLength',
                String(HISTORY_TRANSLATION_VALIDATION.description.max),
            );
            expect(getDescriptionTextarea()).toHaveAttribute('rows', '5');
        });

        it('enables auto-grow on the description textarea', () => {
            renderForm();

            expect(getDescriptionGroup()).toHaveAttribute('data-auto-grow', 'true');
        });

        it('applies the title-input class to the title group', () => {
            renderForm();

            expect(getTitleGroup()).toHaveClass('title-input');
        });

        it('renders empty fields when there is no initial data', () => {
            renderForm({ initialData: null });

            expect(getTitleInput()).toHaveValue('');
            expect(getDescriptionTextarea()).toHaveValue('');
        });

        it('renders initial data in the fields', () => {
            renderForm({ initialData: { title: 'Initial title', description: 'Initial description' } });

            expect(getTitleInput()).toHaveValue('Initial title');
            expect(getDescriptionTextarea()).toHaveValue('Initial description');
        });

        it('does not apply the stacked class by default', () => {
            renderForm();

            expect(getForm()).toHaveClass('form');
            expect(getForm()).not.toHaveClass('form--stacked');
        });

        it('applies the stacked class when stacked is true', () => {
            renderForm({ stacked: true });

            expect(getForm()).toHaveClass('form', 'form--stacked');
        });
    });

    describe('Form submit', () => {
        it('prevents the native form submission', () => {
            renderForm();

            expect(fireEvent.submit(getForm())).toBe(false);
        });
    });

    describe('useFormManager integration', () => {
        it('passes default state, initial data, ref and validation callback to the hook', () => {
            const onValidationChange = jest.fn();
            const ref = React.createRef<TranslateHistorySectionFormRef>();
            const initialData = { title: 'T', description: 'D' };

            renderForm({ initialData, onValidationChange, ref });

            const options = getManagerOptions();
            expect(options.defaultFormState).toEqual({ title: '', description: '' });
            expect(options.initialData).toEqual(initialData);
            expect(options.onValidationChange).toBe(onValidationChange);
            expect(options.ref).toBe(ref);
        });

        it('passes null initial data by default', () => {
            renderForm();

            expect(getManagerOptions().initialData).toBeNull();
        });

        it('validateForm uses blur validators for both fields', () => {
            blurValidateTitleMock.mockReturnValue('title-error');
            blurValidateDescriptionMock.mockReturnValue('description-error');
            renderForm();

            const result = getManagerOptions().validateForm({ title: 'T', description: 'D' });

            expect(blurValidateTitleMock).toHaveBeenCalledWith('T');
            expect(blurValidateDescriptionMock).toHaveBeenCalledWith('D');
            expect(result).toEqual({ title: 'title-error', description: 'description-error' });
        });

        it('delegates onSubmit to the provided handler with the form data', async () => {
            const onSubmit = jest.fn().mockResolvedValue(undefined);
            const data = { title: 'T', description: 'D' };
            renderForm({ onSubmit });

            await getManagerOptions().onSubmit(data);

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith(data);
        });
    });

    describe.each(FIELDS)(
        '$name field',
        ({ name, getElement, getGroup, changeValidator, blurValidator, otherGetElement }) => {
            it('updates the value on change', () => {
                renderForm();

                typeInto(getElement(), 'Hello');

                expect(getElement()).toHaveValue('Hello');
                expect(otherGetElement()).toHaveValue('');
            });

            it('collapses repeated whitespace and trims leading spaces on change', () => {
                renderForm();

                typeInto(getElement(), '   Hello    big   world');

                expect(getElement()).toHaveValue('Hello big world');
            });

            it('runs the change validator with the normalised value and shows its error', () => {
                changeValidator.mockReturnValue('change-error');
                renderForm();

                typeInto(getElement(), '  Hello   world');

                expect(changeValidator).toHaveBeenCalledWith('Hello world');
                expect(blurValidator).not.toHaveBeenCalled();
                expect(getGroup()).toHaveAttribute('data-error', 'change-error');
            });

            it('trims trailing spaces on blur', () => {
                renderForm();
                typeInto(getElement(), 'Hello   ');
                expect(getElement()).toHaveValue('Hello ');

                fireEvent.blur(getElement());

                expect(getElement()).toHaveValue('Hello');
            });

            it('runs the blur validator with the trimmed value and shows its error', () => {
                blurValidator.mockReturnValue('blur-error');
                renderForm();
                typeInto(getElement(), 'Hello ');

                fireEvent.blur(getElement());

                expect(blurValidator).toHaveBeenCalledWith('Hello');
                expect(getGroup()).toHaveAttribute('data-error', 'blur-error');
            });

            it('clears the error when the validator returns nothing', () => {
                changeValidator.mockReturnValueOnce('change-error');
                renderForm();
                typeInto(getElement(), 'a');
                expect(getGroup()).toHaveAttribute('data-error', 'change-error');

                typeInto(getElement(), 'ab');

                expect(getGroup()).toHaveAttribute('data-error', '');
            });

            it('shows the error provided by the form manager', () => {
                renderForm({}, { errors: { [name]: 'manager-error' } });

                expect(getGroup()).toHaveAttribute('data-error', 'manager-error');
            });
        },
    );

    describe('Disabled state', () => {
        it.each([
            ['formDisabled is true', { formDisabled: true }, { isSubmitting: false }],
            ['the form is submitting', {}, { isSubmitting: true }],
            ['both formDisabled and isSubmitting are true', { formDisabled: true }, { isSubmitting: true }],
        ])('disables both fields when %s', (_label, props, managerOverrides) => {
            renderForm(props, managerOverrides);

            expect(getTitleInput()).toBeDisabled();
            expect(getDescriptionTextarea()).toBeDisabled();
        });

        it('keeps both fields enabled by default', () => {
            renderForm();

            expect(getTitleInput()).toBeEnabled();
            expect(getDescriptionTextarea()).toBeEnabled();
        });
    });

    describe('Dirty tracking', () => {
        const initialData = { title: 'Title', description: 'Description' };

        it('reports not dirty on first render with initial data', () => {
            const onDirtyChange = jest.fn();

            renderForm({ initialData, onDirtyChange });

            expect(onDirtyChange).toHaveBeenLastCalledWith(false);
        });

        it('reports not dirty on first render without initial data', () => {
            const onDirtyChange = jest.fn();

            renderForm({ initialData: null, onDirtyChange });

            expect(onDirtyChange).toHaveBeenLastCalledWith(false);
        });

        it.each([
            ['title', getTitleInput],
            ['description', getDescriptionTextarea],
        ])('reports dirty after the %s changes and clean after it is restored', (_name, getElement) => {
            const onDirtyChange = jest.fn();
            renderForm({ initialData, onDirtyChange });
            const original = getElement().value;

            typeInto(getElement(), `${original} changed`);
            expect(onDirtyChange).toHaveBeenLastCalledWith(true);

            typeInto(getElement(), original);
            expect(onDirtyChange).toHaveBeenLastCalledWith(false);
        });

        it('reports dirty when a field is filled and no initial data exists', () => {
            const onDirtyChange = jest.fn();
            renderForm({ initialData: null, onDirtyChange });

            typeInto(getTitleInput(), 'New');

            expect(onDirtyChange).toHaveBeenLastCalledWith(true);
        });

        it('does not throw when onDirtyChange is not provided', () => {
            renderForm({ initialData });

            expect(() => typeInto(getTitleInput(), 'Changed')).not.toThrow();
        });
    });
});
