import './paginated-sorted-list.scss';
import classNames from 'classnames';
import LoaderIcon from '../../assets/icons/load.svg';
import ArrowUpIcon from '../../assets/icons/arrow-up.svg';
import { ListContent } from './ListContent/ListContent';
import { MembersListItem } from '../../../pages/admin/team/components/members-list-item/MembersListItem';
import { TeamMember } from '../../../types/admin/TeamMembers';

export interface BaseTab {
    //TODO
    id: number;
    name: string;
}

export interface BaseItem {
    //TODO
    id: number;
}

interface PaginatedSortableListProps<TItem extends BaseItem, TTab extends BaseTab> {
    tabs: TTab[];
    selectedTab: TTab | null;
    setSelectedTab: (tab: TTab) => void;
    isItemsLoading: boolean;
    items: TItem[];
    content: React.ReactNode;
    handleOnScroll: () => void;
    moveToTop: () => void;
    isMoveToTopVisible: boolean;
    listRef: React.RefObject<HTMLDivElement | null>;
}

export function PaginatedSortableList<TItem extends BaseItem, TTab extends BaseTab>({
    tabs,
    selectedTab,
    setSelectedTab,
    isItemsLoading,
    items,
    content,
    handleOnScroll,
    moveToTop,
    isMoveToTopVisible,
    listRef,
}: PaginatedSortableListProps<TItem, TTab>) {
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
                <ListContent
                    items={items}
                    isLoading={isItemsLoading}
                    renderItem={(m, index) => (
                        <MembersListItem
                            key={m.id}
                            draggedIndex={draggedIndex}
                            member={m as unknown as TeamMember} //TODO
                            handleDragOver={handleDragOver}
                            handleDragStart={handleDragStart}
                            handleDrag={handleDrag}
                            handleDragEnd={handleDragEnd}
                            handleDrop={handleDrop}
                            handleOnDeleteMember={handleOnDeleteMember}
                            handleOnEditMember={handleOnEditMember}
                            index={index}
                        />
                    )}
                    emptyState={
                        <div className="members-not-found" data-testid="members-not-found">
                            <img src={NotFoundIcon} alt="members-not-found" data-testid="members-not-found-icon" />
                            <p>{TEAM_NOT_FOUND}</p>
                        </div>
                    }
                />

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
