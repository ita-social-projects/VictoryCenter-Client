import React from 'react';
import './AbroadPaymentDetails.scss';
import {
    ADDRESS_LABEL,
    BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
    BANK_NAME_TRANSLITERATED_LABEL,
    BANK_RECEIVER_LABEL,
    BANK_STREET_TRANSLITERATED_LABEL,
    CITY_LABEL,
    COUNTRY_LABEL,
    IBAN_USD_LABEL,
    IBAN_USD_NUMBER_LABEL,
    RECIPIENT_LABEL,
    RECIPIENT_NAME_LABEL,
    SWIFT_CODE_VALUE_LABEL,
    SWIFT_CODE_LABEL,
    USD_PAYMENT_DETAILS_LABEL,
    CORRESPONDENT_BANKS_LABEL,
    JP_MORGAN_CHASE_BANK_USA_LABEL,
    SWIFT_LABEL,
    SWIFT_JP_MORGAN_CODE_USA_LABEL,
    ACCOUNT_LABEL,
    ACCOUNT_JP_MORGAN_CODE_USA_LABEL,
    BANK_OF_NEW_YORK_MELLON_USA_LABEL,
    SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
    ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
    CITY_BANK_USA_LABEL,
    SWIFT_CITY_BANK_USA_CODE_LABEL,
    ACCOUNT_CITY_BANK_USA_CODE_LABEL,
    EUR_PAYMENT_DETAILS_LABEL,
    IBAN_EUR_LABEL,
    IBAN_EUR_NUMBER_LABEL,
    COMMERZBANK_AG_GERMANY_LABEL,
    SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
    ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
    JP_MORGAN_AG_GERMANY_LABEL,
    SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
    ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
    BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL,
    SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
    ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
    IBAN_LABEL,
    IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
    CITY_BANK_IRELAND_LABEL,
    SWIFT_CITY_BANK_IRELAND_CODE_LABEL,
    ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL,
    IBAN_CITY_BANK_IRELAND_CODE_LABEL,
} from '../../../../const/donate-page/donate-page';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';

const PaymentLabelWithCopy: React.FC<{ label: React.ReactNode; value: React.ReactNode; copyValue: string }> = ({
    label,
    value,
    copyValue,
}) => (
    <div className="paymentLabel">
        <h3>{label}</h3>
        <div className="labelWithCopyButton">
            <span className="label">{value}</span>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);

const MultiFieldLabelWithCopy: React.FC<{ label: React.ReactNode; values: string[]; copyValue: string }> = ({
    label,
    values,
    copyValue,
}) => (
    <div className="paymentLabel">
        <h3>{label}</h3>
        <div className="labelWithCopyButton">
            <div>
                {values.map((v) => (
                    <p className="label" key={v}>
                        {v}
                    </p>
                ))}
            </div>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);

const CorrespondentBankBlock: React.FC<{ title: string; fields: { label: string; value: string }[] }> = ({
    title,
    fields,
}) => (
    <div className="paymentLabel">
        <h3>{title}</h3>
        <div className="labelsContainers">
            {fields.map((f) => (
                <div className="labelsContainer" key={`${f.label}-${f.value}`}>
                    <div className="labelWithCopyButton">
                        <span className="highlightedLabel">{f.label}</span>
                        <span className="label">{f.value}</span>
                        <CopyTextButton textToCopy={f.value} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const AbroadPaymentDetails = () => {
    return (
        <div className="abroadPaymentDetails">
            <div className="abroadPaymentDetailsBlock">
                <h2>{USD_PAYMENT_DETAILS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <PaymentLabelWithCopy
                        label={RECIPIENT_LABEL}
                        value={RECIPIENT_NAME_LABEL}
                        copyValue={RECIPIENT_NAME_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={IBAN_USD_LABEL}
                        value={IBAN_USD_NUMBER_LABEL}
                        copyValue={IBAN_USD_NUMBER_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={SWIFT_CODE_LABEL}
                        value={SWIFT_CODE_VALUE_LABEL}
                        copyValue={SWIFT_CODE_VALUE_LABEL}
                    />
                    <MultiFieldLabelWithCopy
                        label={BANK_RECEIVER_LABEL}
                        values={[
                            BANK_NAME_TRANSLITERATED_LABEL,
                            BANK_STREET_TRANSLITERATED_LABEL,
                            BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                        ]}
                        copyValue={
                            BANK_NAME_TRANSLITERATED_LABEL +
                            BANK_STREET_TRANSLITERATED_LABEL +
                            BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                        }
                    />
                    <MultiFieldLabelWithCopy
                        label={ADDRESS_LABEL}
                        values={[COUNTRY_LABEL, CITY_LABEL]}
                        copyValue={COUNTRY_LABEL + CITY_LABEL}
                    />
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{CORRESPONDENT_BANKS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <CorrespondentBankBlock
                        title={JP_MORGAN_CHASE_BANK_USA_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_JP_MORGAN_CODE_USA_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_JP_MORGAN_CODE_USA_LABEL },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={BANK_OF_NEW_YORK_MELLON_USA_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={CITY_BANK_USA_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_CITY_BANK_USA_CODE_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_CITY_BANK_USA_CODE_LABEL },
                        ]}
                    />
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{EUR_PAYMENT_DETAILS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <PaymentLabelWithCopy
                        label={RECIPIENT_LABEL}
                        value={RECIPIENT_NAME_LABEL}
                        copyValue={RECIPIENT_NAME_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={IBAN_EUR_LABEL}
                        value={IBAN_EUR_NUMBER_LABEL}
                        copyValue={IBAN_EUR_NUMBER_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={SWIFT_CODE_LABEL}
                        value={SWIFT_CODE_VALUE_LABEL}
                        copyValue={SWIFT_CODE_VALUE_LABEL}
                    />
                    <MultiFieldLabelWithCopy
                        label={BANK_RECEIVER_LABEL}
                        values={[
                            BANK_NAME_TRANSLITERATED_LABEL,
                            BANK_STREET_TRANSLITERATED_LABEL,
                            BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                        ]}
                        copyValue={
                            BANK_NAME_TRANSLITERATED_LABEL +
                            BANK_STREET_TRANSLITERATED_LABEL +
                            BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                        }
                    />
                    <MultiFieldLabelWithCopy
                        label={ADDRESS_LABEL}
                        values={[COUNTRY_LABEL, CITY_LABEL]}
                        copyValue={COUNTRY_LABEL + CITY_LABEL}
                    />
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{CORRESPONDENT_BANKS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <CorrespondentBankBlock
                        title={COMMERZBANK_AG_GERMANY_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={JP_MORGAN_AG_GERMANY_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL },
                            { label: IBAN_LABEL, value: IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={CITY_BANK_IRELAND_LABEL}
                        fields={[
                            { label: SWIFT_LABEL, value: SWIFT_CITY_BANK_IRELAND_CODE_LABEL },
                            { label: ACCOUNT_LABEL, value: ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL },
                            { label: IBAN_LABEL, value: IBAN_CITY_BANK_IRELAND_CODE_LABEL },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};
