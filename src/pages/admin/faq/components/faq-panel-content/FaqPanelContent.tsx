import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { FaqQuestion, FaqSearchItemData, VisitorPage } from '@/types/admin/faq';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FaqApi } from '@/services/api/admin/faq/faq-api';
import { VisibilityStatus, ModalMode } from '@/types/admin/common';
import { FAQ_TEXT } from '@/const/admin/faq';
import { ToastType } from '@/types/admin/toast';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { FaqModal } from '../faq-modals/faq-modal/FaqModal';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { DeleteFaqModal } from '../faq-modals/delete-faq-modal/DeleteFaqModal';
import { FaqComponent } from '../faq-component/FaqComponent';
import { useVisitorPages } from '@/contexts/admin/visitor-pages-provider/VisitorPagesProvider';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { FaqSearchItem } from '../faq-search-item/FaqSearchItem';
import { mapFaqQuestionDtoToModel } from '@/utils/functions/mappers/admin/faq/faq-mappers';
import axios from 'axios';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { TranslateFaqModal } from '../faq-modals/translate-faq-modal/TranslateFaqModal';
import './FaqPanelContent.scss';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

interface ModalState {
    isAddFaqModalOpen: boolean;
    faqToDelete: FaqQuestion | null;
    faqToEdit: FaqQuestion | null;
    faqToTranslate: FaqQuestion | null;
}

enum ErrorType {
    Pages,
    Faq,
    Search,
    Languages,
    Language,
}

interface ErrorState {
    message: string | null;
    type: ErrorType | null;
}

