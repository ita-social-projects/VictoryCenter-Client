import { isExternalLink } from './url';

describe('isExternalLink', () => {
    test('should identify https URLs as external', () => {
        expect(isExternalLink('https://google.com')).toBe(true);
        expect(isExternalLink('https://sub.domain.com/path')).toBe(true);
    });

    test('should identify http URLs as external', () => {
        expect(isExternalLink('http://insecure-site.com')).toBe(true);
        expect(isExternalLink('http://localhost:3000')).toBe(true);
    });

    test('should identify mailto links as external', () => {
        expect(isExternalLink('mailto:user@example.com')).toBe(true);
    });

    test('should identify tel links as external', () => {
        expect(isExternalLink('tel:+1234567890')).toBe(true);
    });

    test('should identify absolute paths as internal', () => {
        expect(isExternalLink('/dashboard')).toBe(false);
        expect(isExternalLink('/users/123/edit')).toBe(false);
    });

    test('should identify relative paths as internal', () => {
        expect(isExternalLink('login')).toBe(false);
        expect(isExternalLink('../parent/page')).toBe(false);
    });

    test('should identify anchor links as internal', () => {
        expect(isExternalLink('#section-header')).toBe(false);
    });

    test('should return false for empty strings', () => {
        expect(isExternalLink('')).toBe(false);
    });
});
