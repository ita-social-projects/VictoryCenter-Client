import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerSectionForm, PartnerSectionFormValues, PartnerSectionErrors } from './PartnerSectionForm';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    PARTNER_SECTION_VALIDATION_FUNCTIONS,
    PARTNER_VALIDATION_FUNCTIONS,
} from '@/validation/admin/partner-schema/partner-schema';
import { TextAreaWithCharacterLimitGroupProps } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PartnerFormProps } from '../partner-form/PartnerForm';
import { ButtonProps } from '@/components/admin/button/Button';

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            value,
            onChange,
            disabled,
            name,
            placeholder,
        }: TextAreaWithCharacterLimitGroupProps) => (
            <label>
                <span>{label}</span>
                <textarea
                    data-testid={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                />
            </label>
        ),
    }),
);

jest.mock('../partner-form/PartnerForm', () => ({
    PartnerForm: ({ values, errors, disabled, onValuesChange, onDelete }: PartnerFormProps) => (
        <div data-testid={`mock-partner-${values.localId}`}>
            <span>{values.description}</span>
            <button
                type="button"
                data-testid={`partner-change-${values.localId}`}
                onClick={() =>
                    onValuesChange(
                        { ...values, description: 'Partner updated' },
                        { ...errors, description: 'desc error' },
                    )
                }
                disabled={disabled}
            >
                Change partner
            </button>
            <button
                type="button"
                data-testid={`partner-delete-${values.localId}`}
                onClick={() => onDelete(values.localId)}
                disabled={disabled}
            >
                Delete partner
            </button>
        </div>
    ),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid={`inline-loader-${size}`} />,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, type, ...props }: ButtonProps) => (
        <button onClick={onClick} disabled={disabled} type={type} {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_SECTION_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(),
        validateDescription: jest.fn(),
    },
    PARTNER_VALIDATION_FUNCTIONS: {
        validateDescription: jest.fn(),
        validateImage: jest.fn(),
    },
}));

const mockValidateSectionTitle = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle as jest.Mock;
const mockValidateSectionDescription = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;
const mockValidatePartnerDescription = PARTNER_VALIDATION_FUNCTIONS.validateDescription as jest.Mock;

const defaultPartner = {
    localId: 'partner-1',
    partnerId: 5,
    description: 'Partner description',
    image: { id: 11, url: 'image.jpg', mimeType: 'image/jpeg' },
    imageId: 11,
};

const defaultSectionValue: PartnerSectionFormValues = {
    localId: 'section-1',
    sectionId: 9,
    title: 'Section title',
    description: 'Section description',
    partners: [defaultPartner],
    deletedPartnerIds: [],
};

const defaultSectionErrors: PartnerSectionErrors = {
    title: undefined,
    description: undefined,
    partners: [{}],
};

const mockRandomUUID = jest.fn();

beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        configurable: true,
    });
});

beforeEach(() => {
    jest.clearAllMocks();
    mockRandomUUID.mockReturnValue('new-partner-id');
    mockValidateSectionTitle.mockImplementation(() => undefined);
    mockValidateSectionDescription.mockImplementation(() => undefined);
    mockValidatePartnerDescription.mockImplementation(() => undefined);
});

