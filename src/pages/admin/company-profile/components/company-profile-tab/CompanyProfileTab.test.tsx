import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { CompanyProfileTab } from './CompanyProfileTab';
import { COMPANY_PROFILE_FORM_DEFAULTS, CompanyProfileFormValues } from '@/types/admin/company-profile';

jest.mock('../company-profile-form-group/CompanyProfileFormGroup', () => ({
    CustomFormGroup: ({ id, labelText, disabled, value, onChange }: any) => (
        <div>
            <label htmlFor={id}>{labelText}</label>
            <input
                data-testid={`input-${id}`}
                id={id}
                disabled={disabled}
                value={value ?? ''}
                onChange={(e) => onChange?.(e)}
            />
        </div>
    ),
}));

const Wrapper = (props: { disabled: boolean }) => {
    const methods = useForm<CompanyProfileFormValues>({
        defaultValues: COMPANY_PROFILE_FORM_DEFAULTS,
        mode: 'onBlur',
    });

    return (
        <FormProvider {...methods}>
            <CompanyProfileTab disabled={props.disabled} />
        </FormProvider>
    );
};

describe('CompanyProfileTab', () => {
    it('disables inputs when disabled=true', () => {
        render(<Wrapper disabled={true} />);
        expect(screen.getByTestId('input-phone')).toBeDisabled();
    });

    it('allows typing when disabled=false', () => {
        render(<Wrapper disabled={false} />);
        const input = screen.getByTestId('input-phone') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '+380 50 000 00 00' } });
        expect(input).toBeInTheDocument();
    });
});
