import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { UahBankDetailsType, ForeignBankDetailsType } from '../../../../../../types/admin/donate';
import { GenericFormProps, GenericFormRef } from '../../generic-form/GenericForm';
import { FieldValues } from 'react-hook-form';
import { CorrespondentBankDetailsForm, createBankDetailsForm } from '../bank-details-factory/BankDetailsFactory';
import { BankDetailsUahApi } from '../../../../../../services/api/admin/donate/bank-details-uah/bank-details-uah-api';
import { AxiosInstance } from 'axios';

export interface BankDetailsConfig<TItem extends FieldValues> {
    form: ForwardRefExoticComponent<GenericFormProps<TItem> & RefAttributes<GenericFormRef>>;
    createEmptyItem: (data: Partial<TItem>) => TItem;
    withCorrespondentBanks?: boolean;
    fetch: (client: AxiosInstance) => Promise<TItem[]>;
    create: (client: AxiosInstance, data: Omit<TItem, 'id'>) => Promise<TItem>;
    update: (client: AxiosInstance, id: number, data: Partial<TItem>) => Promise<TItem>;
    delete: (client: AxiosInstance, id: number) => Promise<void>;
    correspondentForm?: ForwardRefExoticComponent<GenericFormProps<any> & RefAttributes<GenericFormRef>>;
}

export const bankDetailsConfig: Record<string, BankDetailsConfig<any>> = {
    UAH: {
        form: createBankDetailsForm('UAH'),
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as UahBankDetailsType,
        fetch: (client) => BankDetailsUahApi.getAll(client),
        create: (client, data) => BankDetailsUahApi.create(client, data),
        update: (client, id, data) => BankDetailsUahApi.update(client, id, data),
        delete: (client, id) => BankDetailsUahApi.delete(client, id),
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
        create: async () => {
            throw new Error('Not implemented');
        },
        update: async () => {
            throw new Error('Not implemented');
        },
        delete: async () => {
            throw new Error('Not implemented');
        },
    },
    EUR: {
        form: createBankDetailsForm('EUR'),
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as ForeignBankDetailsType,
        withCorrespondentBanks: true,
        correspondentForm: CorrespondentBankDetailsForm,
        fetch: async () => {
            // TODO
            return [];
        },
        create: async () => {
            throw new Error('Not implemented');
        },
        update: async () => {
            throw new Error('Not implemented');
        },
        delete: async () => {
            throw new Error('Not implemented');
        },
    },
};
