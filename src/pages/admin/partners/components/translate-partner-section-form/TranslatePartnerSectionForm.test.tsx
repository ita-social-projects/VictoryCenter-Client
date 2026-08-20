import React, { createRef } from 'react';
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslatePartnerSectionForm, TranslatePartnerSectionFormRef } from './TranslatePartnerSectionForm';
import { TranslatePartnerSectionFormValues } from '@/hooks/admin/use-translate-partner-section/useTranslatePartnerSection';
import { VisibilityStatus } from '@/types/admin/common';
import { Partner } from '@/types/admin/partners';
import {
    PARTNER_SECTION_VALIDATION_FUNCTIONS,
    PARTNER_VALIDATION_FUNCTIONS,
} from '@/validation/admin/partner-schema/partner-schema';

jest.mock('@/validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_SECTION_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(() => undefined),
        validateDescription: jest.fn(() => undefined),
    },
    PARTNER_VALIDATION_FUNCTIONS: {
        validateDescription: jest.fn(() => undefined),
    },
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, disabled, name, id, error }: any) => (
            <div>
                <textarea
                    data-testid={`textarea-${name ?? id}`}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
                {error && <span data-testid={`error-${name ?? id}`}>{error}</span>}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: ({ id, disabled }: any) => <div data-testid={id} data-disabled={String(Boolean(disabled))} />,
}));

const validationMock = PARTNER_SECTION_VALIDATION_FUNCTIONS as jest.Mocked<typeof PARTNER_SECTION_VALIDATION_FUNCTIONS>;
const partnerValidationMock = PARTNER_VALIDATION_FUNCTIONS as jest.Mocked<typeof PARTNER_VALIDATION_FUNCTIONS>;

const mockPartners: Partner[] = [
    { id: 5, description: 'Live partner 1', image: null, imageId: null },
    { id: 6, description: 'Live partner 2', image: null, imageId: null },
];

const emptyInitialData: TranslatePartnerSectionFormValues = {
    title: '',
    description: '',
    partners: [
        { partnerId: 5, description: '' },
        { partnerId: 6, description: '' },
    ],
};

