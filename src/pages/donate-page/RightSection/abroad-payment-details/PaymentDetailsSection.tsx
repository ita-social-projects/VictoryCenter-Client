import { PaymentLabelWithCopy } from './PaymentLabelWithCopy';
import { MultiFieldLabelWithCopy } from './MultiFieldLabelWithCopy';
import { PAYMENT_DETAILS_COMMON, ABROAD_PAYMENT_DETAILS } from '../../../../const/public/donate-page';

export const PaymentDetailsSection = ({
    title,
    ibanLabel,
    ibanValue,
}: {
    title: string;
    ibanLabel: string;
    ibanValue: string;
}) => (
    <div className="abroadPaymentDetailsBlock">
        <h2>{title}</h2>
        <div className="abroadPaymentDetailsContent">
            <PaymentLabelWithCopy
                label={PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}
                value={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                copyValue={PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
            />
            <PaymentLabelWithCopy label={ibanLabel} value={ibanValue} copyValue={ibanValue} />
            <PaymentLabelWithCopy
                label={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_LABEL}
                value={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                copyValue={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
            />
            <MultiFieldLabelWithCopy
                label={ABROAD_PAYMENT_DETAILS.BANK_RECEIVER_LABEL}
                values={[
                    ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL,
                    ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL,
                    ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                ]}
                copyValue={
                    ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL +
                    ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL +
                    ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                }
            />
            <MultiFieldLabelWithCopy
                label={ABROAD_PAYMENT_DETAILS.ADDRESS_LABEL}
                values={[ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL, ABROAD_PAYMENT_DETAILS.CITY_LABEL]}
                copyValue={ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL + ABROAD_PAYMENT_DETAILS.CITY_LABEL}
            />
        </div>
    </div>
);
