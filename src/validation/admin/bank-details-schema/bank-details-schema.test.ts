import { BANK_DETAILS_VALIDATION_FUNCTIONS, SUPPORT_OPTIONS_VALIDATION_FUNCTIONS } from './bank-details-schema';
import { DONATE_VALIDATION } from '../../../const/admin/donate';

describe('BANK_DETAILS_VALIDATION_FUNCTIONS', () => {
    describe('validateName', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateName('Valid Name')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateName('')).toBe(DONATE_VALIDATION.name.getRequiredError());
        });
    });

    describe('validateReceiver', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver('Receiver')).toBeUndefined();
        });

        it('return undefined if receiver is empty', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver('')).toBe(
                DONATE_VALIDATION.receiver.getRequiredError(),
            );
        });
    });

    describe('validateEdrpou', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou('12345678')).toBeUndefined();
        });

        it('return error if value is not digits', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou('abc')).toBe(
                DONATE_VALIDATION.getDigitsOnlyError(),
            );
        });

        it('return error if value is too short', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou('123')).toBe(
                DONATE_VALIDATION.edrpou.getMinError(),
            );
        });

        it('return error if value is too long', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou('123456789012')).toBe(
                DONATE_VALIDATION.edrpou.getMaxError(),
            );
        });
    });

    describe('validateUkrainianIban', () => {
        it('return undefined if value is valid', () => {
            expect(
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban('UA123456789012345678901234567'),
            ).toBeUndefined();
        });

        it('return error if value is too short', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban('UA12')).toBe(
                DONATE_VALIDATION.ukrainianIban.getMinError(),
            );
        });

        it('return error if value is too long', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban('UA' + '1'.repeat(100))).toBe(
                DONATE_VALIDATION.ukrainianIban.getMaxError(),
            );
        });
    });

    describe('validateForeignIban', () => {
        it('return undefined if value is valid', () => {
            expect(
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateForeignIban('EN12345678901234567890123456789012'),
            ).toBeUndefined();
        });

        it('return error if value is too long', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateForeignIban('EN' + '1'.repeat(100))).toBe(
                DONATE_VALIDATION.foreignIban.getMaxError(),
            );
        });
    });

    describe('validatePaymentPurpose', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose('Some purpose')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose('')).toBe(
                DONATE_VALIDATION.paymentPurpose.getRequiredError(),
            );
        });
    });

    describe('validateSwift', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift('ABCDUS33XXX')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift('')).toBe(
                DONATE_VALIDATION.swift.getRequiredError(),
            );
        });

        it('return error if value is too short', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift('123')).toBe(DONATE_VALIDATION.swift.getMinError());
        });

        it('return error if value is too long', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift('1234567890123')).toBe(
                DONATE_VALIDATION.swift.getMaxError(),
            );
        });
    });

    describe('validateAddress', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress('Kyiv, Ukraine')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress('')).toBe(
                DONATE_VALIDATION.address.getRequiredError(),
            );
        });
    });

    describe('validateAccount', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateAccount('1234567890')).toBeUndefined();
        });

        it('return error if value is too long', () => {
            const longString = 'a'.repeat(DONATE_VALIDATION.account.maxLength + 1);
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateAccount(longString)).toBe(
                DONATE_VALIDATION.account.getMaxError(),
            );
        });
    });
});

describe('SUPPORT_OPTIONS_VALIDATION_FUNCTIONS', () => {
    describe('validateName', () => {
        it('return undefined if value is valid', () => {
            expect(SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateName('Valid Name')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateName('')).toBe(
                DONATE_VALIDATION.supportOptions.name.getRequiredError(),
            );
        });

        it('return error if value is too long', () => {
            const longString = 'a'.repeat(DONATE_VALIDATION.supportOptions.name.maxLength + 1);
            expect(SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateName(longString)).toBe(
                DONATE_VALIDATION.supportOptions.name.getMaxError(),
            );
        });
    });

    describe('validateValue', () => {
        it('return undefined if value is valid', () => {
            expect(SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateValue('Valid Value')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateValue('')).toBe(
                DONATE_VALIDATION.supportOptions.value.getRequiredError(),
            );
        });

        it('return error if value is too long', () => {
            const longString = 'a'.repeat(DONATE_VALIDATION.supportOptions.value.maxLength + 1);
            expect(SUPPORT_OPTIONS_VALIDATION_FUNCTIONS.validateValue(longString)).toBe(
                DONATE_VALIDATION.supportOptions.value.getMaxError(),
            );
        });
    });
});
