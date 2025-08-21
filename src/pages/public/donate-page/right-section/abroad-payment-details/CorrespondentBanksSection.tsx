import { ABROAD_PAYMENT_DETAILS, CORRESPONDENT_BANKS } from '../../../../../const/public/donate-page';
import { CorrespondentBankBlock } from './CorrespondentBankBlock';
import { Currency, currencyToString } from '../../../../../types/public/donate-page';

type CorrespondentBankCurrency = keyof typeof CORRESPONDENT_BANKS;

export const CorrespondentBanksSection = ({ currency }: { currency: Currency }) => {
    const currencyString = currencyToString(currency) as CorrespondentBankCurrency;
    const banks = CORRESPONDENT_BANKS[currencyString] || [];

    return (
        <div className="abroadPaymentDetailsBlock">
            <h2>{ABROAD_PAYMENT_DETAILS.CORRESPONDENT_BANKS_LABEL}</h2>
            <div className="abroadPaymentDetailsContent">
                {banks.map((bank) => (
                    <CorrespondentBankBlock key={bank.title} title={bank.title} fields={bank.fields} />
                ))}
            </div>
        </div>
    );
};
