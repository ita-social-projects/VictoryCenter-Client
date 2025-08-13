import './AbroadPaymentDetails.scss';
import { ABROAD_PAYMENT_DETAILS } from '../../../../const/donate-page/donate-page';
import { CorrespondentBanksSection } from './CorrespondentBanksSection';
import { PaymentDetailsSection } from './PaymentDetailsSection';
import { Currency, currencyToString } from '../../../../types/public/donate-page/Currency';

type AbroadCurrency = 'USD' | 'EUR';

export const AbroadPaymentDetails = ({ currency }: { currency: Exclude<Currency, Currency.UAH> }) => {
    const currencyString = currencyToString(currency) as AbroadCurrency;

    return (
        <div className="abroadPaymentDetails">
            <PaymentDetailsSection
                title={ABROAD_PAYMENT_DETAILS[`${currencyString}_PAYMENT_DETAILS_LABEL`]}
                ibanLabel={ABROAD_PAYMENT_DETAILS[`IBAN_${currencyString}_LABEL`]}
                ibanValue={ABROAD_PAYMENT_DETAILS[`IBAN_${currencyString}_NUMBER_LABEL`]}
            />

            <CorrespondentBanksSection currency={currency} />
        </div>
    );
};
