import { useMemo } from 'react';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PublicHistoryApi } from '@/services/api/public/history/history-api';
import { HistorySection } from '@/types/public/history-page';
import { ContentType } from '@/types/common/section-contents';
import { YEAR_PATTERN, YEAR_ONLY_PATTERN } from '@/const/public/history-page';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { HistoryHero } from './history-hero/HistoryHero';
import { HistorySection as HistorySectionComponent } from './history-section/HistorySection';
import { HistoryQuote } from './history-quote/HistoryQuote';
import styles from './HistoryPage.module.scss';

const getSectionYear = (section: HistorySection): string | null => {
    const rawTitle = section.contents.find((c) => c.contentType === ContentType.Title)?.title ?? '';
    return rawTitle.match(YEAR_PATTERN)?.[1] ?? rawTitle.match(YEAR_ONLY_PATTERN)?.[1] ?? null;
};

export const HistoryPage = () => {
    const {
        data: sections,
        isLoading,
        error,
    } = useDataFetch<HistorySection[]>({
        initialData: [],
        fetchHandler: PublicHistoryApi.getSections,
        autoFetchDependencies: [],
    });

    const sortedSections = useMemo(() => [...(sections ?? [])].sort((a, b) => a.order - b.order), [sections]);

    const sectionsWithYearFlags = useMemo(() => {
        const seenYears = new Set<string>();
        return sortedSections.map((section, index) => {
            const year = getSectionYear(section);
            const showYearLabel = year !== null && !seenYears.has(year);
            if (year) seenYears.add(year);
            return { section, showYearLabel, index };
        });
    }, [sortedSections]);

    return (
        <LoadableContent isLoading={isLoading} error={error}>
            <div className={styles.page}>
                <HistoryHero />
                <div className={styles['sections-list']}>
                    {sectionsWithYearFlags.map(({ section, showYearLabel, index }) => (
                        <HistorySectionComponent
                            key={section.id ?? index}
                            section={section}
                            showYearLabel={showYearLabel}
                        />
                    ))}
                </div>
            </div>
            <HistoryQuote />
        </LoadableContent>
    );
};
