import './UkrainePaymentDetails.scss';
import {
    BANK_LABEL,
    BANK_NAME_LABEL,
    IBAN_UAH_LABEL,
    IBAN_UAH_NUMBER_LABEL,
    PAYMENT_DESTINATION_LABEL,
    PAYMENT_DESTINATION_NAME_LABEL,
    RECIPIENT_LABEL,
    RECIPIENT_NAME_LABEL,
    UIDSREOU_LABEL,
    UIDSREOU_NUMBER_LABEL,
    UKRAINE_PAYMENT_DETAILS_LABEL,
} from '../../../../const/donate-page/donate-page';

export const UkrainePaymentDetails = () => {
    return (
        <div className="UkrainePaymentDetails">
            <h2>{UKRAINE_PAYMENT_DETAILS_LABEL}</h2>
            <div className="paymentDetails">
                <div className="paymentLabel">
                    <h3>{RECIPIENT_LABEL}</h3>
                    <span className="label">{RECIPIENT_NAME_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{UIDSREOU_LABEL}</h3>
                    <span className="label">{UIDSREOU_NUMBER_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{BANK_LABEL}</h3>
                    <span className="label">{BANK_NAME_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{IBAN_UAH_LABEL}</h3>
                    <span className="label">{IBAN_UAH_NUMBER_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{PAYMENT_DESTINATION_LABEL}</h3>
                    <span className="label">{PAYMENT_DESTINATION_NAME_LABEL}</span>
                </div>
            </div>
        </div>
    );
};
