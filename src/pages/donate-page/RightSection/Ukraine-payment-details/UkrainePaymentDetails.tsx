import './UkrainePaymentDetails.scss';
import { UKRAINE_PAYMENT_DETAILS, PAYMENT_DETAILS_COMMON } from '../../../../const/donate-page/donate-page';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import React from 'react';

export const UkrainePaymentDetails = () => {
    return (
        <div className="UkrainePaymentDetails">
            <h2>{UKRAINE_PAYMENT_DETAILS.UKRAINE_PAYMENT_DETAILS_LABEL}</h2>
            <div className="paymentDetails">
                <div className="paymentLabel">
                    <h3>{PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}</span>
                        <CopyTextButton textToCopy={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.UIDSREOU_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{UKRAINE_PAYMENT_DETAILS.UIDSREOU_NUMBER_LABEL}</span>
                        <CopyTextButton textToCopy={UKRAINE_PAYMENT_DETAILS.UIDSREOU_NUMBER_LABEL} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.BANK_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL}</span>
                        <CopyTextButton textToCopy={UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{UKRAINE_PAYMENT_DETAILS.IBAN_UAH_NUMBER_LABEL}</span>
                        <CopyTextButton textToCopy={UKRAINE_PAYMENT_DETAILS.IBAN_UAH_NUMBER_LABEL} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_NAME_LABEL}</span>
                        <CopyTextButton textToCopy={UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_NAME_LABEL} />
                    </div>
                </div>
            </div>
        </div>
    );
};
