import { EventValidationSchema } from './event-schema';

const validData = {
    title: 'valid title',
    description: 'valid description',
    additionalDescription: '',
    linkUkr: 'valid url',
    linkEng: '',
    publishDate: null,
    image: null,
};

describe('EventValidationSchema', () => {
    it('should pass validation with valid data', async () => {
        await expect(EventValidationSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should throw an error if required field is missing or empty', async () => {
        await expect(EventValidationSchema.validate({ ...validData, title: '   ' })).rejects.toThrow();
    });

    it('should throw an error if field value is shorter than the minimum length', async () => {
        await expect(EventValidationSchema.validate({ ...validData, description: 'n' })).rejects.toThrow();
    });

    it('should allow empty description when saving as draft', async () => {
        const data = { ...validData, description: '' };

        await expect(EventValidationSchema.validate(data, { context: { isPublishing: false } })).resolves.toEqual(data);
    });

    it('should throw an error if description is missing or empty when publishing', async () => {
        const data = { ...validData, description: '' };

        await expect(EventValidationSchema.validate(data, { context: { isPublishing: true } })).rejects.toThrow();
    });
});
