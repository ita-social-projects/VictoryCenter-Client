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
} from '../../const/admin/data-validation';

function createMockFileList(file: File): FileList {
    const fileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () {
            yield file;
        },
    };
    Object.setPrototypeOf(fileList, FileList.prototype);

    return fileList as FileList;
}

describe('Create Member Schema', () => {
    const validFile = new File(['dummy content'], 'avatar.png', {
        type: SUPPORTED_FORMATS[0],
    });

    const requiredBase = {
        category: 'Main',
        fullName: 'John Doe',
        description: 'This is a valid description with enough length.',
        img: createMockFileList(validFile),
    };

    it('validates correctly for published entry', async () => {
        const schema = useCreateMemberSchema(false);
        const validFile = new File(['dummy content'], 'avatar.png', {
            type: SUPPORTED_FORMATS[0],
        });
        const fileList = createMockFileList(validFile);

        const validData = {
            category: 'main',
            fullName: 'John Doe',
            description: 'This is a valid description with enough length.',
            img: fileList,
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

    it('fails if img not provided and not draft', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(schema.validate({ ...requiredBase, img: undefined })).rejects.toThrow(IMG_REQUIRED);
    });

    it('passes if img is string (already uploaded)', async () => {
        const schema = useCreateMemberSchema(false);
        await expect(schema.validate({ ...requiredBase, img: 'https://some-url.com/image.png' })).resolves.toBeTruthy();
    });

    it('fails if file is too large', async () => {
        const schema = useCreateMemberSchema(false);
        const bigFile = new File(['a'.repeat(FILE_SIZE_LIMIT + 1)], 'big.png', {
            type: SUPPORTED_FORMATS[0],
        });
        const fileList = createMockFileList(bigFile);

        await expect(schema.validate({ ...requiredBase, img: fileList })).rejects.toThrow(FILE_SIZE);
    });

    it('fails if file has unsupported format', async () => {
        const schema = useCreateMemberSchema(false);
        const badFile = new File([''], 'file.txt', { type: 'text/plain' });
        const fileList = createMockFileList(badFile);

        await expect(schema.validate({ ...requiredBase, img: fileList })).rejects.toThrow(FILE_FORMAT);
    });

    it('passes if img is not required and draft is true', async () => {
        const schema = useCreateMemberSchema(true);
        await expect(schema.validate({ ...requiredBase, img: undefined })).resolves.toBeTruthy();
    });
});
