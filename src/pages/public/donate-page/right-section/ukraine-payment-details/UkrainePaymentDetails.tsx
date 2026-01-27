import './UkrainePaymentDetails.scss';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import { UKRAINE_PAYMENT_DETAILS } from '@/const/public/donate-page';
import { PublishedUahBankDetailsDto } from '@/types/public/donate-page';
import { useTranslation } from 'react-i18next';

interface UkrainePaymentDetailsProps {
    bankDetails: PublishedUahBankDetailsDto[];
}

export const UkrainePaymentDetails = ({ bankDetails }: UkrainePaymentDetailsProps) => {
    const { t } = useTranslation('donatePage');
    if (!bankDetails.length) {
        return null;
    }

    const sortedBankDetails = bankDetails.toSorted((a, b) => b.id - a.id);

    return (
        <div className="UkrainePaymentDetails">
            <h2>{t('UKRAINE_PAYMENT_DETAILS_LABEL')}</h2>
            {sortedBankDetails.map((bank, index) => (
                <div key={bank.id} className={`paymentDetails ${index > 0 ? 'separated' : ''}`}>
                    <div className="paymentLabel">
                        <h3>{t('PAYMENT_DETAILS_COMMON_RECIPIENT_LABEL')}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{bank.receiver}</span>
                            <CopyTextButton textToCopy={bank.receiver} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{t('UKRAINE_UIDSREOU_LABEL')}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{bank.edrpou}</span>
                            <CopyTextButton textToCopy={bank.edrpou} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{t('PAYMENT_DETAILS_COMMON_BANK_LABEL')}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{bank.name}</span>
                            <CopyTextButton textToCopy={bank.name} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{bank.ukrainianIban}</span>
                            <CopyTextButton textToCopy={bank.ukrainianIban} />
                        </div>
                    </div>
                    <div className="paymentLabel">
                        <h3>{t('UKRAINE_PAYMENT_DESTINATION_LABEL')}</h3>
                        <div className="labelWithCopyButton">
                            <span className="label">{bank.paymentPurpose}</span>
                            <CopyTextButton textToCopy={bank.paymentPurpose} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
