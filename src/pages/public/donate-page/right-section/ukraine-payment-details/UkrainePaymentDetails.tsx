import './UkrainePaymentDetails.scss';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import { UKRAINE_PAYMENT_DETAILS, PAYMENT_DETAILS_COMMON } from '../../../../../const/public/donate-page';
import { PublishedUahBankDetailsDto } from '../../../../../types/public/donate-page';

interface UkrainePaymentDetailsProps {
    bankDetails: PublishedUahBankDetailsDto[];
}

export const UkrainePaymentDetails = ({ bankDetails }: UkrainePaymentDetailsProps) => {
    const primaryBank = bankDetails[0];

    if (!primaryBank) {
        return null;
    }

    return (
        <div className="UkrainePaymentDetails">
            <h2>{UKRAINE_PAYMENT_DETAILS.UKRAINE_PAYMENT_DETAILS_LABEL}</h2>
            <div className="paymentDetails">
                <div className="paymentLabel">
                    <h3>{PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{primaryBank.receiver}</span>
                        <CopyTextButton textToCopy={primaryBank.receiver} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.UIDSREOU_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{primaryBank.edrpou}</span>
                        <CopyTextButton textToCopy={primaryBank.edrpou} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.BANK_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{primaryBank.name}</span>
                        <CopyTextButton textToCopy={primaryBank.name} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{primaryBank.iban}</span>
                        <CopyTextButton textToCopy={primaryBank.iban} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{primaryBank.paymentPurpose}</span>
                        <CopyTextButton textToCopy={primaryBank.paymentPurpose} />
                    </div>
                </div>
            </div>
        </div>
    );
};
