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
    });

    it('does not show add dropdown when disabled=true (view mode)', () => {
        render(<Wrapper disabled={true} />);
        expect(screen.queryByTestId('add-platform-btn')).not.toBeInTheDocument();
    });

    it('allows deleting social contact when disabled=false', () => {
        render(
            <Wrapper
                disabled={false}
                defaultValues={{
                    socialContacts: [{ platform: 'Instagram', url: 'https://instagram.com/test' }],
                }}
            />,
        );

        expect(screen.getAllByTestId(/^social-url-socialContacts\./)).toHaveLength(1);

        fireEvent.click(screen.getByLabelText('Delete social contact'));

        expect(screen.queryAllByTestId(/^social-url-socialContacts\./)).toHaveLength(0);
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
