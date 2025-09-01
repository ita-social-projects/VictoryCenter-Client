import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { FaqQuestion, FaqSearchItemData, mapFaqQuestionDtoToModel, VisitorPage } from '../../../../../types/admin/faq';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { FaqApi } from '../../../../../services/api/admin/faq/faq-api';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { FAQ_TEXT } from '../../../../../const/admin/faq';
import { ToastType } from '../../../../../types/admin/toast';
import { DraggableListItem } from '../../../../../components/admin/draggable-list-item/DraggableListItem';
import { InfiniteScrollList } from '../../../../../components/admin/infinite-scroll-list/InfiniteScrollList';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { FaqModal } from '../faq-modals/faq-modal/FaqModal';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import { DeleteFaqModal } from '../faq-modals/delete-faq-modal/DeleteFaqModal';
import { FaqComponent } from '../faq-component/FaqComponent';
import { useVisitorPages } from '../../../../../contexts/admin/visitor-pages-provider/VisitorPagesProvider';
import './FaqPanelContent.scss';
import axios from 'axios';
import { createPartialUpdater } from '../../../../../utils/functions/create-partial-updater/create-partial-updater';
import { AdminPanelToolbar } from '../../../../../components/admin/admin-panel-toolbar/AdminPageToolbar';
import { FaqSearchItem } from '../faq-search-item/FaqSearchItem';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

interface ModalState {
    isAddFaqModalOpen: boolean;
    faqToDelete: FaqQuestion | null;
    faqToEdit: FaqQuestion | null;
}

enum ErrorType {
    Pages,
    Faq,
    Search,
}

interface ErrorState {
    message: string | null;
    type: ErrorType | null;
}

