import {
    PARTNER_BANNER_VALIDATION_FUNCTIONS,
    PARTNER_SECTION_VALIDATION_FUNCTIONS,
    PARTNER_VALIDATION_FUNCTIONS,
} from './partner-schema';
import {
    PARTNER_BANNER_VALIDATION,
    PARTNER_SECTION_VALIDATION,
    PARTNER_VALIDATION,
} from '../../../const/admin/partners';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

const createValidPartner = () => ({
    description: 'Valid partner',
});

const buildPartnerArray = (length: number) => Array.from({ length }, createValidPartner);

describe('partner-schema validations', () => {
    describe('PARTNER_BANNER_VALIDATION_FUNCTIONS', () => {
        describe('validateTitle', () => {
            it('returns undefined for valid title', () => {
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle('Valid Title');
                expect(result).toBeUndefined();
            });

            it('returns required error when title missing', () => {
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle('');
                expect(result).toBe(PARTNER_BANNER_VALIDATION.title.getRequiredError());
            });

            it('returns min length error', () => {
                const min = PARTNER_BANNER_VALIDATION.title.min;
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle('a'.repeat(min - 1));
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(min));
            });

            it('returns max length error', () => {
                const max = PARTNER_BANNER_VALIDATION.title.max;
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle('a'.repeat(max + 1));
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(max));
            });
        });

        describe('validateDescription', () => {
            it('returns undefined for valid description', () => {
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription('Valid description');
                expect(result).toBeUndefined();
            });

            it('returns required error when description missing', () => {
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription('');
                expect(result).toBe(PARTNER_BANNER_VALIDATION.description.getRequiredError());
            });

            it('returns min length error', () => {
                const min = PARTNER_BANNER_VALIDATION.description.min;
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription('a'.repeat(min - 1));
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PARTNER_BANNER_VALIDATION.description.max),
                );
            });

            it('returns max length error', () => {
                const max = PARTNER_BANNER_VALIDATION.description.max;
                const result = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription('a'.repeat(max + 1));
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PARTNER_BANNER_VALIDATION.description.min),
                );
            });
        });
    });

    describe('PARTNER_VALIDATION_FUNCTIONS', () => {
        describe('validateDescription', () => {
            it('returns undefined for valid description', () => {
                const result = PARTNER_VALIDATION_FUNCTIONS.validateDescription('Valid partner description');
                expect(result).toBeUndefined();
            });

            it('returns required error when description missing', () => {
                const result = PARTNER_VALIDATION_FUNCTIONS.validateDescription('');
                expect(result).toBe(PARTNER_VALIDATION.description.getRequiredError());
            });

            it('returns min length error', () => {
                const min = PARTNER_SECTION_VALIDATION.description.min;
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription('a'.repeat(min - 1));
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(min));
            });

            it('returns max length error', () => {
                const max = PARTNER_SECTION_VALIDATION.description.max;
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription('a'.repeat(max + 1));
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(max));
            });
        });
    });

    describe('PARTNER_SECTION_VALIDATION_FUNCTIONS', () => {
        describe('validateTitle', () => {
            it('returns undefined for valid title', () => {
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle('Valid Section Title');
                expect(result).toBeUndefined();
            });

            it('returns required error when title missing', () => {
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle('');
                expect(result).toBe(PARTNER_SECTION_VALIDATION.title.getRequiredError());
            });

            it('returns min length error', () => {
                const min = PARTNER_SECTION_VALIDATION.title.min;
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle('a'.repeat(min - 1));
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(min));
            });

            it('returns max length error', () => {
                const max = PARTNER_SECTION_VALIDATION.title.max;
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle('a'.repeat(max + 1));
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(max));
            });
        });

        describe('validateDescription', () => {
            it('returns undefined for valid description', () => {
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription('Valid section description');
                expect(result).toBeUndefined();
            });

            it('returns required error when description missing', () => {
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription('');
                expect(result).toBe(PARTNER_SECTION_VALIDATION.description.getRequiredError());
            });
        });

        describe('validatePartners', () => {
            it('returns undefined when partners array is within range', () => {
                const partners = buildPartnerArray(PARTNER_SECTION_VALIDATION.partners.max);
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validatePartners(partners);
                expect(result).toBeUndefined();
            });

            it('returns error when partners array is empty', () => {
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validatePartners({ partners: [] } as any);
                expect(result).toBe(PARTNER_SECTION_VALIDATION.partners.getAtLeastOnePartnerRequiredError());
            });

            it('returns error when partners array exceeds max', () => {
                const partners = buildPartnerArray(PARTNER_SECTION_VALIDATION.partners.max + 1);
                const result = PARTNER_SECTION_VALIDATION_FUNCTIONS.validatePartners({ partners } as any);
                expect(result).toBe(PARTNER_SECTION_VALIDATION.partners.getMaxError());
            });
        });
    });
});
