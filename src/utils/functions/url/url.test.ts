import { isExternalLink, isHttpOrHttpsUrl } from './url';

describe('isHttpOrHttpsUrl', () => {
    test.each(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'http://example.com/video'])(
        'should accept %s',
        (value) => {
            expect(isHttpOrHttpsUrl(value)).toBe(true);
        },
    );

    test.each([
        // eslint-disable-next-line no-script-url -- verifies script URLs are rejected
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'ftp://example.com/file',
        'not a url',
        '/relative/path',
        '',
        null,
        undefined,
    ])('should reject %p', (value) => {
        expect(isHttpOrHttpsUrl(value)).toBe(false);
    });
});

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
