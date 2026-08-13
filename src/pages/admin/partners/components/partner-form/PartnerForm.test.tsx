import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerForm, PartnerFormValues, PartnerFormErrors } from './PartnerForm';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { PARTNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { InputErrorProps } from '@/components/admin/input-error/InputError';
import { ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { TextAreaWithCharacterLimitGroupProps } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';

jest.mock('@/components/admin/input-error/InputError', () => ({
    InputError: ({ error }: InputErrorProps) => (error ? <div data-testid="input-error">{error}</div> : null),
}));

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ onChange, setError, disabled, id, label }: ImageInputProps) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <button
                type="button"
                data-testid={`${id}-change`}
                onClick={() =>
                    onChange({
                        base64: 'new-base64-image',
                        mimeType: 'image/png',
                    })
                }
                disabled={disabled}
            >
                Change Image
            </button>
            <button type="button" data-testid={`${id}-remove`} onClick={() => onChange(null)} disabled={disabled}>
                Remove Image
            </button>
            <button
                type="button"
                data-testid={`${id}-set-error`}
                onClick={() => setError('Test image error')}
                disabled={disabled}
            >
                Set Error
            </button>
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
            disabled,
            name,
            id,
            placeholder,
            error,
        }: TextAreaWithCharacterLimitGroupProps) => (
            <label htmlFor={id}>
                <span>{label}</span>
                <textarea
                    data-testid={`${id}-textarea`}
                    id={id}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    name={name}
                />
                {error && <div data-testid={`${id}-error`}>{error}</div>}
            </label>
        ),
    }),
);

jest.mock('@/validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_VALIDATION_FUNCTIONS: {
        validateDescription: jest.fn(),
    },
}));

const mockValidateDescription = PARTNER_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;

const defaultValues: PartnerFormValues = {
    localId: 'local-1',
    partnerId: 1,
    description: 'Existing description',
    image: {
        id: 10,
        url: 'image.jpg',
        mimeType: 'image/jpeg',
    },
    imageId: 10,
};

const defaultErrors: PartnerFormErrors = {
    description: undefined,
    image: undefined,
};

const cardHtmlId = defaultValues.localId;
const descriptionTestId = `partner-form-description-${cardHtmlId}`;
const imageTestId = `partner-form-image-${cardHtmlId}`;

const UK_LANGUAGE = { id: 1, code: 'uk', name: 'Ukrainian' };
const EN_LANGUAGE = { id: 2, code: 'en', name: 'English' };

