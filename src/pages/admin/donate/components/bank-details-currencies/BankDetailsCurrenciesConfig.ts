import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { UahBankDetailsType, UsdBankDetailsType } from '../../../../../types/admin/donate';
import { GenericFormProps, GenericFormRef } from '../generic-form/GenericForm';
import { FieldValues } from 'react-hook-form';
import { CorrespondentBankDetialsForm, createBankDetailsForm } from './BankDetailsFactory';

export interface BankDetailsConfig<TItem extends FieldValues> {
    form: ForwardRefExoticComponent<GenericFormProps<TItem> & RefAttributes<GenericFormRef>>;
    createEmptyItem: (data: Partial<TItem>) => TItem;
    withCorrespondentBanks?: boolean;
    fetch: () => Promise<TItem[]>;
    correspondentForm?: ForwardRefExoticComponent<GenericFormProps<any> & RefAttributes<GenericFormRef>>;
}

export const bankDetailsConfig: Record<string, BankDetailsConfig<any>> = {
    UAH: {
        form: createBankDetailsForm('UAH'),
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as UahBankDetailsType,
        fetch: async () => {
            // TODO
            return [];
        },
    },
    USD: {
        form: createBankDetailsForm('USD'),
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as UsdBankDetailsType,
        withCorrespondentBanks: true,
        correspondentForm: CorrespondentBankDetialsForm,
        fetch: async () => {
            // TODO
            return [];
        },
    },
    EUR: {
        form: createBankDetailsForm('EUR'),
        createEmptyItem: (data: any) => ({ id: Date.now(), ...data }),
        fetch: async () => {
            // TODO
            return [];
        },
    },
};
