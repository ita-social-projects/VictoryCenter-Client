import { BANK_DETAILS_VALIDATION_FUNCTIONS } from './bank-details-schema';
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

    describe('validateIban', () => {
        it('return undefined if value is valid', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban('UA123456789012345678901234567')).toBeUndefined();
        });

        it('return error if no prefix is present', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban('123456')).toBe(
                DONATE_VALIDATION.iban.getRequiredError(),
            );
        });

        it('return error if no digits is present', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban('UA')).toBe(DONATE_VALIDATION.getDigitsOnlyError());
        });

        it('return error if value is too short', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban('UA12')).toBe(DONATE_VALIDATION.iban.getMinError());
        });

        it('return error if value is too long', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban('UA' + '1'.repeat(100))).toBe(
                DONATE_VALIDATION.iban.getMaxError(),
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
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift('SWIFT123')).toBeUndefined();
        });

        it('return error if value is empty', () => {
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift('')).toBe(
                DONATE_VALIDATION.swift.getRequiredError(),
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
});
