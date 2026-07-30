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
import { LocalizationLanguage } from '@/types/common/language';
import { PartnerSectionLocalizationDto } from '@/types/admin/partners';

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
    PartnerForm: ({ values, errors, disabled, onValuesChange, onDelete, translatedDescription }: PartnerFormProps) => (
        <div data-testid={`mock-partner-${values.localId}`}>
            <span>{translatedDescription ?? values.description}</span>
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

const UK_LANGUAGE: LocalizationLanguage = { id: 1, code: 'uk', name: 'Ukrainian' };
const EN_LANGUAGE: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };

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

const renderComponent = (props: Partial<React.ComponentProps<typeof PartnerSectionForm>> = {}) => {
    const defaultProps: React.ComponentProps<typeof PartnerSectionForm> = {
        value: defaultSectionValue,
        errors: defaultSectionErrors,
        isDirty: true,
        disabled: false,
        onChange: jest.fn(),
        onDelete: jest.fn(),
        onPublish: jest.fn(),
        onTranslate: jest.fn(),
        localizations: [],
        translationLanguages: [],
        language: UK_LANGUAGE,
        translatedContent: null,
    };

    return render(<PartnerSectionForm {...defaultProps} {...props} />);
};

describe('PartnerSectionForm', () => {
    it('renders section fields and partner list', () => {
        renderComponent();

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

        renderComponent({ onChange });

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

        renderComponent({ onChange });

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

        renderComponent({ onChange });

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

        renderComponent({ onChange });

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

        renderComponent({ onChange });

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

        renderComponent();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('enables publish button when validation passes', () => {
        renderComponent();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('disables publish when partner description validation fails', () => {
        mockValidatePartnerDescription.mockImplementation(() => 'desc error');

        renderComponent();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('disables publish when partner image missing or has error', () => {
        const valueWithoutImage = {
            ...defaultSectionValue,
            partners: [{ ...defaultPartner, image: null, imageId: null }],
        };
        const errorsWithImageIssue = { ...defaultSectionErrors, partners: [{ image: 'Image required' }] };

        renderComponent({ value: valueWithoutImage, errors: errorsWithImageIssue });

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('keeps publish enabled when image error exists but stored image is unchanged', () => {
        const errorsWithImageIssue = { ...defaultSectionErrors, partners: [{ image: 'Image too large' }] };

        renderComponent({ errors: errorsWithImageIssue });

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('shows loader and disables actions when form is disabled', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('inline-loader-2')).toBeInTheDocument();
        expect(screen.getByText(PARTNERS_TEXT.SECTION.DELETE_SECTION)).toBeDisabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('handles delete and publish button clicks', () => {
        const onDelete = jest.fn();
        const onPublish = jest.fn();

        renderComponent({ onDelete, onPublish });

        fireEvent.click(screen.getByText(PARTNERS_TEXT.SECTION.DELETE_SECTION));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));

        expect(onDelete).toHaveBeenCalledWith(defaultSectionValue.localId);
        expect(onPublish).toHaveBeenCalledWith(defaultSectionValue.localId, defaultSectionValue);
    });

    it('does not push deleted id when partner has no persisted id', () => {
        const partnerWithoutId = { ...defaultPartner, partnerId: null };
        const onChange = jest.fn();

        renderComponent({ value: { ...defaultSectionValue, partners: [partnerWithoutId] }, onChange });

        fireEvent.click(screen.getByTestId(`partner-delete-${partnerWithoutId.localId}`));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ deletedPartnerIds: [] }), expect.anything());
    });

    it('disables publish button when not dirty', () => {
        renderComponent({ isDirty: false });

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('enables publish button only when dirty and valid', () => {
        const { rerender } = renderComponent({ isDirty: false });

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();

        rerender(
            <PartnerSectionForm
                value={defaultSectionValue}
                errors={defaultSectionErrors}
                isDirty={true}
                disabled={false}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onPublish={jest.fn()}
                onTranslate={jest.fn()}
                localizations={[]}
                translationLanguages={[]}
                language={UK_LANGUAGE}
                translatedContent={null}
            />,
        );
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('shows translated content and disables fields/structural actions when a non-base language is selected', () => {
        const translatedContent: PartnerSectionLocalizationDto = {
            entityId: 9,
            title: 'Section title EN',
            description: 'Section description EN',
            partners: [{ partnerId: defaultPartner.partnerId, description: 'Partner description EN' }],
            localizationInfoDto: { id: EN_LANGUAGE.id, code: EN_LANGUAGE.code },
            translationStatus: 1,
        };

        renderComponent({ language: EN_LANGUAGE, translatedContent, disableStructuralActions: true });

        expect(screen.getByTestId(`partner-section-title-${defaultSectionValue.localId}`)).toHaveValue(
            'Section title EN',
        );
        expect(screen.getByTestId(`partner-section-title-${defaultSectionValue.localId}`)).toBeDisabled();
        expect(screen.getByTestId(`partner-section-description-${defaultSectionValue.localId}`)).toHaveValue(
            'Section description EN',
        );
        expect(screen.getByTestId(`partner-section-description-${defaultSectionValue.localId}`)).toBeDisabled();
        expect(screen.getByText('Partner description EN')).toBeInTheDocument();
        expect(screen.getByText(PARTNERS_TEXT.SECTION.DELETE_SECTION)).toBeDisabled();
        expect(screen.getByText(PARTNERS_TEXT.BUTTON.ADD_PARTNER).closest('button')).toBeDisabled();
        expect(
            screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }),
        ).not.toBeInTheDocument();
    });

    it('shows empty section fields when the section has no translation yet', () => {
        renderComponent({ language: EN_LANGUAGE, translatedContent: null });

        expect(screen.getByTestId(`partner-section-title-${defaultSectionValue.localId}`)).toHaveValue('');
        expect(screen.getByTestId(`partner-section-description-${defaultSectionValue.localId}`)).toHaveValue('');
    });

    it('ignores title and description changes while a non-base language is selected', () => {
        const onChange = jest.fn();

        renderComponent({ language: EN_LANGUAGE, onChange });

        fireEvent.change(screen.getByTestId(`partner-section-title-${defaultSectionValue.localId}`), {
            target: { value: 'Should be ignored' },
        });
        fireEvent.change(screen.getByTestId(`partner-section-description-${defaultSectionValue.localId}`), {
            target: { value: 'Should be ignored' },
        });

        expect(onChange).not.toHaveBeenCalled();
    });

    it('ignores delete-section and add-partner clicks when structural actions are disabled', () => {
        const onDelete = jest.fn();
        const onChange = jest.fn();

        renderComponent({ disableStructuralActions: true, onDelete, onChange });

        fireEvent.click(screen.getByText(PARTNERS_TEXT.SECTION.DELETE_SECTION));
        fireEvent.click(screen.getByText(PARTNERS_TEXT.BUTTON.ADD_PARTNER));

        expect(onDelete).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });
});
