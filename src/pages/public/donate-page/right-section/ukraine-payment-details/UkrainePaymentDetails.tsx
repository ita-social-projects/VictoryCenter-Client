import styles from './UkrainePaymentDetails.module.scss';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import { UKRAINE_PAYMENT_DETAILS, PAYMENT_DETAILS_COMMON } from '../../../../../const/public/donate-page';
import { PublishedUahBankDetailsDto } from '../../../../../types/public/donate-page';

interface UkrainePaymentDetailsProps {
    bankDetails: PublishedUahBankDetailsDto[];
}

export const UkrainePaymentDetails = ({ bankDetails }: UkrainePaymentDetailsProps) => {
    if (!bankDetails.length) {
        return null;
    }

    return (
        <div className={styles['UkrainePaymentDetails']}>
            <h2>{UKRAINE_PAYMENT_DETAILS.UKRAINE_PAYMENT_DETAILS_LABEL}</h2>
            {bankDetails.map((bank, index) => (
                <div
                    key={bank.id}
                    className={`${styles['paymentDetails']} ${index > 0 ? `${styles['separated']}` : ''}`}
                >
                    <div className={styles['paymentLabel']}>
                        <h3>{PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}</h3>
                        <div className={styles['labelWithCopyButton']}>
                            <span className={styles['label']}>{bank.receiver}</span>
                            <CopyTextButton textToCopy={bank.receiver} />
                        </div>
                    </div>
                    <div className={styles['paymentLabel']}>
                        <h3>{UKRAINE_PAYMENT_DETAILS.UIDSREOU_LABEL}</h3>
                        <div className={styles['labelWithCopyButton']}>
                            <span className={styles['label']}>{bank.edrpou}</span>
                            <CopyTextButton textToCopy={bank.edrpou} />
                        </div>
                    </div>
                    <div className={styles['paymentLabel']}>
                        <h3>{UKRAINE_PAYMENT_DETAILS.BANK_LABEL}</h3>
                        <div className={styles['labelWithCopyButton']}>
                            <span className={styles['label']}>{bank.name}</span>
                            <CopyTextButton textToCopy={bank.name} />
                        </div>
                    </div>
                    <div className={styles['paymentLabel']}>
                        <h3>{UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL}</h3>
                        <div className={styles['labelWithCopyButton']}>
                            <span className={styles['label']}>{bank.iban}</span>
                            <CopyTextButton textToCopy={bank.iban} />
                        </div>
                    </div>
                    <div className={styles['paymentLabel']}>
                        <h3>{UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_LABEL}</h3>
                        <div className={styles['labelWithCopyButton']}>
                            <span className={styles['label']}>{bank.paymentPurpose}</span>
                            <CopyTextButton textToCopy={bank.paymentPurpose} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
