import { useState, useEffect } from 'react';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { PageLoader } from '@/components/common/page-loader/PageLoader';
import { TitleBlockForm } from '../title-block/TitleBlockForm';
import { AboutUsBlockForm } from '../about-us-block/AboutUsBlockForm';
import { StatisticsBlockForm } from '../statistics-block/StatisticsBlockForm';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { MainPage } from '@/types/admin/main-page';
import { MOCK_MAIN_PAGE_DATA } from '@/utils/mock-data/admin/main-page/main-page';
import styles from './MainPageContent.module.scss';

type TabType = 'title' | 'about' | 'statistics' | 'donations' | 'partners';

type TabItem = {
    id: TabType;
    label: string;
};

const TABS: TabItem[] = [
    { id: 'title', label: MAIN_PAGE_TEXT.TABS.TITLE },
    { id: 'about', label: MAIN_PAGE_TEXT.TABS.ABOUT_US },
    { id: 'statistics', label: MAIN_PAGE_TEXT.TABS.STATISTICS },
    { id: 'donations', label: MAIN_PAGE_TEXT.TABS.DONATIONS },
    { id: 'partners', label: MAIN_PAGE_TEXT.TABS.PARTNERS },
];

export const MainPageContent = () => {
    const [activeTab, setActiveTab] = useState<TabType>('title');
    const [data, setData] = useState<MainPage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleTabSelect = (tab: TabItem) => {
        setActiveTab(tab.id);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchMockData = () => {
            setIsLoading(true);
            setTimeout(() => {
                if (isMounted) {
                    setData(MOCK_MAIN_PAGE_DATA);
                    setIsLoading(false);
                }
            }, 500);
        };

        fetchMockData();

        return () => {
            isMounted = false;
        };
    }, []);

    const selectedTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

    if (isLoading || !data) {
        return <PageLoader />;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <div className={styles['toolbar-bottom']}>
                    <div className={styles['tabs-wrapper']}>
                        <CategoryBar<TabItem>
                            categories={TABS}
                            selectedCategory={selectedTab}
                            getCategoryDisplayName={(tab) => tab.label}
                            getCategoryKey={(tab) => tab.id}
                            onCategorySelect={handleTabSelect}
                        />
                    </div>
                </div>
            </div>

            <div className={styles['main-content']}>
                {activeTab === 'title' && <TitleBlockForm initialData={data} />}
                {activeTab === 'about' && <AboutUsBlockForm initialData={data} />}
                {activeTab === 'statistics' && <StatisticsBlockForm />}
                {activeTab === 'donations' && <div>Блок "{MAIN_PAGE_TEXT.TABS.DONATIONS}" в розробці</div>}
                {activeTab === 'partners' && <div>Блок "{MAIN_PAGE_TEXT.TABS.PARTNERS}" в розробці</div>}
            </div>
        </div>
    );
};

export default MainPageContent;
