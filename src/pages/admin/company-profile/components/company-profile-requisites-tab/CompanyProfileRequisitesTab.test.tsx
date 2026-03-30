import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { CompanyProfileRequisitesTab } from './CompanyProfileRequisitesTab';
import { COMPANY_PROFILE_FORM_DEFAULTS, CompanyProfileFormValues } from '@/types/admin/company-profile';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';

jest.mock('../company-profile-form-group/CompanyProfileFormGroup', () => ({
    CustomFormGroup: ({ id, labelText, disabled, value, onChange }: any) => (
        <div data-testid={`group-${id}`}>
            <span data-testid={`label-${id}`}>{labelText}</span>
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
            <CompanyProfileRequisitesTab disabled={props.disabled} />
        </FormProvider>
    );
};

describe('CompanyProfileRequisitesTab', () => {
    it('renders section title and fields', () => {
        render(<Wrapper disabled={true} />);

        expect(screen.getByText(COMPANY_PROFILE_TEXT.REQUISITES_TAB.SECTION_TITLE)).toBeInTheDocument();

        expect(screen.getByTestId('group-requisitesUa')).toBeInTheDocument();
        expect(screen.getByTestId('group-requisitesEn')).toBeInTheDocument();
        expect(screen.getByTestId('group-companyRegistrationNumber')).toBeInTheDocument();
        expect(screen.getByTestId('group-addressUa_requisites')).toBeInTheDocument();
        expect(screen.getByTestId('group-addressEn_requisites')).toBeInTheDocument();
    });

    it('disables inputs when disabled=true', () => {
        render(<Wrapper disabled={true} />);
        expect(screen.getByTestId('input-requisitesUa')).toBeDisabled();
        expect(screen.getByTestId('input-companyRegistrationNumber')).toBeDisabled();
    });

    it('enables inputs when disabled=false', () => {
        render(<Wrapper disabled={false} />);
        expect(screen.getByTestId('input-requisitesUa')).not.toBeDisabled();
        expect(screen.getByTestId('input-companyRegistrationNumber')).not.toBeDisabled();
    });

    it('sanitizes companyRegistrationNumber to digits only and max 8 chars', () => {
        render(<Wrapper disabled={false} />);

        const input = screen.getByTestId('input-companyRegistrationNumber') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '12a45-67' } });
        expect(input.value).toBe('124567');

        fireEvent.change(input, { target: { value: '123456789999' } });
        expect(input.value).toBe('12345678');
    });
});
