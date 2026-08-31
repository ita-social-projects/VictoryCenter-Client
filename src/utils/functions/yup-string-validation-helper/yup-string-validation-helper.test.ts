import * as Yup from 'yup';
import { requiredNotWhitespaceOnlyTest, noLeadingTrailingSpacesTest } from './yup-string-validation-helper';

describe('requiredNotWhitespaceOnlyTest', () => {
    const message = 'Field is required';
    const schema = Yup.string().test(...requiredNotWhitespaceOnlyTest(() => message));

    it('fails when value is undefined', () => {
        expect(() => schema.validateSync(undefined)).toThrow(message);
    });

    it('fails when value is an empty string', () => {
        expect(() => schema.validateSync('')).toThrow(message);
    });

    it('fails when value contains only whitespace', () => {
        expect(() => schema.validateSync('   ')).toThrow(message);
    });

    it('passes when value has non-whitespace characters', () => {
        expect(schema.validateSync('hello')).toBe('hello');
    });

    it('passes when value has surrounding whitespace but real content', () => {
        expect(schema.validateSync('  hello  ')).toBe('  hello  ');
    });
});

describe('noLeadingTrailingSpacesTest', () => {
    const message = 'No leading or trailing spaces allowed';
    const schema = Yup.string().test(...noLeadingTrailingSpacesTest(() => message));

    it('passes when value is undefined', () => {
        expect(schema.validateSync(undefined)).toBeUndefined();
    });

    it('passes when value has no leading/trailing spaces', () => {
        expect(schema.validateSync('hello')).toBe('hello');
    });

    it('fails when value has a leading space', () => {
        expect(() => schema.validateSync(' hello')).toThrow(message);
    });

    it('fails when value has a trailing space', () => {
        expect(() => schema.validateSync('hello ')).toThrow(message);
    });

    it('fails when value has both leading and trailing spaces', () => {
        expect(() => schema.validateSync(' hello ')).toThrow(message);
    });

    it('passes for an empty string (no spaces to trim)', () => {
        expect(schema.validateSync('')).toBe('');
    });
});