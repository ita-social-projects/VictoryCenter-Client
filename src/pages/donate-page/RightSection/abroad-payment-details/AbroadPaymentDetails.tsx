import React from 'react';
import './AbroadPaymentDetails.scss';
import { CURRENCY } from '../../../../const/donate-page/donate-page';
import { ABROAD_PAYMENT_DETAILS } from '../../../../const/donate-page/donate-page';
import { CORRESPONDENT_BANKS } from '../../../../const/donate-page/donate-page';
import { CorrespondentBanksSection } from './CorrespondentBanksSection';
import { PaymentDetailsSection } from './PaymentDetailsSection';

export const AbroadPaymentDetails = ({ currency }: { currency: keyof typeof CURRENCY }) => {
    return (
        <div className="abroadPaymentDetails">
            <PaymentDetailsSection
                title={ABROAD_PAYMENT_DETAILS[`${currency}_PAYMENT_DETAILS_LABEL`]}
                ibanLabel={ABROAD_PAYMENT_DETAILS[`IBAN_${currency}_LABEL`]}
                ibanValue={ABROAD_PAYMENT_DETAILS[`IBAN_${currency}_NUMBER_LABEL`]}
            />

            <CorrespondentBanksSection banks={CORRESPONDENT_BANKS[currency]} />
        </div>
    );
};
