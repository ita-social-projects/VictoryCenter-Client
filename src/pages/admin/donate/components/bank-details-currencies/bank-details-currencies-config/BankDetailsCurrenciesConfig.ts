import { ForwardRefExoticComponent, RefAttributes } from 'react';
import {
    UahBankDetailsDto,
    CreateUahBankDetails,
    UpdateUahBankDetails,
    ForeignBankDetailsDto,
    CreateForeignBankDetails,
    UpdateForeignBankDetails,
    BankCurrency,
} from '../../../../../../types/admin/donate';
import { GenericFormProps, GenericFormRef } from '../../generic-form/GenericForm';
import { FieldValues } from 'react-hook-form';
import { CorrespondentBankDetailsForm, createBankDetailsForm } from '../bank-details-factory/BankDetailsFactory';
import { BankDetailsUahApi } from '../../../../../../services/api/admin/donate/bank-details-uah/bank-details-uah-api';
import { ForeignBankDetailsApi } from '../../../../../../services/api/admin/donate/bank-details-foreign/bank-details-foreign-api';
import { AxiosInstance } from 'axios';

export interface BankDetailsConfig<TItem extends FieldValues, TCreate = any, TUpdate = any> {
    form: ForwardRefExoticComponent<GenericFormProps<TItem> & RefAttributes<GenericFormRef>>;
    createEmptyItem: (data: Partial<TItem>) => TItem;
    withCorrespondentBanks?: boolean;
    fetch: (client: AxiosInstance, currency?: BankCurrency) => Promise<TItem[]>;
    create: (client: AxiosInstance, data: TCreate) => Promise<TItem>;
    update: (client: AxiosInstance, id: number, data: TUpdate) => Promise<TItem>;
    delete: (client: AxiosInstance, id: number) => Promise<void>;
    correspondentForm?: ForwardRefExoticComponent<GenericFormProps<any> & RefAttributes<GenericFormRef>>;
    currency?: BankCurrency;
}

export const bankDetailsConfig: Record<string, BankDetailsConfig<any>> = {
    UAH: {
        form: createBankDetailsForm('UAH'),
        createEmptyItem: (data: Partial<UahBankDetailsDto>) => ({ ...data }) as UahBankDetailsDto,
        fetch: (client: AxiosInstance) => BankDetailsUahApi.getAll(client),
        create: (client: AxiosInstance, data: CreateUahBankDetails) => BankDetailsUahApi.create(client, data),
        update: (client: AxiosInstance, id: number, data: UpdateUahBankDetails) =>
            BankDetailsUahApi.update(client, id, data),
        delete: (client: AxiosInstance, id: number) => BankDetailsUahApi.delete(client, id),
    },
    USD: {
        form: createBankDetailsForm('USD'),
        createEmptyItem: (data: Partial<ForeignBankDetailsDto>) =>
            ({
                ...data,
                currency: BankCurrency.Usd,
                correspondentBanks: data.correspondentBanks || [],
            }) as ForeignBankDetailsDto,
        withCorrespondentBanks: true,
        correspondentForm: CorrespondentBankDetailsForm,
        currency: BankCurrency.Usd,
        fetch: (client: AxiosInstance) => ForeignBankDetailsApi.getAll(client, BankCurrency.Usd),
        create: (client: AxiosInstance, data: CreateForeignBankDetails) =>
            ForeignBankDetailsApi.create(client, { ...data, currency: BankCurrency.Usd }),
        update: (client: AxiosInstance, id: number, data: UpdateForeignBankDetails) =>
            ForeignBankDetailsApi.update(client, id, data),
        delete: (client: AxiosInstance, id: number) => ForeignBankDetailsApi.delete(client, id),
    },
    EUR: {
        form: createBankDetailsForm('EUR'),
        createEmptyItem: (data: Partial<ForeignBankDetailsDto>) =>
            ({
                ...data,
                currency: BankCurrency.Eur,
                correspondentBanks: data.correspondentBanks || [],
            }) as ForeignBankDetailsDto,
        withCorrespondentBanks: true,
        correspondentForm: CorrespondentBankDetailsForm,
        currency: BankCurrency.Eur,
        fetch: (client: AxiosInstance) => ForeignBankDetailsApi.getAll(client, BankCurrency.Eur),
        create: (client: AxiosInstance, data: CreateForeignBankDetails) =>
            ForeignBankDetailsApi.create(client, { ...data, currency: BankCurrency.Eur }),
        update: (client: AxiosInstance, id: number, data: UpdateForeignBankDetails) =>
            ForeignBankDetailsApi.update(client, id, data),
        delete: (client: AxiosInstance, id: number) => ForeignBankDetailsApi.delete(client, id),
    },
};
