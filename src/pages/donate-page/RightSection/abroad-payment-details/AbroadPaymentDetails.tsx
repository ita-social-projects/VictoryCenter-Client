import React from 'react';
import './AbroadPaymentDetails.scss';
import { ABROAD_PAYMENT_DETAILS } from '../../../../const/donate-page/donate-page';
import { CorrespondentBanksSection } from './CorrespondentBanksSection';
import { PaymentDetailsSection } from './PaymentDetailsSection';

export const USD_CORRESPONDENT_BANKS = [
    {
        title: ABROAD_PAYMENT_DETAILS.JP_MORGAN_CHASE_BANK_USA_LABEL,
        fields: [
            { label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL, value: ABROAD_PAYMENT_DETAILS.SWIFT_JP_MORGAN_CODE_USA_LABEL },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_JP_MORGAN_CODE_USA_LABEL,
            },
        ],
    },
    {
        title: ABROAD_PAYMENT_DETAILS.BANK_OF_NEW_YORK_MELLON_USA_LABEL,
        fields: [
            {
                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
            },
        ],
    },
    {
        title: ABROAD_PAYMENT_DETAILS.CITY_BANK_USA_LABEL,
        fields: [
            { label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL, value: ABROAD_PAYMENT_DETAILS.SWIFT_CITY_BANK_USA_CODE_LABEL },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_CITY_BANK_USA_CODE_LABEL,
            },
        ],
    },
];

export const EUR_CORRESPONDENT_BANKS = [
    {
        title: ABROAD_PAYMENT_DETAILS.COMMERZBANK_AG_GERMANY_LABEL,
        fields: [
            {
                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
            },
        ],
    },
    {
        title: ABROAD_PAYMENT_DETAILS.JP_MORGAN_AG_GERMANY_LABEL,
        fields: [
            {
                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
            },
        ],
    },
    {
        title: ABROAD_PAYMENT_DETAILS.BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL,
        fields: [
            {
                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.IBAN_LABEL,
                value: ABROAD_PAYMENT_DETAILS.IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
            },
        ],
    },
    {
        title: ABROAD_PAYMENT_DETAILS.CITY_BANK_IRELAND_LABEL,
        fields: [
            {
                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.SWIFT_CITY_BANK_IRELAND_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL,
            },
            {
                label: ABROAD_PAYMENT_DETAILS.IBAN_LABEL,
                value: ABROAD_PAYMENT_DETAILS.IBAN_CITY_BANK_IRELAND_CODE_LABEL,
            },
        ],
    },
];

export const AbroadPaymentDetails = () => {
    return (
        <div className="abroadPaymentDetails">
            <PaymentDetailsSection
                title={ABROAD_PAYMENT_DETAILS.USD_PAYMENT_DETAILS_LABEL}
                ibanLabel={ABROAD_PAYMENT_DETAILS.IBAN_USD_LABEL}
                ibanValue={ABROAD_PAYMENT_DETAILS.IBAN_USD_NUMBER_LABEL}
            />

            <CorrespondentBanksSection banks={USD_CORRESPONDENT_BANKS} />

            <PaymentDetailsSection
                title={ABROAD_PAYMENT_DETAILS.EUR_PAYMENT_DETAILS_LABEL}
                ibanLabel={ABROAD_PAYMENT_DETAILS.IBAN_EUR_LABEL}
                ibanValue={ABROAD_PAYMENT_DETAILS.IBAN_EUR_NUMBER_LABEL}
            />

            <CorrespondentBanksSection banks={EUR_CORRESPONDENT_BANKS} />
        </div>
    );
};
