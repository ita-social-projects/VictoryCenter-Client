import { generateInitials, getNormalizedInputText, getTrimmedInputText, parseDescriptionList } from './text-formatters';

describe('text-formatters', () => {
    describe('generateInitials', () => {
        it('should generate initials from full name', () => {
            expect(generateInitials('John Doe')).toBe('JD');
        });

        it('should handle single name', () => {
            expect(generateInitials('John')).toBe('J');
        });

        it('should handle multiple names and take first two by default', () => {
            expect(generateInitials('John Michael Doe')).toBe('JM');
        });

        it('should filter out empty strings from multiple spaces', () => {
            expect(generateInitials('John  Doe')).toBe('JD');
            expect(generateInitials('John   Michael   Doe')).toBe('JM');
        });

        it('should handle custom maxInitials parameter', () => {
            expect(generateInitials('John Michael Doe Smith', 3)).toBe('JMD');
            expect(generateInitials('John Michael Doe Smith', 1)).toBe('J');
        });

        it('should handle empty string', () => {
            expect(generateInitials('')).toBe('');
        });

        it('should handle names with only spaces', () => {
            expect(generateInitials('   ')).toBe('');
        });

        it('should handle Ukrainian names', () => {
            expect(generateInitials('Іван Петренко')).toBe('ІП');
            expect(generateInitials('Олександр Михайлович Коваленко', 3)).toBe('ОМК');
        });
    });

    describe('getNormalizedInputText', () => {
        it('should remove leading and trailing spaces', () => {
            expect(getNormalizedInputText('   hello   ')).toBe('hello');
        });

        it('should collapse multiple consecutive spaces into one', () => {
            expect(getNormalizedInputText('hello    world')).toBe('hello world');
            expect(getNormalizedInputText('hello  world  test')).toBe('hello world test');
        });

        it('should return empty string for spaces-only input', () => {
            expect(getNormalizedInputText('   ')).toBe('');
            expect(getNormalizedInputText('        ')).toBe('');
        });

        it('should handle text with prefix', () => {
            expect(getNormalizedInputText('$   100   ', '$')).toBe('100');
            expect(getNormalizedInputText('https://   example.com   ', 'https://')).toBe('example.com');
        });

        it('should return empty string for empty input', () => {
            expect(getNormalizedInputText('')).toBe('');
        });

        it('should not modify already normalized text', () => {
            expect(getNormalizedInputText('hello world')).toBe('hello world');
        });
    });

    describe('getTrimmedInputText', () => {
        it('should remove leading spaces', () => {
            expect(getTrimmedInputText('   hello')).toBe('hello');
        });

        it('should remove trailing spaces', () => {
            expect(getTrimmedInputText('hello   ')).toBe('hello');
        });

        it('should remove both leading and trailing spaces', () => {
            expect(getTrimmedInputText('   hello   ')).toBe('hello');
        });

        it('should preserve spaces in the middle', () => {
            expect(getTrimmedInputText('hello    world')).toBe('hello    world');
            expect(getTrimmedInputText('  hello  world  test  ')).toBe('hello  world  test');
        });

        it('should return empty string for spaces-only input', () => {
            expect(getTrimmedInputText('   ')).toBe('');
            expect(getTrimmedInputText('        ')).toBe('');
        });

        it('should return empty string for empty input', () => {
            expect(getTrimmedInputText('')).toBe('');
        });

        it('should not modify text without leading/trailing spaces', () => {
            expect(getTrimmedInputText('hello world')).toBe('hello world');
            expect(getTrimmedInputText('test')).toBe('test');
        });

        it('should handle text with prefix', () => {
            expect(getTrimmedInputText('$   100   ', '$')).toBe('100');
            expect(getTrimmedInputText('https://   example.com   ', 'https://')).toBe('example.com');
        });

        it('should handle prefix with multiple spaces after it', () => {
            expect(getTrimmedInputText('$    value    ', '$')).toBe('value');
        });

        it('should handle single word', () => {
            expect(getTrimmedInputText('  test  ')).toBe('test');
        });

        it('should preserve multiple consecutive spaces in middle', () => {
            expect(getTrimmedInputText('  Program     Section     Title  ')).toBe('Program     Section     Title');
        });
    });
    describe('parseDescriptionList', () => {
        it('should return default when description is undefined', () => {
            expect(parseDescriptionList(undefined)).toEqual({ intro: null, items: [] });
        });

        it('should return default when description is empty string', () => {
            expect(parseDescriptionList('')).toEqual({ intro: null, items: [] });
            expect(parseDescriptionList('   ')).toEqual({ intro: null, items: [] });
            expect(parseDescriptionList('\n\n')).toEqual({ intro: null, items: [] });
        });

        it('should detect intro line ending with colon', () => {
            const description = `
            Intro line:
            • First item
            • Second item
        `;
            const result = parseDescriptionList(description);
            expect(result.intro).toBe('Intro line:');
            expect(result.items).toEqual(['First item', 'Second item']);
        });

        it('should return all lines as items if no intro', () => {
            const description = `
            First item
            Second item
            Third item
        `;
            const result = parseDescriptionList(description);
            expect(result.intro).toBeNull();
            expect(result.items).toEqual(['First item', 'Second item', 'Third item']);
        });

        it('should trim and remove bullet markers from items', () => {
            const description = `
            Tasks:
            • Task one
            - Task two
            * Task three
            Plain task
        `;
            const result = parseDescriptionList(description);
            expect(result.intro).toBe('Tasks:');
            expect(result.items).toEqual(['Task one', 'Task two', 'Task three', 'Plain task']);
        });

        it('should handle description with extra empty lines', () => {
            const description = `Intro line:

• First item

• Second item
`;
            const result = parseDescriptionList(description);
            expect(result.intro).toBe('Intro line:');
            expect(result.items).toEqual(['First item', 'Second item']);
        });

        it('should handle description without bullets but with spaces', () => {
            const description = `
            Intro:
            Item one
              Item two with spaces
            Item three
        `;
            const result = parseDescriptionList(description);
            expect(result.intro).toBe('Intro:');
            expect(result.items).toEqual(['Item one', 'Item two with spaces', 'Item three']);
        });
    });
});