describe('PartnerSectionForm', () => {
    it('renders section fields and partner list', () => {
        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByTestId(`partner-section-title-${defaultSectionValue.localId}`)).toHaveValue(
            defaultSectionValue.title,
        );
        expect(screen.getByTestId(`partner-section-description-${defaultSectionValue.localId}`)).toHaveValue(
            defaultSectionValue.description,
        );
        expect(screen.getByText(PARTNERS_TEXT.BUTTON.ADD_PARTNER)).toBeInTheDocument();
        expect(screen.getByText(defaultPartner.description)).toBeInTheDocument();
    });

    it('validates and propagates title changes', () => {
        const onChange = jest.fn();
        mockValidateSectionTitle.mockImplementation(() => 'Title error');

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.change(screen.getByTestId(`partner-section-title-${defaultSectionValue.localId}`), {
            target: { value: 'New title' },
        });

        expect(mockValidateSectionTitle).toHaveBeenCalledWith('New title');
        expect(onChange).toHaveBeenCalledWith(
            { ...defaultSectionValue, title: 'New title' },
            { ...defaultSectionErrors, title: 'Title error' },
        );
    });

    it('validates and propagates description changes', () => {
        const onChange = jest.fn();
        mockValidateSectionDescription.mockImplementation(() => 'Description error');

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.change(screen.getByTestId(`partner-section-description-${defaultSectionValue.localId}`), {
            target: { value: 'New description' },
        });

        expect(mockValidateSectionDescription).toHaveBeenCalledWith('New description');
        expect(onChange).toHaveBeenCalledWith(
            { ...defaultSectionValue, description: 'New description' },
            { ...defaultSectionErrors, description: 'Description error' },
        );
    });

    it('adds a new partner and expands errors array', () => {
        const onChange = jest.fn();

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByText(PARTNERS_TEXT.BUTTON.ADD_PARTNER));

        expect(mockRandomUUID).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledWith(
            {
                ...defaultSectionValue,
                partners: [
                    ...defaultSectionValue.partners,
                    {
                        localId: 'new-partner-id',
                        partnerId: null,
                        description: '',
                        image: null,
                        imageId: null,
                    },
                ],
            },
            { ...defaultSectionErrors, partners: [...defaultSectionErrors.partners, {}] },
        );
    });

    it('updates partner data when partner form changes', () => {
        const onChange = jest.fn();

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId(`partner-change-${defaultPartner.localId}`));

        expect(onChange).toHaveBeenCalledWith(
            {
                ...defaultSectionValue,
                partners: [
                    {
                        ...defaultPartner,
                        description: 'Partner updated',
                    },
                ],
            },
            {
                ...defaultSectionErrors,
                partners: [{ ...defaultSectionErrors.partners[0], description: 'desc error' }],
            },
        );
    });

    it('removes partner and tracks deleted ids', () => {
        const onChange = jest.fn();

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId(`partner-delete-${defaultPartner.localId}`));

        expect(onChange).toHaveBeenCalledWith(
            {
                ...defaultSectionValue,
                partners: [],
                deletedPartnerIds: [defaultPartner.partnerId],
            },
            { ...defaultSectionErrors, partners: [] },
        );
    });

    it('disables publish button when validation fails', () => {
        mockValidateSectionTitle.mockImplementation(() => 'Title invalid');

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('enables publish button when validation passes', () => {
        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('disables publish button when form is not dirty', () => {
        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                isDirty={false}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('disables publish when partner description validation fails', () => {
        mockValidatePartnerDescription.mockImplementation(() => 'desc error');

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('disables publish when partner image missing or has error', () => {
        const valueWithoutImage = {
            ...defaultSectionValue,
            partners: [{ ...defaultPartner, image: null, imageId: null }],
        };
        const errorsWithImageIssue = { ...defaultSectionErrors, partners: [{ image: 'Image required' }] };

        render(
            <PartnerSectionForm
                value={valueWithoutImage}
                errors={errorsWithImageIssue}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('keeps publish enabled when image error exists but stored image is unchanged', () => {
        const errorsWithImageIssue = { ...defaultSectionErrors, partners: [{ image: 'Image too large' }] };

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={errorsWithImageIssue}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('shows loader and disables actions when form is disabled', () => {
        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByTestId('inline-loader-2')).toBeInTheDocument();
        expect(screen.getByText(PARTNERS_TEXT.SECTION.DELETE_SECTION)).toBeDisabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('handles delete and publish button clicks', () => {
        const onDelete = jest.fn();
        const onPublish = jest.fn();

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={onDelete}
                onPublish={onPublish}
            />,
        );

        fireEvent.click(screen.getByText(PARTNERS_TEXT.SECTION.DELETE_SECTION));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));

        expect(onDelete).toHaveBeenCalledWith(defaultSectionValue.localId);
        expect(onPublish).toHaveBeenCalledWith(defaultSectionValue.localId);
    });

    it('does not push deleted id when partner has no persisted id', () => {
        const partnerWithoutId = { ...defaultPartner, partnerId: null };
        const onChange = jest.fn();

        render(
            <PartnerSectionForm
                value={{ ...defaultSectionValue, partners: [partnerWithoutId] }}
                errors={defaultSectionErrors}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId(`partner-delete-${partnerWithoutId.localId}`));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ deletedPartnerIds: [] }), expect.anything());
    });

    it('disables publish button when partner list is empty', () => {
        render(
            <PartnerSectionForm
                value={{ ...defaultSectionValue, partners: [] }}
                errors={{ partners: [] }}
                disabled={false}
                isDirty={true}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('expands errors array when partner form changes and errors array is shorter', () => {
        const onChange = jest.fn();

        render(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={{ partners: [] }}
                disabled={false}
                onChange={onChange}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId(`partner-change-${defaultPartner.localId}`));

        expect(onChange).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                partners: [{ description: 'desc error' }],
            }),
        );
    });
});