describe('TranslatePartnerSectionForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validationMock.validateTitle.mockReturnValue(undefined);
        validationMock.validateDescription.mockReturnValue(undefined);
        partnerValidationMock.validateDescription.mockReturnValue(undefined);
    });

    const renderForm = (props: Partial<React.ComponentProps<typeof TranslatePartnerSectionForm>> = {}) => {
        const ref = createRef<TranslatePartnerSectionFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslatePartnerSectionForm> = {
            onSubmit: jest.fn(),
            partners: mockPartners,
            initialData: emptyInitialData,
        };

        const view = render(<TranslatePartnerSectionForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
            ...view,
        };
    };

    it('renders title, description and one row per partner', () => {
        renderForm();

        expect(screen.getByTestId('textarea-title')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
        expect(screen.getByTestId('translate-partner-image-5')).toBeInTheDocument();
        expect(screen.getByTestId('translate-partner-image-6')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-translate-partner-description-5')).toBeInTheDocument();
        expect(screen.getByTestId('textarea-translate-partner-description-6')).toBeInTheDocument();
    });

    it('fills fields from initialData', () => {
        const initialData: TranslatePartnerSectionFormValues = {
            title: 'Existing title',
            description: 'Existing description',
            partners: [
                { partnerId: 5, description: 'Existing partner 1' },
                { partnerId: 6, description: 'Existing partner 2' },
            ],
        };

        renderForm({ initialData });

        expect(screen.getByTestId('textarea-title')).toHaveValue('Existing title');
        expect(screen.getByTestId('textarea-description')).toHaveValue('Existing description');
        expect(screen.getByTestId('textarea-translate-partner-description-5')).toHaveValue('Existing partner 1');
        expect(screen.getByTestId('textarea-translate-partner-description-6')).toHaveValue('Existing partner 2');
    });

    it('renders partner images as disabled (read-only)', () => {
        renderForm();

        expect(screen.getByTestId('translate-partner-image-5')).toHaveAttribute('data-disabled', 'true');
    });

    it('updates title, description and partner description values on change', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('textarea-title'), { target: { value: 'Translated title' } });
        fireEvent.change(screen.getByTestId('textarea-description'), {
            target: { value: 'Translated description' },
        });
        fireEvent.change(screen.getByTestId('textarea-translate-partner-description-5'), {
            target: { value: 'Translated partner 1' },
        });

        expect(screen.getByTestId('textarea-title')).toHaveValue('Translated title');
        expect(screen.getByTestId('textarea-description')).toHaveValue('Translated description');
        expect(screen.getByTestId('textarea-translate-partner-description-5')).toHaveValue('Translated partner 1');
        expect(screen.getByTestId('textarea-translate-partner-description-6')).toHaveValue('');
    });

    it('validates title, description and partner description on change', () => {
        renderForm();

        fireEvent.change(screen.getByTestId('textarea-title'), { target: { value: 'x' } });
        fireEvent.change(screen.getByTestId('textarea-description'), { target: { value: 'y' } });
        fireEvent.change(screen.getByTestId('textarea-translate-partner-description-5'), { target: { value: 'z' } });

        expect(validationMock.validateTitle).toHaveBeenCalledWith('x');
        expect(validationMock.validateDescription).toHaveBeenCalledWith('y');
        expect(partnerValidationMock.validateDescription).toHaveBeenCalledWith('z');
    });

    it('shows validation errors returned by validation functions', async () => {
        validationMock.validateTitle.mockReturnValue('Title error');
        partnerValidationMock.validateDescription.mockReturnValue('Partner error');

        renderForm();

        fireEvent.change(screen.getByTestId('textarea-title'), { target: { value: 'x' } });
        fireEvent.change(screen.getByTestId('textarea-translate-partner-description-5'), { target: { value: 'z' } });

        await waitFor(() => {
            expect(screen.getByTestId('error-title')).toHaveTextContent('Title error');
            expect(screen.getByTestId('error-translate-partner-description-5')).toHaveTextContent('Partner error');
        });
    });

    it('calls onValidationChange from form manager updates', async () => {
        const onValidationChange = jest.fn();

        renderForm({ onValidationChange });

        await waitFor(() => {
            expect(onValidationChange).toHaveBeenCalledWith(true);
        });
    });

    it('reports invalid only while a partner actually has an error', async () => {
        const onValidationChange = jest.fn();
        partnerValidationMock.validateDescription.mockReturnValue(undefined);

        renderForm({ onValidationChange });

        await waitFor(() => {
            expect(onValidationChange).toHaveBeenLastCalledWith(true);
        });

        partnerValidationMock.validateDescription.mockReturnValue('Partner error');
        fireEvent.change(screen.getByTestId('textarea-translate-partner-description-5'), {
            target: { value: 'bad' },
        });

        await waitFor(() => {
            expect(onValidationChange).toHaveBeenLastCalledWith(false);
        });
    });

    it('reports dirty state relative to initialData', async () => {
        const onDirtyChange = jest.fn();

        renderForm({ onDirtyChange });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenCalledWith(false);
        });

        fireEvent.change(screen.getByTestId('textarea-title'), { target: { value: 'Changed title' } });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenLastCalledWith(true);
        });
    });

    it('submits data via ref.submit and forwards only form data to onSubmit', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.change(screen.getByTestId('textarea-title'), { target: { value: 'Final title' } });
        fireEvent.change(screen.getByTestId('textarea-description'), { target: { value: 'Final description' } });
        fireEvent.change(screen.getByTestId('textarea-translate-partner-description-5'), {
            target: { value: 'Final partner 1' },
        });
        fireEvent.change(screen.getByTestId('textarea-translate-partner-description-6'), {
            target: { value: 'Final partner 2' },
        });

        await ref.current?.submit(VisibilityStatus.Draft);

        expect(onSubmit).toHaveBeenCalledWith({
            title: 'Final title',
            description: 'Final description',
            partners: [
                { partnerId: 5, description: 'Final partner 1' },
                { partnerId: 6, description: 'Final partner 2' },
            ],
        });
    });

    it('exposes isValid and isDirty through ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(true);
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('disables all fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByTestId('textarea-title')).toBeDisabled();
        expect(screen.getByTestId('textarea-description')).toBeDisabled();
        expect(screen.getByTestId('textarea-translate-partner-description-5')).toBeDisabled();
    });

    it('prevents default form submission behavior', () => {
        const { container } = renderForm();
        const form = container.querySelector('#translate-partner-section-form') as HTMLFormElement;

        const event = createEvent.submit(form);
        event.preventDefault = jest.fn();

        fireEvent(form, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });
});
