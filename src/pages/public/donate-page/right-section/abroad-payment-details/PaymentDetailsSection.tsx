import { PaymentLabelWithCopy } from './PaymentLabelWithCopy';
import { MultiFieldLabelWithCopy } from './MultiFieldLabelWithCopy';
import { PAYMENT_DETAILS_COMMON, ABROAD_PAYMENT_DETAILS } from '../../../../../const/public/donate-page';

interface PaymentDetailsSectionProps {
    title: string;
    ibanLabel: string;
    ibanValue: string;
    receiverName?: string | null;
    bankName?: string | null;
    swift?: string | null;
    address?: string | null;
}

export const PaymentDetailsSection = ({
    title,
    ibanLabel,
    ibanValue,
    receiverName,
    bankName,
    swift,
    address,
}: PaymentDetailsSectionProps) => (
    <div className="abroadPaymentDetailsBlock">
        <h2>{title}</h2>
        <div className="abroadPaymentDetailsContent">
            <PaymentLabelWithCopy
                label={PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL}
                value={receiverName || PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                copyValue={receiverName || PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
            />
            <PaymentLabelWithCopy label={ibanLabel} value={ibanValue} copyValue={ibanValue} />
            <PaymentLabelWithCopy
                label={ABROAD_PAYMENT_DETAILS.SWIFT_CODE_LABEL}
                value={swift || ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                copyValue={swift || ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
            />
            <MultiFieldLabelWithCopy
                label={ABROAD_PAYMENT_DETAILS.BANK_RECEIVER_LABEL}
                values={[
                    bankName || ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL,
                    ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL,
                    ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                ]}
                copyValue={
                    (bankName || ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL) +
                    ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL +
                    ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                }
            />
            <MultiFieldLabelWithCopy
                label={ABROAD_PAYMENT_DETAILS.ADDRESS_LABEL}
                values={[address || ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL, ABROAD_PAYMENT_DETAILS.CITY_LABEL]}
                copyValue={(address || ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL) + ABROAD_PAYMENT_DETAILS.CITY_LABEL}
            />
        </div>
    </div>
);
