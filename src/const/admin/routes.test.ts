import { isAdminPath } from '@/const/admin/routes';

describe('isAdminPath', () => {
    it.each(['/admin-panel', '/admin-panel/login', '/admin-panel/team'])('returns true for %s', (path) => {
        expect(isAdminPath(path)).toBe(true);
    });

    it.each(['/login', '/programs', '/admin-panelx', '/administrator'])('returns false for %s', (path) => {
        expect(isAdminPath(path)).toBe(false);
    });
});