describe('PartnerForm', () => {
    let onValuesChange: jest.Mock;
    let onDelete: jest.Mock;

    const getDescriptionTextarea = () => screen.getByTestId(`${descriptionTestId}-textarea`);
    const getImageChangeButton = () => screen.getByTestId(`${imageTestId}-change`);
    const getImageRemoveButton = () => screen.getByTestId(`${imageTestId}-remove`);
    const getImageSetErrorButton = () => screen.getByTestId(`${imageTestId}-set-error`);
    const getDeleteButton = () => screen.queryByTestId(`partner-form-delete-button-${cardHtmlId}`);
    const getDescriptionError = () => screen.queryByTestId(`${descriptionTestId}-error`);
    const getImageError = () => screen.queryByTestId('input-error');

    const changeDescription = (value: string) => {
        fireEvent.change(getDescriptionTextarea(), { target: { value } });
    };
    const clickImageChange = () => fireEvent.click(getImageChangeButton());
    const clickImageRemove = () => fireEvent.click(getImageRemoveButton());
    const clickImageSetError = () => fireEvent.click(getImageSetErrorButton());
    const clickDelete = () => {
        const button = getDeleteButton();
        if (button) fireEvent.click(button);
    };

    const renderComponent = (props: Partial<React.ComponentProps<typeof PartnerForm>>) => {
        render(
            <PartnerForm
                values={defaultValues}
                errors={defaultErrors}
                disabled={false}
                onValuesChange={onValuesChange}
                onDelete={onDelete}
                language={UK_LANGUAGE}
                {...props}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        onValuesChange = jest.fn();
        onDelete = jest.fn();
        mockValidateDescription.mockReturnValue(undefined);
    });

    it('renders form with provided values and labels', () => {
        renderComponent({});

        expect(screen.getByTestId(`partner-form-${cardHtmlId}`)).toBeInTheDocument();
        expect(screen.getByText(PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL)).toBeInTheDocument();
        expect(screen.getByText(PARTNERS_TEXT.PARTNER.IMAGE_LABEL)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(PARTNERS_TEXT.PARTNER.DESCRIPTION_PLACEHOLDER)).toBeInTheDocument();
        expect(getDescriptionTextarea()).toHaveValue(defaultValues.description);
    });

    it('validates and propagates description changes', () => {
        const newDescription = 'Updated description';
        const validationError = 'Some description error';
        mockValidateDescription.mockReturnValueOnce(validationError);

        renderComponent({});
        changeDescription(newDescription);

        expect(mockValidateDescription).toHaveBeenCalledWith(newDescription);
        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, description: newDescription },
            { ...defaultErrors, description: validationError },
        );
    });

    it('propagates image changes from ImageInput', () => {
        renderComponent({});
        clickImageChange();

        const newImage = {
            base64: 'new-base64-image',
            mimeType: 'image/png',
        };

        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, image: newImage, imageId: null },
            { ...defaultErrors },
        );
    });

    it('clears image error on valid image change', () => {
        renderComponent({
            errors: { ...defaultErrors, image: 'Invalid image size' },
        });

        clickImageChange();

        const newImage = {
            base64: 'new-base64-image',
            mimeType: 'image/png',
        };

        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, image: newImage, imageId: null },
            { ...defaultErrors, image: undefined },
        );
    });

    it('propagates image removal from ImageInput and nullifies imageId', () => {
        renderComponent({});
        clickImageRemove();

        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, image: null, imageId: null },
            { ...defaultErrors },
        );
    });

    it('propagates image errors from ImageInput', () => {
        const errorToSet = 'Test image error';
        renderComponent({
            errors: { ...defaultErrors, image: undefined },
        });

        clickImageSetError();

        expect(onValuesChange).toHaveBeenCalledWith({ ...defaultValues }, { ...defaultErrors, image: errorToSet });
    });

    it('renders errors when provided', () => {
        const errors: PartnerFormErrors = {
            description: 'Description is required',
            image: 'Image is required',
        };

        renderComponent({ errors });

        expect(getDescriptionError()).toHaveTextContent(errors.description!);
        expect(getImageError()).toHaveTextContent(errors.image!);
    });

    it('invokes onDelete with local id', () => {
        renderComponent({});
        clickDelete();

        expect(getDeleteButton()).not.toBeNull();
        expect(onDelete).toHaveBeenCalledWith(defaultValues.localId);
    });

    it('disables all inputs when form is disabled', () => {
        renderComponent({ disabled: true });

        expect(getImageChangeButton()).toBeDisabled();
        expect(getImageRemoveButton()).toBeDisabled();
        expect(getImageSetErrorButton()).toBeDisabled();
        expect(getDescriptionTextarea()).toBeDisabled();
    });

    it('shows the translated description and disables fields when a non-base language is selected', () => {
        renderComponent({ language: EN_LANGUAGE, translatedDescription: 'Translated description' });

        expect(getDescriptionTextarea()).toHaveValue('Translated description');
        expect(getDescriptionTextarea()).toBeDisabled();
        expect(getImageChangeButton()).toBeDisabled();
        expect(getImageRemoveButton()).toBeDisabled();
        expect(getImageSetErrorButton()).toBeDisabled();
    });

    it('falls back to an empty description when no translation exists yet', () => {
        renderComponent({ language: EN_LANGUAGE, translatedDescription: undefined });

        expect(getDescriptionTextarea()).toHaveValue('');
    });

    it('ignores description and image changes while a non-base language is selected', () => {
        renderComponent({ language: EN_LANGUAGE });

        fireEvent.change(getDescriptionTextarea(), { target: { value: 'Should be ignored' } });
        clickImageChange();
        clickImageRemove();
        clickImageSetError();

        expect(onValuesChange).not.toHaveBeenCalled();
    });

    it('disables the delete button when structural actions are disabled', () => {
        renderComponent({ disableStructuralActions: true });

        expect(getDeleteButton()).toBeDisabled();
    });
});
