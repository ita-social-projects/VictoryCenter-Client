import './paginated-sorted-list.scss';
import classNames from 'classnames';
import LoaderIcon from '../../assets/icons/load.svg';
import ArrowUpIcon from '../../assets/icons/arrow-up.svg';

export interface BaseTab {
    id: number;
    name: string;
}

interface PaginatedSortableListProps<TTab extends BaseTab> {
    tabs: TTab[];
    selectedTab: TTab | null;
    setSelectedTab: (tab: TTab) => void;
    isItemsLoading: boolean;
    content: React.ReactNode;
    handleOnScroll: () => void;
    moveToTop: () => void;
    isMoveToTopVisible: boolean;
    listRef: React.RefObject<HTMLDivElement | null>;
}

export function PaginatedSortableList<TTab extends BaseTab>({
    tabs,
    selectedTab,
    setSelectedTab,
    isItemsLoading,
    content,
    handleOnScroll,
    moveToTop,
    isMoveToTopVisible,
    listRef,
}: PaginatedSortableListProps<TTab>) {
    return (
        <div className="paginated-list">
            <div
                data-testid="tabs"
                className="paginated-list-categories"
                style={{ pointerEvents: isItemsLoading ? 'none' : 'all' }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab)}
                        className={classNames({
                            'paginated-list-categories-selected': tab.id === selectedTab?.id,
                        })}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            <div ref={listRef} onScroll={handleOnScroll} data-testid="list" className="paginated-list-scroll">
                {content}

                {isItemsLoading && (
                    <div className="paginated-list-scroll-loader" data-testid="list-loader">
                        <img src={LoaderIcon} alt="loader-icon" data-testid="paginated-list-loader-icon" />
                    </div>
                )}

                {isMoveToTopVisible && (
                    <button onClick={moveToTop} className="paginated-list-scroll-move-to-top">
                        <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="paginated-list-list-to-top" />
                    </button>
                )}
            </div>
        </div>
    );
}
