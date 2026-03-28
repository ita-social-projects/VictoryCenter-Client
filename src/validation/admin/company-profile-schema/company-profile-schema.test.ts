import { COMPANY_PROFILE_VALIDATION } from '@/const/admin/company-profile';
import { COMPANY_PROFILE_VALIDATION_FUNCTIONS } from './company-profile-schema';

describe('COMPANY_PROFILE_VALIDATION_FUNCTIONS', () => {
    describe('validatePhone', () => {
        it('returns undefined for valid phone', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validatePhone('+380671234567')).toBeUndefined();
        });

        it('returns required error for empty phone', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validatePhone('')).toBe(
                COMPANY_PROFILE_VALIDATION.common.REQUIRED,
            );
        });

        it('treats spaces as empty', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validatePhone('   ')).toBe(
                COMPANY_PROFILE_VALIDATION.common.REQUIRED,
            );
        });
    });

    describe('validateEmail', () => {
        it('returns undefined for valid email', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateEmail('test@example.com')).toBeUndefined();
        });

        it('returns required error for empty email', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateEmail('')).toBe(
                COMPANY_PROFILE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns format error for invalid email', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateEmail('not-email')).toBe(
                COMPANY_PROFILE_VALIDATION.common.getEmailError(),
            );
        });
    });

    describe('validateCorrespondenceEmail', () => {
        it('returns undefined for valid correspondence email', () => {
            expect(
                COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCorrespondenceEmail('office@example.com'),
            ).toBeUndefined();
        });

        it('returns required error for empty correspondence email', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCorrespondenceEmail('')).toBe(
                COMPANY_PROFILE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns format error for invalid correspondence email', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCorrespondenceEmail('not-email')).toBe(
                COMPANY_PROFILE_VALIDATION.common.getEmailError(),
            );
        });
    });

    describe('validateCompanyRegistrationNumber (ЄДРПОУ)', () => {
        it('returns undefined for valid 8 digits', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCompanyRegistrationNumber('12345678')).toBeUndefined();
        });

        it('returns required error for empty value', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCompanyRegistrationNumber('')).toBe(
                COMPANY_PROFILE_VALIDATION.common.REQUIRED,
            );
        });

        it('treats spaces as empty', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCompanyRegistrationNumber('   ')).toBe(
                COMPANY_PROFILE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns digits-only error when non-digit chars are present', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCompanyRegistrationNumber('12a45678')).toBe(
                COMPANY_PROFILE_VALIDATION.common.getDigitsOnlyError(),
            );
        });

        it('returns min error when less than 8 digits', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCompanyRegistrationNumber('123')).toBe(
                COMPANY_PROFILE_VALIDATION.edrpou.getMinError(),
            );
        });

        it('returns max error when more than 8 digits', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateCompanyRegistrationNumber('123456789')).toBe(
                COMPANY_PROFILE_VALIDATION.edrpou.getMaxError(),
            );
        });
    });

    describe('validateMottoUa', () => {
        it('returns undefined for empty (optional)', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateMottoUa('')).toBeUndefined();
        });

        it('returns max error for mottoUa longer than 200 chars', () => {
            const long = 'a'.repeat(COMPANY_PROFILE_VALIDATION.motto.max + 1);
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateMottoUa(long)).toBe(
                COMPANY_PROFILE_VALIDATION.motto.getMaxError(),
            );
        });
    });

    describe('validateMottoEng', () => {
        it('returns undefined for empty (optional)', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateMottoEng('')).toBeUndefined();
        });

        it('returns max error for mottoEng longer than 200 chars', () => {
            const long = 'a'.repeat(COMPANY_PROFILE_VALIDATION.motto.max + 1);
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateMottoEng(long)).toBe(
                COMPANY_PROFILE_VALIDATION.motto.getMaxError(),
            );
        });
    });

    describe('validateSocialUrl', () => {
        it('returns undefined for empty (optional)', () => {
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateSocialUrl('')).toBeUndefined();
        });

        it('returns max error when url exceeds 500 chars', () => {
            const long = 'a'.repeat(COMPANY_PROFILE_VALIDATION.socialUrl.max + 1);
            expect(COMPANY_PROFILE_VALIDATION_FUNCTIONS.validateSocialUrl(long)).toBe(
                COMPANY_PROFILE_VALIDATION.socialUrl.getMaxError(),
            );
        });
    });
});