export const FaqPanelContent = () => {
    const { addToast } = useToast();
    const client = useAdminClient();
    const {
        pages: visitorPages,
        isLoading: isVisitorPagesLoading,
        error: visitorPagesError,
        refetchPages,
    } = useVisitorPages();
    const [selectedVisitorPage, setSelectedVisitorPage] = useState<VisitorPage | null>(null);
    const [faqs, setFaqs] = useState<FaqQuestion[]>([]);
    const [listSize, setListSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const [hasMore, setHasMore] = useState(true);
    const [searchFaqId, setSearchFaqId] = useState<number | undefined>();
    const [isSearchResultView, setIsSearchResultView] = useState(false);
    const [isFaqsLoading, setIsFaqsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });

    const [modalState, setModalState] = useState<ModalState>({
        isAddFaqModalOpen: false,
        faqToDelete: null,
        faqToEdit: null,
        faqToTranslate: null,
    });

    const listContainerRef = useRef<HTMLDivElement>(null);
    const currentItemsCountRef = useRef<number>(0);
    const selectedVisitorPageRef = useRef<VisitorPage | null>(null);
    const currentPaginationPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isFaqsLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const setErrorState = useCallback((message: string | null, type: ErrorType | null = null) => {
        setError({ message, type });
    }, []);

    const {
        allLanguages,
        translationLanguages,
        selectedLanguage,
        onLanguageChange,
        translationStatusFilter,
        onTranslationStatusFilterChange,
        retryFetchLanguages,
    } = useLocalizationToolkit({ setErrorState });

    const isAnyModalOpened = useMemo(() => {
        return Object.values(modalState).some((value) => (typeof value === 'boolean' ? value : value !== null));
    }, [modalState]);

    const updateModalState = useCallback((updates: Partial<ModalState>) => {
        setModalState((prev) => ({ ...prev, ...updates }));
    }, []);

    const closeModalActions = useMemo(
        () => ({
            addFaq: () => updateModalState({ isAddFaqModalOpen: false }),
            editFaq: () => updateModalState({ faqToEdit: null }),
            deleteFaq: () => updateModalState({ faqToDelete: null }),
            translateFaq: () => updateModalState({ faqToTranslate: null }),
        }),
        [updateModalState],
    );

    const handleTranslateFaqModalOpen = useCallback(
        (faq: FaqQuestion) => {
            if (isAnyModalOpened) return;
            updateModalState({ faqToTranslate: faq });
        },
        [isAnyModalOpened, updateModalState],
    );

    const handleTranslateFaqSuccess = useCallback(
        (updatedFaq: FaqQuestion) => {
            setFaqs((prevFaqs) => prevFaqs.map((faq) => (faq.id === updatedFaq.id ? updatedFaq : faq)));

            updateModalState({ faqToTranslate: null });

            if (updatedFaq.status === VisibilityStatus.Published) {
                addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS, ToastType.Success);
            } else {
                addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS, ToastType.Success);
            }
        },
        [updateModalState, addToast],
    );

    const resetFaqsState = useCallback(() => {
        setFaqs([]);
        setHasMore(true);
        setErrorState(null);
        currentPaginationPageRef.current = 1;
        currentItemsCountRef.current = 0;
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

                const fetchedFaqs = await FaqApi.getAll(
                    client,
                    searchPageId.id,
                    translationStatusFilter,
                    searchStatus,
                    offset,
                    listSize,
                );

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
        [setErrorState, listSize, statusFilter, client, visitorPages, translationStatusFilter],
    );

    const getSearchedFaq = useCallback(async (): Promise<FaqQuestion | null> => {
        if (!searchFaqId) return null;

        const dto = await FaqApi.getById(client, searchFaqId);
        return mapFaqQuestionDtoToModel(dto, visitorPages);
    }, [searchFaqId, client, visitorPages]);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handleFaqSuggestionSelect = useCallback(
        (faqId: string | number) => {
            setIsSearchResultView(true);
            setSearchFaqId(typeof faqId === 'string' ? parseInt(faqId, 10) : faqId);
            setStatusFilter(undefined);
            resetFaqsState();
        },
        [resetFaqsState],
    );

    const {
        data: fetchedSearchFaq,
        isLoading: isSearchFaqLoading,
        setData: updateSearchedFaq,
    } = useDataFetch<FaqQuestion | null>({
        initialData: null,
        fetchHandler: getSearchedFaq,
        autoFetchDependencies: [searchFaqId],
        autoFetchDisabled: !isSearchResultView || !searchFaqId,
    });

    const handleSearchClear = useCallback(() => {
        setIsSearchResultView(false);
        setSearchFaqId(undefined);
        updateSearchedFaq(null);
        resetFaqsState();
        fetchFaqs(true);
    }, [fetchFaqs, resetFaqsState, updateSearchedFaq]);

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
        async (reorderedFaqs: FaqQuestion[]) => {
            if (!selectedVisitorPage) return;
            const previousState = faqs;

            try {
                setFaqs(reorderedFaqs);
                const orderedIds = reorderedFaqs.map((m) => m.id);
                await FaqApi.reorder(client, { pageId: selectedVisitorPage.id, orderedIds });
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setFaqs(previousState);
                setErrorState(FAQ_TEXT.MESSAGE.FAIL_TO_REORDER_FAQ, ErrorType.Faq);
            }
        },
        [client, selectedVisitorPage, setErrorState, faqs],
    );

    const handleRetry = useCallback(() => {
        if (error.type === ErrorType.Faq) {
            resetFaqsState();
            fetchFaqs(true);
        } else if (error.type === ErrorType.Pages) {
            refetchPages();
        } else if (error.type === ErrorType.Languages) {
            retryFetchLanguages();
        }
    }, [error.type, fetchFaqs, resetFaqsState, refetchPages, retryFetchLanguages]);

    const updateListSize = () => {
        if (listContainerRef.current) {
            const calculatedListSize =
                Math.floor(listContainerRef.current.clientHeight / LIST_ITEM_HEIGHT_IN_PIXELS) + 1;
            setListSize(Math.max(calculatedListSize, DEFAULT_LOAD_ITEMS_COUNT));
        }
    };

    useEffect(() => {
        if (visitorPagesError) {
            setError({
                message: FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_PAGES,
                type: ErrorType.Pages,
            });
        }
    }, [visitorPagesError]);

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
    }, [selectedVisitorPage]);

    useEffect(() => {
        if (selectedVisitorPage) {
            resetFaqsState();
            fetchFaqs(true);
        }
    }, [statusFilter, selectedVisitorPage, fetchFaqs, resetFaqsState]);

    const handleAddFaq = useCallback(
        (faq: FaqQuestion) => {
            const belongsToSelectedPage = faq.pages.map((p) => p.id).includes(selectedVisitorPage?.id!);
            const passesStatusFilter = statusFilter === undefined || faq.status === statusFilter;

            setFaqs((prevFaqs) => {
                if (
                    prevFaqs.length < listSize * currentPaginationPageRef.current &&
                    belongsToSelectedPage &&
                    passesStatusFilter
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
        [updateModalState, listSize, selectedVisitorPage?.id, addToast, statusFilter],
    );

    const handleEditFaq = useCallback(
        (updatedFaq: FaqQuestion) => {
            const belongsToSelectedPage = updatedFaq.pages.some((p) => p.id === selectedVisitorPage?.id);
            const passesStatusFilter = statusFilter === undefined || updatedFaq.status === statusFilter;

            setFaqs((prevFaqs) => {
                if (belongsToSelectedPage && passesStatusFilter) {
                    return prevFaqs.map((faq) => (faq.id === updatedFaq.id ? updatedFaq : faq));
                }
                return prevFaqs.filter((faq) => faq.id !== updatedFaq.id);
            });
            updateModalState({ faqToEdit: null });
        },
        [updateModalState, selectedVisitorPage?.id, statusFilter],
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
        (faq: FaqQuestion) => {
            if (!selectedLanguage) return null;

            const component = (
                <FaqComponent
                    key={faq.id}
                    faq={faq}
                    handleOnDeleteFaq={handleDeleteFaqModalOpen}
                    handleOnEditFaq={handleEditFaqModalOpen}
                    handleOnTranslateFaq={handleTranslateFaqModalOpen}
                    language={selectedLanguage}
                    translationLanguages={translationLanguages}
                />
            );

            return statusFilter === undefined ? (
                <DraggableListItem
                    key={faq.id}
                    entity={faq}
                    id={faq.id}
                    ariaLabel={FAQ_TEXT.ACTIONS.REORDER}
                    renderEntityComponent={() => component}
                    entities={faqs}
                    idSelector={(q) => q.id}
                    onEntitiesReordered={handleEntitiesReordered}
                />
            ) : (
                <div className="nondraggable-faq-item-wrapper">{component}</div>
            );
        },
        [
            handleDeleteFaqModalOpen,
            handleEditFaqModalOpen,
            handleEntitiesReordered,
            faqs,
            statusFilter,
            handleTranslateFaqModalOpen,
            selectedLanguage,
            translationLanguages,
        ],
    );

    const displayFaqItems = isSearchResultView ? (fetchedSearchFaq ? [fetchedSearchFaq] : []) : faqs;

    const fetchFaqSearchItemsForToolbar = useCallback(
        (searchTerm: string, pagination: PaginationRequestParams) => {
            return FaqApi.fetchFaqSearchItems(
                client,
                searchTerm,
                pagination.offset ?? 0,
                pagination.limit ?? 5,
                pagination.requestOptions?.cancellationSignal,
            );
        },
        [client],
    );

    return (
        <div className="faq-panel-wrapper" data-testid="faq-panel-content">
            <div className="faq-panel-toolbar-container">
                <AdminPanelToolbar<FaqSearchItemData>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.question}
                    fetchSearchItems={fetchFaqSearchItemsForToolbar}
                    renderSearchItemComponent={FaqSearchItem}
                    placeholder={FAQ_TEXT.PLACEHOLDER.SEARCH_FAQ}
                    onSearchClear={handleSearchClear}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={handleAddFaqModalOpen}
                    AddItemButtonText={FAQ_TEXT.BUTTON.ADD_FAQ}
                    onSuggestionSelect={handleFaqSuggestionSelect}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.FAQ}
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
                    items={displayFaqItems}
                    renderItem={renderFaqItem}
                    onLoadMore={fetchFaqs}
                    hasMore={isSearchResultView ? false : hasMore}
                    isLoading={isFaqsLoading || isVisitorPagesLoading || isSearchFaqLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <FaqModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddFaqModalOpen}
                onClose={closeModalActions.addFaq}
                onAddFaq={handleAddFaq}
                pages={visitorPages}
            />

            <FaqModal
                mode={ModalMode.Edit}
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

            <TranslateFaqModal
                isOpen={!!modalState.faqToTranslate}
                onClose={closeModalActions.translateFaq}
                faqToTranslate={modalState.faqToTranslate}
                onTranslateFaq={handleTranslateFaqSuccess}
                translatedLanguages={translationLanguages}
            />

            <ToastContainer />
        </div>
    );
};
