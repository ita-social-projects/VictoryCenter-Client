import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MAIN_PAGE_VALIDATION_FUNCTIONS, MainPageValidationSchema } from './main-page-schema';
import { MAIN_PAGE_FORM_DEFAULTS } from '@/types/admin/main-page';

describe('MAIN_PAGE_VALIDATION_FUNCTIONS', () => {
    describe('validateTitle', () => {
        it('returns undefined for a valid title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('Коні з досвідом зцілення')).toBeUndefined();
        });

        it('validates rich text HTML by plain text length', () => {
            expect(
                MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('<p><strong>Коні з досвідом</strong></p>'),
            ).toBeUndefined();
        });

        it('returns required error for an empty title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('returns required error for empty rich text HTML', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('<p><br></p>')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('treats spaces as empty and returns required error', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('   ')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('returns min error for title shorter than minimum characters', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle('Коротко')).toBe(
                MAIN_PAGE_VALIDATION.titleBlock.title.getMinError(),
            );
        });

        it('returns max error for title longer than maximum characters', () => {
            const longTitle = 'a'.repeat(MAIN_PAGE_VALIDATION.titleBlock.title.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateTitle(longTitle)).toBe(
                MAIN_PAGE_VALIDATION.titleBlock.title.getMaxError(),
            );
        });
    });

    describe('validateDescription', () => {
        it('returns undefined for a valid description', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('Це коректний опис для блоку.')).toBeUndefined();
        });

        it('returns required error for an empty description', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('treats spaces as empty and returns required error', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('      ')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns min error for description shorter than minimum characters', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription('Мало')).toBe(
                MAIN_PAGE_VALIDATION.titleBlock.description.getMinError(),
            );
        });

        it('returns max error for description longer than maximum characters', () => {
            const longDescription = 'a'.repeat(MAIN_PAGE_VALIDATION.titleBlock.description.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateDescription(longDescription)).toBe(
                MAIN_PAGE_VALIDATION.titleBlock.description.getMaxError(),
            );
        });
    });

    describe('validateImage', () => {
        it('returns undefined for null (optional field)', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateImage(null)).toBeUndefined();
        });

        it('returns undefined for ImageValues object', () => {
            const mockImageValues = {
                file: new File([''], 'test.png', { type: 'image/png' }),
                preview: 'blob:http://localhost/test',
            };
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateImage(mockImageValues as any)).toBeUndefined();
        });

        it('returns undefined for existing Image object', () => {
            const mockImage = {
                id: 123,
                url: 'http://example.com/image.jpg',
            };
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateImage(mockImage as any)).toBeUndefined();
        });
    });

    describe('MainPageValidationSchema', () => {
        it('preserves rich text HTML values after validation', async () => {
            const values = {
                ...MAIN_PAGE_FORM_DEFAULTS,
                titleUa: '<p><strong>Коні з досвідом</strong></p>',
                titleEn: '<p><strong>Horses with experience</strong></p>',
                descriptionUa: '<p>Це коректний опис для блоку.</p>',
                descriptionEn: '<p>This is a valid description.</p>',
                aboutUsTitleUa: '<p>Про центр допомоги</p>',
                aboutUsTitleEn: '<p>About the support center</p>',
                aboutUsDescriptionUa: '<p>Детальний опис про нас для головної сторінки.</p>',
                aboutUsDescriptionEn: '<p>Detailed about us description for the main page.</p>',
                partnersTitleUa: '<p>Надійні партнери фонду</p>',
                partnersTitleEn: '<p>Trusted foundation partners</p>',
                partnersDescriptionUa: '<p>Детальний опис для блоку наших партнерів.</p>',
                partnersDescriptionEn: '<p>Detailed description for our partners block.</p>',
                donationsTitleUa: '<p>Підтримати нас</p>',
                donationsTitleEn: '<p>Support us</p>',
                donationsDescriptionUa: '<p>Опис для блоку пожертв.</p>',
                donationsDescriptionEn: '<p>Description for donations block.</p>',
                statisticsTitleUa: 'Зміни, які можна виміряти',
                statisticsTitleEn: 'Changes you can measure',
            };

            await expect(MainPageValidationSchema.validate(values)).resolves.toMatchObject({
                titleUa: values.titleUa,
                descriptionUa: values.descriptionUa,
                aboutUsDescriptionEn: values.aboutUsDescriptionEn,
                partnersDescriptionUa: values.partnersDescriptionUa,
                donationsTitleUa: values.donationsTitleUa,
                donationsDescriptionUa: values.donationsDescriptionUa,
            });
        });
    });

    describe('validatePartnersTitle', () => {
        it('returns undefined for a valid title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersTitle('Надійні партнери фонду')).toBeUndefined();
        });

        it('returns required error for an empty title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersTitle('')).toBe(MAIN_PAGE_VALIDATION.common.REQUIRED);
        });

        it('treats spaces as empty and returns required error', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersTitle('   ')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns min error for title shorter than minimum characters', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersTitle('Коротко')).toBe(
                MAIN_PAGE_VALIDATION.partnersBlock.title.getMinError(),
            );
        });

        it('returns max error for title longer than maximum characters', () => {
            const longTitle = 'a'.repeat(MAIN_PAGE_VALIDATION.partnersBlock.title.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersTitle(longTitle)).toBe(
                MAIN_PAGE_VALIDATION.partnersBlock.title.getMaxError(),
            );
        });
    });

    describe('validatePartnersDescription', () => {
        it('returns undefined for a valid description', () => {
            expect(
                MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersDescription('Детальний опис для блоку наших партнерів.'),
            ).toBeUndefined();
        });

        it('returns required error for an empty description', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersDescription('')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('treats spaces as empty and returns required error', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersDescription('      ')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns min error for description shorter than minimum characters', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersDescription('Замало')).toBe(
                MAIN_PAGE_VALIDATION.partnersBlock.description.getMinError(),
            );
        });

        it('returns max error for description longer than maximum characters', () => {
            const longDescription = 'a'.repeat(MAIN_PAGE_VALIDATION.partnersBlock.description.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validatePartnersDescription(longDescription)).toBe(
                MAIN_PAGE_VALIDATION.partnersBlock.description.getMaxError(),
            );
        });
    });

    describe('validateStatisticsTitleUa', () => {
        it('returns undefined for valid UA title', () => {
            expect(
                MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleUa('Зміни, які можна виміряти'),
            ).toBeUndefined();
        });

        it('returns required error for empty UA title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleUa('')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('treats spaces as empty and returns required error for UA title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleUa('   ')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns min error for UA title shorter than min', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleUa('Коро')).toBe(
                MAIN_PAGE_VALIDATION.statisticsBlock.title.getMinError(),
            );
        });

        it('returns max error for UA title longer than max', () => {
            const longTitle = 'a'.repeat(MAIN_PAGE_VALIDATION.statisticsBlock.title.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleUa(longTitle)).toBe(
                MAIN_PAGE_VALIDATION.statisticsBlock.title.getMaxError(),
            );
        });
    });

    describe('validateStatisticsTitleEn', () => {
        it('returns undefined for valid EN title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleEn('Changes you can measure')).toBeUndefined();
        });

        it('returns required error for empty EN title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleEn('')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('treats spaces as empty and returns required error for EN title', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleEn('   ')).toBe(
                MAIN_PAGE_VALIDATION.common.REQUIRED,
            );
        });

        it('returns min error for EN title shorter than min', () => {
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleEn('Shor')).toBe(
                MAIN_PAGE_VALIDATION.statisticsBlock.title.getMinError(),
            );
        });

        it('returns max error for EN title longer than max', () => {
            const longTitle = 'a'.repeat(MAIN_PAGE_VALIDATION.statisticsBlock.title.max + 1);
            expect(MAIN_PAGE_VALIDATION_FUNCTIONS.validateStatisticsTitleEn(longTitle)).toBe(
                MAIN_PAGE_VALIDATION.statisticsBlock.title.getMaxError(),
            );
        });
    });
});
