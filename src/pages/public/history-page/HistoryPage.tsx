import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PublicHistoryApi } from '@/services/api/public/history/history-api';
import { HistorySection } from '@/types/public/history-page';
import { ContentType } from '@/types/common/section-contents';
import { LoadableContent } from '@/components/common/loadable-content/LoadableContent';
import { HistoryHero } from './history-hero/HistoryHero';
import { HistorySection as HistorySectionComponent } from './history-section/HistorySection';
import { HistoryQuote } from './history-quote/HistoryQuote';
import styles from './HistoryPage.module.scss';

const YEAR_PATTERN = /^(\d{4}(?:[–—-]\d{4})?)\s*[—–-]\s*/;
const YEAR_ONLY_PATTERN = /^(\d{4}(?:[–—-]\d{4})?)$/;

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

    const sortedSections = [...(sections ?? [])].sort((a, b) => a.order - b.order);

    const seenYears = new Set<string>();

    return (
        <LoadableContent isLoading={isLoading} error={error}>
            <div className={styles.page}>
                <HistoryHero />
                <div className={styles['sections-list']}>
                    {sortedSections.map((section, index) => {
                        const year = getSectionYear(section);
                        const showYearLabel = year !== null && !seenYears.has(year);
                        if (year) seenYears.add(year);
                        return (
                            <HistorySectionComponent
                                key={section.id ?? index}
                                section={section}
                                showYearLabel={showYearLabel}
                            />
                        );
                    })}
                </div>
            </div>
            <HistoryQuote />
        </LoadableContent>
    );
};
