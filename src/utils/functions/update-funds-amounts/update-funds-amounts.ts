import {
    AmountConversionDirection,
    getConvertedAmount,
} from '@/utils/functions/get-converted-amount/get-converted-amount';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

export interface FundsAmountsState {
    amountUah: string;
    amountUsd: string;
    errors: {
        amountUah?: string;
        amountUsd?: string;
    };
}

interface OppositeAmount {
    amount: string;
    error?: string;
}

const computeOppositeAmount = (
    normalized: string,
    currentFieldError: string | undefined,
    exchangeRate: string | null,
    trigger: 'change' | 'blur',
    direction: AmountConversionDirection,
    fallback: OppositeAmount,
): OppositeAmount => {
    if (normalized === '') {
        return { amount: '', error: undefined };
    }

    if (currentFieldError) {
        return fallback;
    }

    const convertedAmount = getConvertedAmount(normalized, exchangeRate, direction);

    if (convertedAmount === null) {
        return fallback;
    }

    return { amount: convertedAmount, error: validateFundsExpendituresAmount(convertedAmount, trigger) };
};

export interface UpdateFundsAmountsOptions {
    allowReverseConversion?: boolean;
}

export const updateFundsAmounts = (
    field: 'amountUah' | 'amountUsd',
    value: string,
    exchangeRate: string | null,
    trigger: 'change' | 'blur',
    options: UpdateFundsAmountsOptions = {},
): ((prev: FundsAmountsState) => FundsAmountsState) => {
    const { allowReverseConversion = true } = options;

    return (prev: FundsAmountsState) => {
        const shouldNormalize = trigger === 'blur';
        const normalized = normalizeFundsExpendituresAmountInput(value, shouldNormalize);
        const currentFieldError = validateFundsExpendituresAmount(value, trigger);

        const direction: AmountConversionDirection = field === 'amountUah' ? 'uahToUsd' : 'usdToUah';
        const fallback: OppositeAmount =
            field === 'amountUah'
                ? { amount: prev.amountUsd, error: prev.errors.amountUsd }
                : { amount: prev.amountUah, error: prev.errors.amountUah };

        const shouldConvertOpposite = field === 'amountUah' || allowReverseConversion;

        const opposite = shouldConvertOpposite
            ? computeOppositeAmount(normalized, currentFieldError, exchangeRate, trigger, direction, fallback)
            : fallback;

        const nextAmountUah = field === 'amountUah' ? normalized : opposite.amount;
        const nextAmountUsd = field === 'amountUsd' ? normalized : opposite.amount;
        const nextAmountUahError = field === 'amountUah' ? currentFieldError : opposite.error;
        const nextAmountUsdError = field === 'amountUsd' ? currentFieldError : opposite.error;

        return {
            ...prev,
            amountUah: nextAmountUah,
            amountUsd: nextAmountUsd,
            errors: {
                ...prev.errors,
                amountUah: nextAmountUahError,
                amountUsd: nextAmountUsdError,
            },
        };
    };
};
