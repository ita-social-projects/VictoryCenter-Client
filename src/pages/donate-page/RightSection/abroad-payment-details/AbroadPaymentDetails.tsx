import React from 'react';
import './AbroadPaymentDetails.scss';
import { ABROAD_PAYMENT_DETAILS, PAYMENT_DETAILS_COMMON } from '../../../../const/donate-page/donate-page';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';

const PaymentLabelWithCopy = ({
    label,
    value,
    copyValue,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
    copyValue: string;
}) => (
    <div className="paymentLabel">
        <h3>{label}</h3>
        <div className="labelWithCopyButton">
            <span className="label">{value}</span>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);

const MultiFieldLabelWithCopy = ({
    label,
    values,
    copyValue,
}: {
    label: React.ReactNode;
    values: string[];
    copyValue: string;
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

const CorrespondentBankBlock = ({ title, fields }: { title: string; fields: { label: string; value: string }[] }) => (
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
                <h2>{ABROAD_PAYMENT_DETAILS.USD_PAYMENT_DETAILS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <PaymentLabelWithCopy
                        label={PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}
                        value={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                        copyValue={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.IBAN_USD_LABEL}
                        value={ABROAD_PAYMENT_DETAILS.IBAN_USD_NUMBER_LABEL}
                        copyValue={ABROAD_PAYMENT_DETAILS.IBAN_USD_NUMBER_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_LABEL}
                        value={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                        copyValue={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                    />
                    <MultiFieldLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.BANK_RECEIVER_LABEL}
                        values={[
                            ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL,
                            ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL,
                            ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                        ]}
                        copyValue={
                            ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL +
                            ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL +
                            ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                        }
                    />
                    <MultiFieldLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.ADDRESS_LABEL}
                        values={[ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL, ABROAD_PAYMENT_DETAILS.CITY_LABEL]}
                        copyValue={ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL + ABROAD_PAYMENT_DETAILS.CITY_LABEL}
                    />
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{ABROAD_PAYMENT_DETAILS.CORRESPONDENT_BANKS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.JP_MORGAN_CHASE_BANK_USA_LABEL}
                        fields={[
                            {
                                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.SWIFT_JP_MORGAN_CODE_USA_LABEL,
                            },
                            {
                                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_JP_MORGAN_CODE_USA_LABEL,
                            },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.BANK_OF_NEW_YORK_MELLON_USA_LABEL}
                        fields={[
                            {
                                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
                            },
                            {
                                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
                            },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.CITY_BANK_USA_LABEL}
                        fields={[
                            {
                                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.SWIFT_CITY_BANK_USA_CODE_LABEL,
                            },
                            {
                                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_CITY_BANK_USA_CODE_LABEL,
                            },
                        ]}
                    />
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{ABROAD_PAYMENT_DETAILS.EUR_PAYMENT_DETAILS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <PaymentLabelWithCopy
                        label={PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}
                        value={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                        copyValue={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.IBAN_EUR_LABEL}
                        value={ABROAD_PAYMENT_DETAILS.IBAN_EUR_NUMBER_LABEL}
                        copyValue={ABROAD_PAYMENT_DETAILS.IBAN_EUR_NUMBER_LABEL}
                    />
                    <PaymentLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_LABEL}
                        value={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                        copyValue={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                    />
                    <MultiFieldLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.BANK_RECEIVER_LABEL}
                        values={[
                            ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL,
                            ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL,
                            ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                        ]}
                        copyValue={
                            ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL +
                            ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL +
                            ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                        }
                    />
                    <MultiFieldLabelWithCopy
                        label={ABROAD_PAYMENT_DETAILS.ADDRESS_LABEL}
                        values={[ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL, ABROAD_PAYMENT_DETAILS.CITY_LABEL]}
                        copyValue={ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL + ABROAD_PAYMENT_DETAILS.CITY_LABEL}
                    />
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{ABROAD_PAYMENT_DETAILS.CORRESPONDENT_BANKS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.COMMERZBANK_AG_GERMANY_LABEL}
                        fields={[
                            {
                                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
                            },
                            {
                                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
                            },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.JP_MORGAN_AG_GERMANY_LABEL}
                        fields={[
                            {
                                label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
                            },
                            {
                                label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                                value: ABROAD_PAYMENT_DETAILS.ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
                            },
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL}
                        fields={[
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
                        ]}
                    />
                    <CorrespondentBankBlock
                        title={ABROAD_PAYMENT_DETAILS.CITY_BANK_IRELAND_LABEL}
                        fields={[
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
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};
