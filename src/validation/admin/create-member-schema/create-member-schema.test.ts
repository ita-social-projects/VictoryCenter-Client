import { useCreateMemberSchema } from './create-member-schema';
import {
    FULLNAME_MIN,
    FULLNAME_MAX,
    FORBIDDEN_SYMBOLS,
    IMG_REQUIRED,
    FILE_SIZE,
    FILE_FORMAT,
    SUPPORTED_FORMATS,
    FILE_SIZE_LIMIT,
    DESCRIPTIONS_MIN,
} from '../../../const/admin/data-validation';

function createMockImageValues(file: File): { base64: string; mimeType: string; size: number } {
    return {
        base64: 'data:image/png;base64,dummy',
        mimeType: file.type,
        size: file.size,
    };
}

describe('Create Member Schema', () => {
    const validFile = new File(['dummy content'], 'avatar.png', {
        type: SUPPORTED_FORMATS[0],
    });

    const requiredBase = {
        category: 'Main',
        fullName: 'John Doe',
        description: 'This is a valid description with enough length.',
        image: createMockImageValues(validFile),
    };

    it('validates correctly for published entry', async () => {
        const schema = useCreateMemberSchema(false);
        const validFile = new File(['dummy content'], 'avatar.png', {
            type: SUPPORTED_FORMATS[0],
        });
        const imageValues = createMockImageValues(validFile);

        const validData = {
            category: 'main',
            fullName: 'John Doe',
            description: 'This is a valid description with enough length.',
            image: imageValues,
        };

        await expect(schema.validate(validData)).resolves.toBeTruthy();
    });

    it('fails on too short fullName', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(schema.validate({ ...requiredBase, fullName: 'J' })).rejects.toThrow(FULLNAME_MIN);
    });

    it('fails on too long fullName', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(
            schema.validate({
                ...requiredBase,
                fullName: 'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
            }),
        ).rejects.toThrow(FULLNAME_MAX);
    });

    it('fails on forbidden symbols in fullName', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(schema.validate({ ...requiredBase, fullName: 'John@Doe!' })).rejects.toThrow(FORBIDDEN_SYMBOLS);
    });

    it('description is optional for draft', async () => {
        const schema = useCreateMemberSchema(true);
        await expect(schema.validate({ ...requiredBase, description: '' })).resolves.toBeTruthy();
    });

    it('fails if description is too short for publish', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(schema.validate({ ...requiredBase, description: 'short' })).rejects.toThrow(DESCRIPTIONS_MIN);
    });

    it('fails if image not provided and not draft', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(schema.validate({ ...requiredBase, image: undefined })).rejects.toThrow(IMG_REQUIRED);
    });

    it('passes if image is string (already uploaded)', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(
            schema.validate({ ...requiredBase, image: 'https://some-url.com/image.png' }),
        ).resolves.toBeTruthy();
    });

    it('fails if file is too large', async () => {
        const schema = useCreateMemberSchema(false);
        const bigFile = new File(['a'.repeat(FILE_SIZE_LIMIT + 1)], 'big.png', {
            type: SUPPORTED_FORMATS[0],
        });
        const imageValues = createMockImageValues(bigFile);

        await expect(schema.validate({ ...requiredBase, image: imageValues })).rejects.toThrow(FILE_SIZE);
    });

    it('fails if file has unsupported format', async () => {
        const schema = useCreateMemberSchema(false);
        const badFile = new File([''], 'file.txt', { type: 'text/plain' });
        const imageValues = createMockImageValues(badFile);

        await expect(schema.validate({ ...requiredBase, image: imageValues })).rejects.toThrow(FILE_FORMAT);
    });

    it('passes if image is not required and draft is true', async () => {
        const schema = useCreateMemberSchema(true);
        await expect(schema.validate({ ...requiredBase, image: undefined })).resolves.toBeTruthy();
    });
});
