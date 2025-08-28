import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { FaqQuestion, VisitorPage } from '../../../../../types/admin/faq';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { FaqApi } from '../../../../../services/api/admin/faq/faq-api';
import { VisibilityStatus } from '../../../../../types/admin/common';
import axios from 'axios';
import { FAQ_TEXT } from '../../../../../const/admin/faq';
import { ToastType } from '../../../../../types/admin/toast';
import { DraggableListItem } from '../../../../../components/admin/draggable-list-item/DraggableListItem';
import { FaqPanelToolbar } from '../faq-panel-toolbar/FaqPanelToolbar';
import { InfiniteScrollList } from '../../../../../components/admin/infinite-scroll-list/InfiniteScrollList';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { FaqModal } from '../faq-modals/faq-modal/FaqModal';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import { DeleteFaqModal } from '../faq-modals/delete-faq-modal/DeleteFaqModal';
import { FaqComponent } from '../faq-component/FaqComponent';

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
    const [pages, setPages] = useState<VisitorPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<VisitorPage | null>(null);
    const [faqs, setFaqs] = useState<FaqQuestion[]>([]);
    const [listSize, setListSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const [hasMore, setHasMore] = useState(true);
    const [isFaqsLoading, setIsFaqsLoading] = useState(false);
    const [isPagesLoading, setIsPagesLoading] = useState(false);
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
    const selectedPageRef = useRef<VisitorPage | null>(null);
    const currentPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isFaqsLoadingRef = useRef(false);
    const isPagesLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const setErrorState = useCallback((message: string, type: ErrorType) => {
        setError({ message, type });
    }, []);

    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const updateModalState = useCallback((updates: Partial<ModalState>) => {
        setModalState((prev) => ({ ...prev, ...updates }));
    }, []);

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
        clearError();
        currentPageRef.current = 1;
        currentItemsCountRef.current = 0;
        totalItemsCountRef.current = null;
        isFaqsLoadingRef.current = false;
        hasMoreRef.current = true;
    }, [clearError]);

    const fetchPages = useCallback(async () => {
        if (isPagesLoadingRef.current) {
            return;
        }

        try {
            isPagesLoadingRef.current = true;
            setIsPagesLoading(true);
            clearError();

            const fetchedPages = await FaqApi.getPages(client);
            setPages(fetchedPages);

            if (fetchedPages.length > 0) {
                setSelectedPage((prevSelected) => prevSelected ?? fetchedPages[0]);
            }
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }

            setErrorState(FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_PAGES, ErrorType.Pages);
        } finally {
            isPagesLoadingRef.current = false;
            setIsPagesLoading(false);
        }
    }, [clearError, setErrorState, client]);

    const fetchFaqs = useCallback(
        async (shouldResetList: boolean = false) => {
            if (
                isFaqsLoadingRef.current ||
                !selectedPageRef.current ||
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
                clearError();

                const searchPageId = selectedPageRef.current;
                const searchStatus = statusFilter;
                const pageToFetch = shouldResetList ? 0 : currentPageRef.current;
                const offset = pageToFetch * listSize;

                const fetchedFaqs = await FaqApi.getAll(client, searchPageId.id, searchStatus, offset, listSize);

                if (abortController.signal.aborted) {
                    return;
                }

                setFaqs((prev) => {
                    if (shouldResetList) {
                        return [...fetchedFaqs.items];
                    } else {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const uniqueFetchedFaqs = fetchedFaqs.items.filter((m) => !existingIds.has(m.id));
                        return [...prev, ...uniqueFetchedFaqs];
                    }
                });

                currentPageRef.current = pageToFetch + 1;

                if (shouldResetList) {
                    currentItemsCountRef.current = fetchedFaqs.items.length;
                } else {
                    currentItemsCountRef.current += fetchedFaqs.items.length;
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
        [clearError, setErrorState, listSize, statusFilter, client],
    );

    const handleSearchQueryByName = useCallback((_: string) => {
        // Implement search functionality
    }, []);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handlePageSelect = useCallback(
        (page: VisitorPage) => {
            setSelectedPage(page);
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
                const pageId = selectedPage?.id ?? 0;

                await FaqApi.reorder(client, pageId, orderedIds);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(FAQ_TEXT.MESSAGE.FAIL_TO_REORDER_FAQ, ErrorType.Faq);
            }
        },
        [client, selectedPage?.id, setErrorState],
    );

    const handleRetry = useCallback(() => {
        if (error.type === ErrorType.Pages) {
            fetchPages();
        } else if (error.type === ErrorType.Faq) {
            resetFaqsState();
        }
    }, [error.type, fetchPages, resetFaqsState]);

    const updatePageSize = () => {
        if (listContainerRef.current) {
            const calculatedPageSize =
                Math.floor(listContainerRef.current.clientHeight / LIST_ITEM_HEIGHT_IN_PIXELS) + 1;
            setListSize(Math.max(calculatedPageSize, DEFAULT_LOAD_ITEMS_COUNT));
        }
    };

    useEffect(() => {
        window.addEventListener('resize', updatePageSize);
        return () => window.removeEventListener('resize', updatePageSize);
    }, []);

    useEffect(() => {
        updatePageSize();
    }, [listContainerRef]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    useEffect(() => {
        selectedPageRef.current = selectedPage;
        if (selectedPage) {
            resetFaqsState();
        }
    }, [selectedPage, resetFaqsState]);

    useEffect(() => {
        if (selectedPage) {
            resetFaqsState();
            fetchFaqs(true);
        }
    }, [statusFilter, selectedPage, statusFilter, fetchFaqs, resetFaqsState]);

    const handleAddFaq = useCallback(
        (faq: FaqQuestion) => {
            setFaqs((prevFaqs) => {
                if (
                    prevFaqs.length < listSize * currentPageRef.current &&
                    faq.pages.map((p) => p.id).includes(selectedPage?.id || -1)
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
        [updateModalState, listSize, selectedPage?.id, addToast],
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
        <div className="team-page-wrapper" data-testid="team-page-content">
            <div className="team-page-toolbar-container">
                <FaqPanelToolbar
                    onFaqSelect={() => {}}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddFaq={handleAddFaqModalOpen}
                />
            </div>

            <div className="team-page-list-container" ref={listContainerRef}>
                <CategoryBar<VisitorPage>
                    categories={pages}
                    selectedCategory={selectedPage}
                    onCategorySelect={handlePageSelect}
                    getCategoryDisplayName={(page) => page.title}
                    getCategoryKey={(page) => page.id}
                    displayContextMenuButton={false}
                />

                {error.message && (
                    <div className="team-page-error-container" data-testid="team-error-container">
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
                    isLoading={isFaqsLoading || isPagesLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <FaqModal
                mode="add"
                isOpen={modalState.isAddFaqModalOpen}
                onClose={closeModalActions.addFaq}
                onAddFaq={handleAddFaq}
                pages={pages}
            />

            <FaqModal
                mode="edit"
                isOpen={!!modalState.faqToEdit}
                onClose={closeModalActions.editFaq}
                faqToEdit={modalState.faqToEdit!}
                onEditFaq={handleEditFaq}
                pages={pages}
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
