import {
    getReportingYearOptions,
    getProgramReportingYearOptions,
} from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';

describe('getReportingYearOptions', () => {
    it('should return previous, current, and next year in order', () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-03-30T00:00:00.000Z'));

        expect(getReportingYearOptions()).toEqual(['2025', '2026', '2027']);

        jest.useRealTimers();
    });
});

describe('getProgramReportingYearOptions', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date('2026-03-30T00:00:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return the default window sorted ascending when no year is provided', () => {
        expect(getProgramReportingYearOptions()).toEqual(['2025', '2026', '2027']);
    });

    it('should ignore null and undefined selected years', () => {
        expect(getProgramReportingYearOptions(null)).toEqual(['2025', '2026', '2027']);
        expect(getProgramReportingYearOptions(undefined)).toEqual(['2025', '2026', '2027']);
    });

    it('should include a selected year outside the default window, sorted ascending', () => {
        expect(getProgramReportingYearOptions(2020)).toEqual(['2020', '2025', '2026', '2027']);
    });

    it('should not duplicate a selected year already inside the window', () => {
        expect(getProgramReportingYearOptions(2026)).toEqual(['2025', '2026', '2027']);
    });
});