export const FaqPanelContent = () => {
    const { addToast } = useToast();
    const client = useAdminClient();
    const { pages: visitorPages, isLoading: isVisitorPagesLoading, error: visitorPagesError } = useVisitorPages();
    const [selectedVisitorPage, setSelectedVisitorPage] = useState<VisitorPage | null>(null);
    const [faqs, setFaqs] = useState<FaqQuestion[]>([]);
    const [listSize, setListSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const [hasMore, setHasMore] = useState(true);
    const [isFaqsLoading, setIsFaqsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [modalState, setModalState] = useState<ModalState>({
        isAddFaqModalOpen: false,
        faqToDelete: null,
        faqToEdit: null,
    });

    const listContainerRef = useRef<HTMLDivElement>(null);
    const currentItemsCountRef = useRef<number>(0);
    const totalItemsCountRef = useRef<number | null>(null);
    const selectedVisitorPageRef = useRef<VisitorPage | null>(null);
    const currentPaginationPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isFaqsLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const setErrorState = useCallback((message: string | null, type: ErrorType | null = null) => {
        setError({ message, type });
    }, []);

    const updateModalState = useCallback(createPartialUpdater(setModalState), []);

    const isAnyModalOpened = useMemo(() => {
        return Object.values(modalState).some((value) => (typeof value === 'boolean' ? value : value !== null));
    }, [modalState]);

    const closeModalActions = useMemo(
        () => ({
            addFaq: () => updateModalState({ isAddFaqModalOpen: false }),
            editFaq: () => updateModalState({ faqToEdit: null }),
            deleteFaq: () => updateModalState({ faqToDelete: null }),
        }),
        [updateModalState],
    );

    const resetFaqsState = useCallback(() => {
        setFaqs([]);
        setHasMore(true);
        setErrorState(null);
        currentPaginationPageRef.current = 1;
        currentItemsCountRef.current = 0;
        totalItemsCountRef.current = null;
        isFaqsLoadingRef.current = false;
        hasMoreRef.current = true;
    }, [setErrorState]);

    const fetchFaqs = useCallback(
        async (shouldResetList: boolean = false) => {
            if (
                isFaqsLoadingRef.current ||
                !selectedVisitorPageRef.current ||
                !hasMoreRef.current ||
                abortControllerRef.current?.signal.aborted
            ) {
                return;
            }

            abortControllerRef.current?.abort();

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                isFaqsLoadingRef.current = true;
                setIsFaqsLoading(true);
                setErrorState(null);

                const searchPageId = selectedVisitorPageRef.current;
                const searchStatus = statusFilter;
                const paginationPageToFetch = shouldResetList ? 0 : currentPaginationPageRef.current;
                const offset = paginationPageToFetch * listSize;

                const fetchedFaqs = await FaqApi.getAll(client, searchPageId.id, searchStatus, offset, listSize);

                if (abortController.signal.aborted) {
                    return;
                }

                const mappedFaqs = fetchedFaqs.items.map((item) => mapFaqQuestionDtoToModel(item, visitorPages));
                setFaqs((prev) => {
                    if (shouldResetList) {
                        return [...mappedFaqs];
                    } else {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const uniqueMappedFaqs = mappedFaqs.filter((m) => !existingIds.has(m.id));
                        return [...prev, ...uniqueMappedFaqs];
                    }
                });

                currentPaginationPageRef.current = paginationPageToFetch + 1;

                if (shouldResetList) {
                    currentItemsCountRef.current = mappedFaqs.length;
                } else {
                    currentItemsCountRef.current += mappedFaqs.length;
                }

                setHasMore(currentItemsCountRef.current < fetchedFaqs.totalItemsCount);
                hasMoreRef.current = currentItemsCountRef.current < fetchedFaqs.totalItemsCount;
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_FAQ, ErrorType.Faq);
            } finally {
                isFaqsLoadingRef.current = false;
                setIsFaqsLoading(false);
            }
        },
        [setErrorState, listSize, statusFilter, client, visitorPages],
    );

    // Implement search functionality
    // const handleSearchQueryByName = useCallback((_: string) => {}, []);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handlePageSelect = useCallback(
        (page: VisitorPage) => {
            setSelectedVisitorPage(page);
            resetFaqsState();
        },
        [resetFaqsState],
    );

    const handleAddFaqModalOpen = useCallback(() => {
        updateModalState({ isAddFaqModalOpen: true });
    }, [updateModalState]);

    const handleDeleteFaqModalOpen = useCallback(
        (faq: FaqQuestion) => {
            if (isAnyModalOpened) return;
            updateModalState({ faqToDelete: faq });
        },
        [isAnyModalOpened, updateModalState],
    );

    const handleEditFaqModalOpen = useCallback(
        (faq: FaqQuestion) => {
            if (isAnyModalOpened) return;
            updateModalState({ faqToEdit: faq });
        },
        [isAnyModalOpened, updateModalState],
    );

    const handleEntitiesReordered = useCallback(
        async (faqs: FaqQuestion[]) => {
            try {
                setFaqs(faqs);
                const orderedIds = faqs.map((m) => m.id);
                const pageId = selectedVisitorPage?.id ?? 0;

                await FaqApi.reorder(client, { pageId, orderedIds });
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(FAQ_TEXT.MESSAGE.FAIL_TO_REORDER_FAQ, ErrorType.Faq);
            }
        },
        [client, selectedVisitorPage?.id, setErrorState],
    );

    const handleRetry = useCallback(() => {
        if (error.type === ErrorType.Faq) {
            resetFaqsState();
        }
    }, [error.type, resetFaqsState]);

    const updateListSize = () => {
        if (listContainerRef.current) {
            const calculatedListSize =
                Math.floor(listContainerRef.current.clientHeight / LIST_ITEM_HEIGHT_IN_PIXELS) + 1;
            setListSize(Math.max(calculatedListSize, DEFAULT_LOAD_ITEMS_COUNT));
        }
    };

    useEffect(() => {
        window.addEventListener('resize', updateListSize);
        return () => window.removeEventListener('resize', updateListSize);
    }, []);

    useEffect(() => {
        updateListSize();
    }, [listContainerRef]);

    useEffect(() => {
        if (!selectedVisitorPage && visitorPages && visitorPages.length > 0) {
            setSelectedVisitorPage(visitorPages[0]);
        }
    }, [visitorPages, selectedVisitorPage]);

    useEffect(() => {
        selectedVisitorPageRef.current = selectedVisitorPage;
        if (selectedVisitorPage) {
            resetFaqsState();
        }
    }, [selectedVisitorPage, resetFaqsState]);

    useEffect(() => {
        if (selectedVisitorPage) {
            resetFaqsState();
            fetchFaqs(true);
        }
    }, [statusFilter, selectedVisitorPage, statusFilter, fetchFaqs, resetFaqsState]);

    const handleAddFaq = useCallback(
        (faq: FaqQuestion) => {
            setFaqs((prevFaqs) => {
                if (
                    prevFaqs.length < listSize * currentPaginationPageRef.current &&
                    faq.pages.map((p) => p.id).includes(selectedVisitorPage?.id || -1)
                ) {
                    return [...prevFaqs, faq];
                } else {
                    setHasMore(true);
                    hasMoreRef.current = true;
                }
                return prevFaqs;
            });

            currentItemsCountRef.current += 1;

            updateModalState({ isAddFaqModalOpen: false });
            if (faq.status === VisibilityStatus.Published) {
                addToast(FAQ_TEXT.MESSAGE.DONT_FORGET_TO_ORDER, ToastType.Info);
            }
        },
        [updateModalState, listSize, selectedVisitorPage?.id, addToast],
    );

    const handleEditFaq = useCallback(
        (updatedFaq: FaqQuestion) => {
            setFaqs((prevFaqs) => prevFaqs.map((faq) => (faq.id === updatedFaq.id ? updatedFaq : faq)));

            updateModalState({ faqToEdit: null });
        },
        [updateModalState],
    );

    const handleDeleteFaq = useCallback(
        (faqToDelete: FaqQuestion) => {
            setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq.id !== faqToDelete.id));

            currentItemsCountRef.current -= 1;

            updateModalState({ faqToDelete: null });
        },
        [updateModalState],
    );

    const renderFaqItem = useCallback(
        (faq: FaqQuestion) => (
            <DraggableListItem
                key={faq.id}
                entity={faq}
                id={faq.id}
                ariaLabel={FAQ_TEXT.ACTIONS.REORDER}
                renderEntityComponent={(q) => (
                    <FaqComponent
                        key={q.id}
                        faq={q}
                        handleOnDeleteFaq={handleDeleteFaqModalOpen}
                        handleOnEditFaq={handleEditFaqModalOpen}
                    />
                )}
                entities={faqs}
                idSelector={(q) => q.id}
                onEntitiesReordered={handleEntitiesReordered}
            ></DraggableListItem>
        ),
        [handleDeleteFaqModalOpen, handleEditFaqModalOpen, handleEntitiesReordered, faqs],
    );

    return (
        <div className="faq-panel-wrapper" data-testid="faq-panel-content">
            <div className="faq-panel-toolbar-container">
                <AdminPanelToolbar<FaqSearchItemData>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.question}
                    fetchSearchItems={FaqApi.getSearchItems}
                    renderSearchItemComponent={FaqSearchItem}
                    placeholder={FAQ_TEXT.PLACEHOLDER.SEARCH_FAQ}
                    onSearchClear={() => {}}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={handleAddFaqModalOpen}
                    AddItemButtonText={FAQ_TEXT.BUTTON.ADD_FAQ}
                    onSuggestionSelect={() => {}}
                />
            </div>

            <div className="faq-panel-list-container" ref={listContainerRef}>
                <CategoryBar<VisitorPage>
                    categories={visitorPages}
                    selectedCategory={selectedVisitorPage}
                    onCategorySelect={handlePageSelect}
                    getCategoryDisplayName={(page) => page.title}
                    getCategoryKey={(page) => page.id}
                    displayContextMenuButton={false}
                />

                {error.message && (
                    <div className="faq-panel-error-container" data-testid="faq-error-container">
                        <span>{error.message}</span>
                        <button onClick={handleRetry} type="button" className="retry-link">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                <InfiniteScrollList<FaqQuestion>
                    items={faqs}
                    renderItem={renderFaqItem}
                    onLoadMore={fetchFaqs}
                    hasMore={hasMore}
                    isLoading={isFaqsLoading || isVisitorPagesLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <FaqModal
                mode="add"
                isOpen={modalState.isAddFaqModalOpen}
                onClose={closeModalActions.addFaq}
                onAddFaq={handleAddFaq}
                pages={visitorPages}
            />

            <FaqModal
                mode="edit"
                isOpen={!!modalState.faqToEdit}
                onClose={closeModalActions.editFaq}
                faqToEdit={modalState.faqToEdit!}
                onEditFaq={handleEditFaq}
                pages={visitorPages}
            />

            <DeleteFaqModal
                isOpen={!!modalState.faqToDelete}
                onClose={closeModalActions.deleteFaq}
                faqToDelete={modalState.faqToDelete}
                onDeleteFaq={handleDeleteFaq}
            />

            <ToastContainer />
        </div>
    );
};
