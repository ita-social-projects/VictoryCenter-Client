import { useCallback } from 'react';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';

interface AmountEditState {
    recordId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    amountUah: string;
    amountUsd: string;
    errors: {
        amountUah?: string;
        amountUsd?: string;
    };
    usdMismatchMessage?: string;
}

interface UseFundsAmountEditParams<TState extends AmountEditState> {
    exchangeRate?: string | null;
    mismatchMessage: string;
    setEditState: (updater: (prev: TState | null) => TState | null) => void;
}

export const useFundsAmountEdit = <TState extends AmountEditState>({
    exchangeRate,
    mismatchMessage,
    setEditState,
}: UseFundsAmountEditParams<TState>) => {
    const applyAmountUpdate = useCallback(
        (prev: TState, field: 'amountUah' | 'amountUsd', value: string, trigger: 'change' | 'blur') => {
            const updatedAmounts = updateFundsAmounts(
                field,
                value,
                exchangeRate ?? null,
                trigger,
            )({
                amountUah: prev.amountUah,
                amountUsd: prev.amountUsd,
                errors: {
                    amountUah: prev.errors.amountUah,
                    amountUsd: prev.errors.amountUsd,
                },
            });

            return {
                ...prev,
                amountUah: updatedAmounts.amountUah,
                amountUsd: updatedAmounts.amountUsd,
                errors: {
                    ...prev.errors,
                    amountUah: updatedAmounts.errors.amountUah,
                    amountUsd: updatedAmounts.errors.amountUsd,
                },
            };
        },
        [exchangeRate],
    );

    const handleAmountChange = useCallback(
        (recordId: number, field: 'amountUah' | 'amountUsd', nextValue: string) => {
            setEditState((prev) => {
                if (prev?.recordId !== recordId) return prev;

                return {
                    ...applyAmountUpdate(prev, field, nextValue, 'change'),
                    usdMismatchMessage: undefined,
                };
            });
        },
        [applyAmountUpdate, setEditState],
    );

    const handleAmountBlur = useCallback(
        (recordId: number, field: 'amountUah' | 'amountUsd') => {
            setEditState((prev) => {
                if (prev?.recordId !== recordId) return prev;

                const nextState = applyAmountUpdate(prev, field, prev[field], 'blur');

                if (field === 'amountUsd') {
                    const hasMismatch = isUsdAmountMismatch(nextState.amountUah, nextState.amountUsd, exchangeRate);

                    return {
                        ...nextState,
                        usdMismatchMessage: hasMismatch ? mismatchMessage : undefined,
                    };
                }

                return { ...nextState, usdMismatchMessage: undefined };
            });
        },
        [applyAmountUpdate, exchangeRate, mismatchMessage, setEditState],
    );

    return { handleAmountChange, handleAmountBlur };
};
