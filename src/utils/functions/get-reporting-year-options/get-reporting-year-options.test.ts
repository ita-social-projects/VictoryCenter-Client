import { getReportingYearOptions } from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';

describe('getReportingYearOptions', () => {
    it('should return previous, current, and next year in order', () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-03-30T00:00:00.000Z'));

        expect(getReportingYearOptions()).toEqual(['2025', '2026', '2027']);

        jest.useRealTimers();
    });
});
