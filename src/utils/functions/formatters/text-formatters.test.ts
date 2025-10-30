import { generateInitials } from './text-formatters';

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
});
