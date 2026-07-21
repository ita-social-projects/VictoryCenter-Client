import { useCallback, useState } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

export const getUsdMismatchMessage = (
    amountUah: string,
    amountUsd: string,
    exchangeRate: string | null | undefined,
    mismatchMessage: string = FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH,
): string | undefined =>
    isUsdAmountMismatch(amountUah, amountUsd, exchangeRate)
        ? mismatchMessage
        : undefined;

export const useAmountBlur = (exchangeRate: string | null, customMismatchMessage?: string) => {
    const [usdMismatchMessage, setUsdMismatchMessage] = useState<string | undefined>();

    const handleAmountBlur = useCallback(
        (
            field: 'amountUah' | 'amountUsd',
            setFormState: React.Dispatch<React.SetStateAction<any>>,
            suppressMismatchCheck = false,
        ) => {
            if (field === 'amountUsd') {
                setFormState((prev: any) => {
                    const normalizedAmountUsd = normalizeFundsExpendituresAmountInput(prev.amountUsd, true);
                    const amountUsdError = validateFundsExpendituresAmount(normalizedAmountUsd, 'blur');

                    setUsdMismatchMessage(
                        suppressMismatchCheck
                            ? undefined
                            : getUsdMismatchMessage(prev.amountUah, normalizedAmountUsd, exchangeRate, customMismatchMessage),
                    );

                    return {
                        ...prev,
                        amountUsd: normalizedAmountUsd,
                        errors: {
                            ...prev.errors,
                            amountUsd: amountUsdError,
                        },
                    };
                });
                return;
            }

            setFormState((prev: any) => {
                const updated = {
                    ...prev,
                    ...updateFundsAmounts(field, prev[field], exchangeRate, 'blur')(prev),
                };
                setUsdMismatchMessage(undefined);
                return updated;
            });
        },
        [exchangeRate],
    );

    return { usdMismatchMessage, setUsdMismatchMessage, handleAmountBlur };
};
