import './AbroadPaymentDetails.scss';
import {
    ADDRESS_LABEL,
    BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
    BANK_NAME_TRANSLITERATED_LABEL,
    BANK_RECEIVER_LABEL,
    BANK_STREET_TRANSLITERATED_LABEL,
    CITY_LABEL,
    COUNTRY_LABEL,
    IBAN_USD_LABEL,
    IBAN_USD_NUMBER_LABEL,
    RECIPIENT_LABEL,
    RECIPIENT_NAME_LABEL,
    SWIFT_CODE_LABEL,
    SWIFT_LABEL,
    USD_PAYMENT_DETAILS_LABEL,
} from '../../../../const/donate-page/donate-page';

export const AbroadPaymentDetails = () => {
    return (
        <div className="abroadPaymentDetails">
            <h2>{USD_PAYMENT_DETAILS_LABEL}</h2>
            <div className="abroadPaymentDetailsContent">
                <div className="paymentLabel">
                    <h3>{RECIPIENT_LABEL}</h3>
                    <span className="label">{RECIPIENT_NAME_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{IBAN_USD_LABEL}</h3>
                    <span className="label">{IBAN_USD_NUMBER_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{SWIFT_LABEL}</h3>
                    <span className="label">{SWIFT_CODE_LABEL}</span>
                </div>
                <div className="paymentLabel">
                    <h3>{BANK_RECEIVER_LABEL}</h3>
                    <p className="label">{BANK_NAME_TRANSLITERATED_LABEL}</p>
                    <p className="label">{BANK_STREET_TRANSLITERATED_LABEL}</p>
                    <p className="label">{BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL}</p>
                </div>
                <div className="paymentLabel">
                    <h3>{ADDRESS_LABEL}</h3>
                    <p className="label">{COUNTRY_LABEL}</p>
                    <p className="label">{CITY_LABEL}</p>
                </div>
            </div>
        </div>
    );
};
