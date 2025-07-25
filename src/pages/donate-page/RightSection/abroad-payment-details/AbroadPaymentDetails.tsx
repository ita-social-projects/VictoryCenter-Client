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

export const AbroadPaymentDetails = () => {
    return (
        <div className="abroadPaymentDetails">
            <div className="abroadPaymentDetailsBlock">
                <h2>{USD_PAYMENT_DETAILS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <div className="paymentLabel">
                        <h3>{RECIPIENT_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{RECIPIENT_NAME_LABEL}</span>
                            <CopyTextButton textToCopy={RECIPIENT_NAME_LABEL} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{IBAN_USD_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{IBAN_USD_NUMBER_LABEL}</span>
                            <CopyTextButton textToCopy={IBAN_USD_NUMBER_LABEL} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{SWIFT_CODE_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{SWIFT_CODE_VALUE_LABEL}</span>
                            <CopyTextButton textToCopy={SWIFT_CODE_VALUE_LABEL} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{BANK_RECEIVER_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <div>
                                <p className="label">{BANK_NAME_TRANSLITERATED_LABEL}</p>
                                <p className="label">{BANK_STREET_TRANSLITERATED_LABEL}</p>
                                <p className="label">{BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL}</p>
                            </div>
                            <CopyTextButton
                                textToCopy={
                                    BANK_NAME_TRANSLITERATED_LABEL +
                                    BANK_STREET_TRANSLITERATED_LABEL +
                                    BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                                }
                            />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{ADDRESS_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <div>
                                <p className="label">{COUNTRY_LABEL}</p>
                                <p className="label">{CITY_LABEL}</p>
                            </div>
                            <CopyTextButton textToCopy={COUNTRY_LABEL + CITY_LABEL} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{CORRESPONDENT_BANKS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <div className="paymentLabel">
                        <h3>{JP_MORGAN_CHASE_BANK_USA_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_JP_MORGAN_CODE_USA_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_JP_MORGAN_CODE_USA_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">{ACCOUNT_JP_MORGAN_CODE_USA_LABEL}</span>
                                    <CopyTextButton textToCopy={ACCOUNT_JP_MORGAN_CODE_USA_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{BANK_OF_NEW_YORK_MELLON_USA_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">{ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{CITY_BANK_USA_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_CITY_BANK_USA_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_CITY_BANK_USA_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">{ACCOUNT_CITY_BANK_USA_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={ACCOUNT_CITY_BANK_USA_CODE_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{EUR_PAYMENT_DETAILS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <div className="paymentLabel">
                        <h3>{RECIPIENT_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{RECIPIENT_NAME_LABEL}</span>
                            <CopyTextButton textToCopy={RECIPIENT_NAME_LABEL} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{IBAN_EUR_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{IBAN_EUR_NUMBER_LABEL}</span>
                            <CopyTextButton textToCopy={IBAN_EUR_NUMBER_LABEL} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{SWIFT_CODE_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{SWIFT_CODE_VALUE_LABEL}</span>
                            <CopyTextButton textToCopy={SWIFT_CODE_VALUE_LABEL} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{BANK_RECEIVER_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <div>
                                <p className="label">{BANK_NAME_TRANSLITERATED_LABEL}</p>
                                <p className="label">{BANK_STREET_TRANSLITERATED_LABEL}</p>
                                <p className="label">{BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL}</p>
                            </div>
                            <CopyTextButton
                                textToCopy={
                                    BANK_NAME_TRANSLITERATED_LABEL +
                                    BANK_STREET_TRANSLITERATED_LABEL +
                                    BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                                }
                            />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{ADDRESS_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <div>
                                <p className="label">{COUNTRY_LABEL}</p>
                                <p className="label">{CITY_LABEL}</p>
                            </div>
                            <CopyTextButton textToCopy={COUNTRY_LABEL + CITY_LABEL} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="abroadPaymentDetailsBlock">
                <h2>{CORRESPONDENT_BANKS_LABEL}</h2>
                <div className="abroadPaymentDetailsContent">
                    <div className="paymentLabel">
                        <h3>{COMMERZBANK_AG_GERMANY_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">{ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{JP_MORGAN_AG_GERMANY_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">{ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">
                                        {ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL}
                                    </span>
                                    <CopyTextButton textToCopy={ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{IBAN_LABEL}</span>
                                    <span className="label">{IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{CITY_BANK_IRELAND_LABEL}</h3>
                        <div className="labelsContainers">
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{SWIFT_LABEL}</span>
                                    <span className="label">{SWIFT_CITY_BANK_IRELAND_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={SWIFT_CITY_BANK_IRELAND_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{ACCOUNT_LABEL}</span>
                                    <span className="label">{ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL} />
                                </div>
                            </div>
                            <div className="labelsContainer">
                                <div className="labelWithCopyButton">
                                    <span className="highlightedLabel">{IBAN_LABEL}</span>
                                    <span className="label">{IBAN_CITY_BANK_IRELAND_CODE_LABEL}</span>
                                    <CopyTextButton textToCopy={IBAN_CITY_BANK_IRELAND_CODE_LABEL} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
