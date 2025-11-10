import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerForm, PartnerFormValues, PartnerFormErrors } from './PartnerForm';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { PARTNER_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/partner-schema/partner-schema';

jest.mock('../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: ({ onChange, disabled, name }: any) => (
        <div>
            <button
                type="button"
                data-testid={`${name}-change`}
                onClick={() =>
                    onChange({
                        base64: 'base64-image',
                        mimeType: 'image/png',
                    })
                }
                disabled={disabled}
            >
                Change image
            </button>
            <button
                type="button"
                data-testid={`${name}-remove`}
                onClick={() => onChange(null)}
                disabled={disabled}
            >
                Remove image
            </button>
        </div>
    ),
}));

jest.mock(
    '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            value,
            onChange,
            disabled,
            name,
            placeholder,
        }: any) => (
            <label>
                <span>{label}</span>
                <textarea
                    data-testid={`${name}-textarea`}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                />
            </label>
        ),
    }),
);

jest.mock('../../../../../validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_VALIDATION_FUNCTIONS: {
        validateDescription: jest.fn(),
        validateImage: jest.fn(),
    },
}));

const mockValidateDescription = PARTNER_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;
const mockValidateImage = PARTNER_VALIDATION_FUNCTIONS.validateImage as jest.Mock;

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

describe('PartnerForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form with provided values and labels', () => {
        const onValuesChange = jest.fn();
        const onDelete = jest.fn();

        render(
            <PartnerForm
                values={defaultValues}
                errors={defaultErrors}
                disabled={false}
                onValuesChange={onValuesChange}
                onDelete={onDelete}
            />,
        );

        expect(screen.getByTestId(`partner-form-${defaultValues.localId}`)).toBeInTheDocument();
        expect(screen.getByText(PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(PARTNERS_TEXT.PARTNER.DESCRIPTION_PLACEHOLDER),
        ).toBeInTheDocument();
    });

    it('validates and propagates description changes', () => {
        const onValuesChange = jest.fn();
        const onDelete = jest.fn();
        const newDescription = 'Updated description';
        const validationError = 'Some description error';

        mockValidateDescription.mockReturnValueOnce(validationError);

        render(
            <PartnerForm
                values={defaultValues}
                errors={defaultErrors}
                disabled={false}
                onValuesChange={onValuesChange}
                onDelete={onDelete}
            />,
        );

        fireEvent.change(
            screen.getByTestId(`partner-form-description-${defaultValues.localId}-textarea`),
            { target: { value: newDescription } },
        );

        expect(mockValidateDescription).toHaveBeenCalledWith(newDescription);
        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, description: newDescription },
            { ...defaultErrors, description: validationError },
        );
    });

    it('validates and propagates image changes', () => {
        const onValuesChange = jest.fn();
        const onDelete = jest.fn();
        const imageValues = {
            base64: 'new-base64',
            mimeType: 'image/png',
        };
        const validationError = 'Image error';

        mockValidateImage.mockReturnValueOnce(validationError);

        render(
            <PartnerForm
                values={defaultValues}
                errors={defaultErrors}
                disabled={false}
                onValuesChange={onValuesChange}
                onDelete={onDelete}
            />,
        );

        fireEvent.click(screen.getByTestId(`partner-form-image-${defaultValues.localId}-change`));

        expect(mockValidateImage).toHaveBeenCalledWith({
            base64: 'base64-image',
            mimeType: 'image/png',
        });
        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, image: { base64: 'base64-image', mimeType: 'image/png' } },
            { ...defaultErrors, image: validationError },
        );

        mockValidateImage.mockReturnValueOnce('Image required');

        fireEvent.click(screen.getByTestId(`partner-form-image-${defaultValues.localId}-remove`));

        expect(mockValidateImage).toHaveBeenCalledWith(null);
        expect(onValuesChange).toHaveBeenCalledWith(
            { ...defaultValues, image: null },
            { ...defaultErrors, image: 'Image required' },
        );
    });

    it('invokes onDelete with local id', () => {
        const onValuesChange = jest.fn();
        const onDelete = jest.fn();

        const { container } = render(
            <PartnerForm
                values={defaultValues}
                errors={defaultErrors}
                disabled={false}
                onValuesChange={onValuesChange}
                onDelete={onDelete}
            />,
        );

        const deleteButton = container.querySelector('.partner-form__delete-button');
        expect(deleteButton).not.toBeNull();

        fireEvent.click(deleteButton as Element);

        expect(onDelete).toHaveBeenCalledWith(defaultValues.localId);
    });

    it('disables image and description inputs when form is disabled', () => {
        const onValuesChange = jest.fn();
        const onDelete = jest.fn();

        render(
            <PartnerForm
                values={defaultValues}
                errors={defaultErrors}
                disabled={true}
                onValuesChange={onValuesChange}
                onDelete={onDelete}
            />,
        );

        expect(
            screen.getByTestId(`partner-form-image-${defaultValues.localId}-change`),
        ).toBeDisabled();
        expect(
            screen.getByTestId(`partner-form-description-${defaultValues.localId}-textarea`),
        ).toBeDisabled();
    });
});

