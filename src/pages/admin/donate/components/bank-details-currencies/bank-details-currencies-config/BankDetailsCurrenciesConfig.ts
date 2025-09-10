import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { UahBankDetailsType, ForeignBankDetailsType } from '../../../../../../types/admin/donate';
import { GenericFormProps, GenericFormRef } from '../../generic-form/GenericForm';
import { FieldValues } from 'react-hook-form';
import { CorrespondentBankDetailsForm, createBankDetailsForm } from '../bank-details-factory/BankDetailsFactory';

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
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as ForeignBankDetailsType,
        withCorrespondentBanks: true,
        correspondentForm: CorrespondentBankDetailsForm,
        fetch: async () => {
            // TODO
            return [];
        },
    },
    EUR: {
        form: createBankDetailsForm('EUR'),
        createEmptyItem: (data: any) => ({ id: Date.now(), ...data }) as ForeignBankDetailsType,
        fetch: async () => {
            // TODO
            return [];
        },
    },
};
