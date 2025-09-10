import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { UahBankDetailsType, UsdBankDetailsType } from '../../../../../types/admin/donate';
import { GenericFormProps, GenericFormRef } from '../generic-form/GenericForm';
import { UahBankDetailsForm } from './UahBankDetails';
import { CorrespondentBankDetialsForm, UsdBankDetailsForm } from './UsdBankDetails';
import { FieldValues } from 'react-hook-form';
import { EurBankDetailsForm } from './EurBankDetails';

export interface BankDetailsConfig<TItem extends FieldValues> {
    form: ForwardRefExoticComponent<GenericFormProps<TItem> & RefAttributes<GenericFormRef>>;
    createEmptyItem: (data: Partial<TItem>) => TItem;
    withCorrespondentBanks?: boolean;
    fetch: () => Promise<TItem[]>;
    correspondentForm?: ForwardRefExoticComponent<GenericFormProps<any> & RefAttributes<GenericFormRef>>;
}

export const bankDetailsConfig: Record<string, BankDetailsConfig<any>> = {
    UAH: {
        form: UahBankDetailsForm,
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as UahBankDetailsType,
        fetch: async () => {
            // TODO
            return [
                {
                    id: 1,
                    name: 'UAH Account',
                    receiver: 'Some Receiver',
                    iban: '444444444444444444444444444',
                    edrpou: '88888888',
                    paymentPurpose: 'Purpose',
                },
            ];
        },
    },
    USD: {
        form: UsdBankDetailsForm,
        createEmptyItem: (data) => ({ id: Date.now(), ...data }) as UsdBankDetailsType,
        withCorrespondentBanks: true,
        correspondentForm: CorrespondentBankDetialsForm,
        fetch: async () => {
            // TODO
            return [
                {
                    id: 1,
                    name: 'Main USD Account',
                    receiver: 'Some Receiver',
                    iban: 'US123...',
                    swift: 'Uadsfadf',
                    address: 'aboba',
                    correspondentBanks: [
                        {
                            id: 1,
                            name: 'Commerzbank AG, Frankfurt am Main, Germany',
                            swift: 'COBADEFF',
                            account: '400886700401',
                        },
                        {
                            id: 2,
                            name: 'J.P. Morgan AG, Frankfurt am Main, Germany',
                            swift: 'CHASDEFX',
                            account: '6231605145',
                        },
                        {
                            id: 3,
                            name: 'Citibank Europe PLC, Ireland',
                            swift: 'CITIIE2X',
                            account: '0042997188',
                            iban: 'IE96CITI99005142997188',
                        },
                    ],
                },
            ];
        },
    },
    EUR: {
        form: EurBankDetailsForm,
        createEmptyItem: (data: any) => ({ id: Date.now(), ...data }),
        fetch: async () => {
            // TODO
            return [];
        },
    },
};
