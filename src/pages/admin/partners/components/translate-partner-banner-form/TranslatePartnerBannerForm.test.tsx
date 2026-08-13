import React, { createRef } from 'react';
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    TranslatePartnerBannerForm,
    TranslatePartnerBannerFormRef,
    TranslatePartnerBannerFormValues,
} from './TranslatePartnerBannerForm';
import { VisibilityStatus } from '@/types/admin/common';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';

jest.mock('@/validation/admin/partner-schema/partner-schema', () => ({
    PARTNER_BANNER_VALIDATION_FUNCTIONS: {
        validateTitle: jest.fn(() => undefined),
        validateDescription: jest.fn(() => undefined),
    },
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: ({ value, onChange, onBlur, disabled, id, error }: any) => (
        <div>
            <div
                data-testid={`richtext-${id}`}
                contentEditable={!disabled}
                onInput={(e: any) => onChange(e.target.textContent)}
                onBlur={onBlur}
                suppressContentEditableWarning
            >
                {value}
            </div>
            {error && <span data-testid={`error-${id}`}>{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, disabled, name, id, error }: any) => (
        <div>
            <input
                data-testid={`input-${name ?? id}`}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
            />
            {error && <span data-testid={`error-${name ?? id}`}>{error}</span>}
        </div>
    ),
}));

const validationMock = PARTNER_BANNER_VALIDATION_FUNCTIONS as jest.Mocked<typeof PARTNER_BANNER_VALIDATION_FUNCTIONS>;

describe('TranslatePartnerBannerForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validationMock.validateTitle.mockReturnValue(undefined);
        validationMock.validateDescription.mockReturnValue(undefined);
    });

    const renderForm = (props: Partial<React.ComponentProps<typeof TranslatePartnerBannerForm>> = {}) => {
        const ref = createRef<TranslatePartnerBannerFormRef>();
        const defaultProps: React.ComponentProps<typeof TranslatePartnerBannerForm> = {
            onSubmit: jest.fn(),
        };

        const view = render(<TranslatePartnerBannerForm ref={ref} {...defaultProps} {...props} />);

        return {
            ref,
            onSubmit: props.onSubmit ?? defaultProps.onSubmit,
            ...view,
        };
    };

    it('renders title and description fields', () => {
        renderForm();

        expect(screen.getByTestId('richtext-translate-banner-title')).toBeInTheDocument();
        expect(screen.getByTestId('input-description')).toBeInTheDocument();
    });

    it('fields are empty by default', () => {
        renderForm();

        expect(screen.getByTestId('richtext-translate-banner-title')).toHaveTextContent('');
        expect(screen.getByTestId('input-description')).toHaveValue('');
    });

    it('fills fields from initialData', () => {
        const initialData: TranslatePartnerBannerFormValues = {
            title: 'Existing title',
            description: 'Existing description',
        };

        renderForm({ initialData });

        expect(screen.getByTestId('richtext-translate-banner-title')).toHaveTextContent('Existing title');
        expect(screen.getByTestId('input-description')).toHaveValue('Existing description');
    });

    it('updates title and description values on change', () => {
        renderForm();

        fireEvent.input(screen.getByTestId('richtext-translate-banner-title'), {
            target: { textContent: 'Translated title' },
        });
        fireEvent.change(screen.getByTestId('input-description'), {
            target: { value: 'Translated description' },
        });

        expect(screen.getByTestId('richtext-translate-banner-title')).toHaveTextContent('Translated title');
        expect(screen.getByTestId('input-description')).toHaveValue('Translated description');
    });

    it('validates title and description on blur', () => {
        renderForm();

        fireEvent.blur(screen.getByTestId('richtext-translate-banner-title'));
        fireEvent.blur(screen.getByTestId('input-description'));

        expect(validationMock.validateTitle).toHaveBeenCalled();
        expect(validationMock.validateDescription).toHaveBeenCalled();
    });

    it('shows validation errors returned by validation functions', async () => {
        validationMock.validateTitle.mockReturnValue('Title error');
        validationMock.validateDescription.mockReturnValue('Description error');

        renderForm();

        fireEvent.blur(screen.getByTestId('richtext-translate-banner-title'));
        fireEvent.blur(screen.getByTestId('input-description'));

        await waitFor(() => {
            expect(screen.getByTestId('error-translate-banner-title')).toHaveTextContent('Title error');
            expect(screen.getByTestId('error-description')).toHaveTextContent('Description error');
        });
    });

    it('calls onValidationChange from form manager updates', async () => {
        const onValidationChange = jest.fn();

        renderForm({ onValidationChange });

        await waitFor(() => {
            expect(onValidationChange).toHaveBeenCalledWith(true);
        });
    });

    it('reports dirty state relative to initialData', async () => {
        const onDirtyChange = jest.fn();
        const initialData: TranslatePartnerBannerFormValues = {
            title: 'Base title',
            description: 'Base description',
        };

        renderForm({ initialData, onDirtyChange });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenCalledWith(false);
        });

        fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Changed description' } });

        await waitFor(() => {
            expect(onDirtyChange).toHaveBeenLastCalledWith(true);
        });
    });

    it('submits data via ref.submit and forwards only form data to onSubmit', async () => {
        const onSubmit = jest.fn();
        const { ref } = renderForm({ onSubmit });

        fireEvent.input(screen.getByTestId('richtext-translate-banner-title'), {
            target: { textContent: 'Final title' },
        });
        fireEvent.change(screen.getByTestId('input-description'), {
            target: { value: 'Final description' },
        });

        await ref.current?.submit(VisibilityStatus.Draft);

        expect(onSubmit).toHaveBeenCalledWith({
            title: 'Final title',
            description: 'Final description',
        });
    });

    it('exposes isValid and isDirty through ref', () => {
        const { ref } = renderForm();

        expect(ref.current?.isValid()).toBe(true);
        expect(ref.current?.isDirty()).toBe(false);
    });

    it('disables fields when formDisabled is true', () => {
        renderForm({ formDisabled: true });

        expect(screen.getByTestId('input-description')).toBeDisabled();
    });

    it('prevents default form submission behavior', () => {
        const { container } = renderForm();
        const form = container.querySelector('#translate-partner-banner-form') as HTMLFormElement;

        const event = createEvent.submit(form);
        event.preventDefault = jest.fn();

        fireEvent(form, event);

        expect(event.preventDefault).toHaveBeenCalled();
    });
});
