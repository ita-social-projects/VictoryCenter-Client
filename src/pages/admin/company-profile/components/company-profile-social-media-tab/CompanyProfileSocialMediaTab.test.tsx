import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { CompanyProfileSocialMediaTab } from './CompanyProfileSocialMediaTab';
import { COMPANY_PROFILE_FORM_DEFAULTS, CompanyProfileFormValues } from '@/types/admin/company-profile';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';

jest.mock('@/assets/icons/delete.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="delete-icon" />,
}));

jest.mock('@/components/admin/button-tooltip/ButtonTooltip', () => ({
    ButtonTooltip: ({ children }: any) => <div data-testid="profile-tooltip">{children}</div>,
}));

jest.mock('@/components/common/single-select-input/SingleSelectInput', () => ({
    SingleSelectInput: ({ options, onChange, disabled }: any) => (
        <button
            type="button"
            data-testid="add-platform-btn"
            disabled={disabled}
            onClick={() => {
                if (options?.[0]) onChange(options[0]);
            }}
        >
            Add platform
        </button>
    ),
}));

jest.mock('../company-profile-form-group/CompanyProfileFormGroup', () => ({
    CustomFormGroup: ({ id, disabled, value, onChange }: any) => (
        <input
            data-testid={`social-url-${id}`}
            id={id}
            disabled={disabled}
            value={value ?? ''}
            onChange={(e) => onChange?.(e)}
        />
    ),
}));

jest.mock('../company-profile-delete-social-modal/CompanyProfileDeleteSocialModal', () => ({
    CompanyProfileDeleteSocialModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="delete-social-modal">
                <button data-testid="confirm-delete" onClick={onConfirm}>
                    Так
                </button>
                <button data-testid="cancel-delete" onClick={onCancel}>
                    Ні
                </button>
            </div>
        ) : null,
}));

const Wrapper = (props: { disabled: boolean; defaultValues?: Partial<CompanyProfileFormValues> }) => {
    const methods = useForm<CompanyProfileFormValues>({
        defaultValues: { ...COMPANY_PROFILE_FORM_DEFAULTS, ...(props.defaultValues ?? {}) },
        mode: 'onBlur',
    });
    return (
        <FormProvider {...methods}>
            <CompanyProfileSocialMediaTab disabled={props.disabled} />
        </FormProvider>
    );
};

describe('CompanyProfileSocialMediaTab', () => {
    it('renders title and tooltip', () => {
        render(<Wrapper disabled={true} />);
        expect(screen.getByText(COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.SECTION_TITLE)).toBeInTheDocument();
        expect(screen.getByTestId('profile-tooltip')).toBeInTheDocument();

        expect(screen.getByTestId('profile-tooltip')).toHaveTextContent(
            COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.TOOLTIP
        );
    });

    it('does not show add dropdown when disabled=true (view mode)', () => {
        render(<Wrapper disabled={true} />);
        expect(screen.queryByTestId('add-platform-btn')).not.toBeInTheDocument();
    });

    it('does not show delete button when only one contact exists', () => {
        render(
            <Wrapper
                disabled={false}
                defaultValues={{
                    socialContacts: [{ platform: 'Instagram', url: 'https://instagram.com/test' }],
                }}
            />,
        );
        expect(screen.queryByLabelText('Delete social contact')).not.toBeInTheDocument();
    });

    it('opens confirmation modal on delete click and removes contact on confirm', () => {
        render(
            <Wrapper
                disabled={false}
                defaultValues={{
                    socialContacts: [
                        { platform: 'Instagram', url: 'https://instagram.com/test' },
                        { platform: 'Facebook', url: 'https://facebook.com/test' },
                    ],
                }}
            />,
        );

        expect(screen.getAllByTestId(/^social-url-socialContacts\./)).toHaveLength(2);
        expect(screen.queryByTestId('delete-social-modal')).not.toBeInTheDocument();

        fireEvent.click(screen.getAllByLabelText('Delete social contact')[0]);

        expect(screen.getByTestId('delete-social-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('confirm-delete'));

        expect(screen.getAllByTestId(/^social-url-socialContacts\./)).toHaveLength(1);
        expect(screen.queryByTestId('delete-social-modal')).not.toBeInTheDocument();
    });

    it('closes modal without deleting on cancel', () => {
        render(
            <Wrapper
                disabled={false}
                defaultValues={{
                    socialContacts: [
                        { platform: 'Instagram', url: 'https://instagram.com/test' },
                        { platform: 'Facebook', url: 'https://facebook.com/test' },
                    ],
                }}
            />,
        );

        fireEvent.click(screen.getAllByLabelText('Delete social contact')[0]);
        expect(screen.getByTestId('delete-social-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('cancel-delete'));

        expect(screen.queryByTestId('delete-social-modal')).not.toBeInTheDocument();
        expect(screen.getAllByTestId(/^social-url-socialContacts\./)).toHaveLength(2);
    });

    it('disables add button when 4 contacts reached', () => {
        render(
            <Wrapper
                disabled={false}
                defaultValues={{
                    socialContacts: [
                        { platform: 'Instagram', url: '' },
                        { platform: 'Facebook', url: '' },
                        { platform: 'Telegram', url: '' },
                        { platform: 'YouTube', url: '' },
                    ],
                }}
            />,
        );
        expect(screen.getByTestId('add-platform-btn')).toBeDisabled();
        expect(screen.getByText(COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.LIMIT_MESSAGE)).toBeInTheDocument();
    });
});
