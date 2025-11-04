import './AbroadPaymentDetails.scss';
import { CorrespondentBanksSection } from './CorrespondentBanksSection';
import { PaymentDetailsSection } from './PaymentDetailsSection';
import { Currency, PublishedForeignBankDetailsDto } from '../../../../../types/public/donate-page';
import { ABROAD_PAYMENT_DETAILS } from '../../../../../const/public/donate-page';
import { currencyToString } from '../../../../../utils/functions/mappers/public/donate';

type AbroadCurrency = 'USD' | 'EUR';

interface AbroadPaymentDetailsProps {
    currency: Exclude<Currency, Currency.UAH>;
    foreignBankDetails: PublishedForeignBankDetailsDto[];
}

export const AbroadPaymentDetails = ({ currency, foreignBankDetails }: AbroadPaymentDetailsProps) => {
    const primary = foreignBankDetails[0];

    if (!primary) {
        return null;
    }

    const currencyString = currencyToString(currency) as AbroadCurrency;
    const title = ABROAD_PAYMENT_DETAILS[`${currencyString}_PAYMENT_DETAILS_LABEL`];
    const ibanLabel = ABROAD_PAYMENT_DETAILS[`IBAN_${currencyString}_LABEL`];

    return (
        <div className="abroadPaymentDetails">
            <PaymentDetailsSection
                title={title}
                ibanLabel={ibanLabel}
                ibanValue={primary.iban}
                receiverName={primary.receiver}
                bankName={primary.name}
                swift={primary.swift}
                address={primary.address}
            />

            <CorrespondentBanksSection correspondentBanks={primary.correspondentBanks || []} />
        </div>
    );
};
