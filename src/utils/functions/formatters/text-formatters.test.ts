import { generateInitials, getNormalizedInputText } from './text-formatters';

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
});
