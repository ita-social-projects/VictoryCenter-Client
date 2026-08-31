import { useCallback, useState } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';

export const getUsdMismatchMessage = (
    amountUah: string,
    amountUsd: string,
    exchangeRate: string | null | undefined,
    mismatchMessage: string = FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH,
): string | undefined => (isUsdAmountMismatch(amountUah, amountUsd, exchangeRate) ? mismatchMessage : undefined);

export const useAmountBlur = (exchangeRate: string | null, customMismatchMessage?: string) => {
    const [usdMismatchMessage, setUsdMismatchMessage] = useState<string | undefined>();

    const handleAmountBlur = useCallback(
        (
            field: 'amountUah' | 'amountUsd',
            setFormState: React.Dispatch<React.SetStateAction<any>>,
            suppressMismatchCheck = false,
        ) => {
            setFormState((prev: any) => {
                const updated = {
                    ...prev,
                    ...updateFundsAmounts(field, prev[field], exchangeRate, 'blur')(prev),
                };

                setUsdMismatchMessage(
                    !suppressMismatchCheck
                        ? getUsdMismatchMessage(
                              updated.amountUah,
                              updated.amountUsd,
                              exchangeRate,
                              customMismatchMessage,
                          )
                        : undefined,
                );

                return updated;
            });
        },
        [exchangeRate, customMismatchMessage],
    );

    return { usdMismatchMessage, setUsdMismatchMessage, handleAmountBlur };
};
