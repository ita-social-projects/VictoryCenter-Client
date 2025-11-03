import './UkrainePaymentDetails.scss';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import { UKRAINE_PAYMENT_DETAILS, PAYMENT_DETAILS_COMMON } from '../../../../../const/public/donate-page';
import { PublicUahBankDetailsDto } from '../../../../../types/public/donate-page';

interface UkrainePaymentDetailsProps {
    bankDetails: PublicUahBankDetailsDto[];
}

export const UkrainePaymentDetails = ({ bankDetails }: UkrainePaymentDetailsProps) => {
    const primaryBank = bankDetails[0];

    return (
        <div className="UkrainePaymentDetails">
            <h2>{UKRAINE_PAYMENT_DETAILS.UKRAINE_PAYMENT_DETAILS_LABEL}</h2>
            <div className="paymentDetails">
                <div className="paymentLabel">
                    <h3>{PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">
                            {primaryBank?.receiver || PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                        </span>
                        <CopyTextButton
                            textToCopy={primaryBank?.receiver || PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                        />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.UIDSREOU_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">
                            {primaryBank?.edrpou || UKRAINE_PAYMENT_DETAILS.UIDSREOU_NUMBER_LABEL}
                        </span>
                        <CopyTextButton
                            textToCopy={primaryBank?.edrpou || UKRAINE_PAYMENT_DETAILS.UIDSREOU_NUMBER_LABEL}
                        />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.BANK_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{primaryBank?.name || UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL}</span>
                        <CopyTextButton textToCopy={primaryBank?.name || UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL} />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">
                            {primaryBank?.iban || UKRAINE_PAYMENT_DETAILS.IBAN_UAH_NUMBER_LABEL}
                        </span>
                        <CopyTextButton
                            textToCopy={primaryBank?.iban || UKRAINE_PAYMENT_DETAILS.IBAN_UAH_NUMBER_LABEL}
                        />
                    </div>
                </div>
                <div className="paymentLabel">
                    <h3>{UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_LABEL}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">
                            {primaryBank?.paymentPurpose || UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_NAME_LABEL}
                        </span>
                        <CopyTextButton
                            textToCopy={
                                primaryBank?.paymentPurpose || UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_NAME_LABEL
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
