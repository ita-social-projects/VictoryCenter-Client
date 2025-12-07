import { mapStatusToLabel, mapLabelToStatus, mapStatusFilterToStatus } from './status-mappers';
import { StatusFilter, VisibilityStatus } from '@app-types/admin/common';
import { COMMON_TEXT_ADMIN } from '@const/admin/common';

describe('mapStatusToLabel', () => {
    it('returns label for DRAFT status', () => {
        expect(mapStatusToLabel(VisibilityStatus.Draft)).toBe(COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT);
    });

    it('returns label for PUBLISHED status', () => {
        expect(mapStatusToLabel(VisibilityStatus.Published)).toBe(COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED);
    });
});

describe('mapLabelToStatus', () => {
    it('returns status for DRAFT label', () => {
        expect(mapLabelToStatus(COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT)).toBe(VisibilityStatus.Draft);
    });

    it('returns status for PUBLISHED label', () => {
        expect(mapLabelToStatus(COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED)).toBe(VisibilityStatus.Published);
    });

    it('returns undefined for unknown label', () => {
        expect(mapLabelToStatus('Unknown')).toBeUndefined();
    });
});

describe('mapStatusFilterToStatus', () => {
    it('returns Published for "Опубліковано"', () => {
        expect(mapStatusFilterToStatus('Опубліковано')).toBe(VisibilityStatus.Published);
    });

    it('returns Draft for "Чернетка"', () => {
        expect(mapStatusFilterToStatus('Чернетка')).toBe(VisibilityStatus.Draft);
    });

    it('returns null for "Усі"', () => {
        expect(mapStatusFilterToStatus('Усі')).toBeNull();
    });

    it('returns null for unknown filter', () => {
        expect(mapStatusFilterToStatus('SomethingElse' as StatusFilter)).toBeNull();
    });
});
