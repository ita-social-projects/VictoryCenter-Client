import styles from './AbroadPaymentDetails.module.scss';
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
    if (!foreignBankDetails.length) {
        return null;
    }

    const currencyString = currencyToString(currency) as AbroadCurrency;
    const title = ABROAD_PAYMENT_DETAILS[`${currencyString}_PAYMENT_DETAILS_LABEL`];
    const ibanLabel = ABROAD_PAYMENT_DETAILS[`IBAN_${currencyString}_LABEL`];

    return (
        <div className={styles['abroadPaymentDetails']}>
            {foreignBankDetails.map((bank, index) => (
                <div key={bank.id} className={`${styles['bankGroup']} ${index > 0 ? styles['separated'] : ''}`}>
                    <PaymentDetailsSection
                        title={index === 0 ? title : ''}
                        ibanLabel={ibanLabel}
                        ibanValue={bank.iban}
                        receiverName={bank.receiver}
                        bankName={bank.name}
                        swift={bank.swift}
                        address={bank.address}
                    />

                    <CorrespondentBanksSection correspondentBanks={bank.correspondentBanks || []} />
                </div>
            ))}
        </div>
    );
};
