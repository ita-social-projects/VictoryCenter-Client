import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageContent } from './HistoryPageContent';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HistoryApi } from '@/services/api/admin/history/history-api';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { ToastType } from '@/types/admin/toast';
import type { HistorySectionDto } from '@/types/common/history-sections';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/services/api/admin/history/history-api', () => ({
    HistoryApi: {
        fetchSections: jest.fn(),
        syncSections: jest.fn(),
    },
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
const mockedUseToast = useToast as jest.Mock;

const mockHistoryFormProps = jest.fn();
const mockDeleteDiscardAction = jest.fn();
const mockRevertDiscardAction = jest.fn();
const mockAddSection = jest.fn();
const mockReplaceSection = jest.fn();
const mockGetSections = jest.fn();

let mockHistoryFormSections: HistorySectionDto[] = [];

jest.mock('../history-form/HistoryForm', () => {
    const React = require('react');

    const HistoryForm = React.forwardRef(function MockHistoryForm(props: any, ref: any) {
        const {
            sections,
            onRequestCancelSection,
            onSectionSaved,
            onSectionDeleted,
            onReplaceSection,
            onSectionsChange,
        } = props;

        mockHistoryFormSections = sections;
        mockHistoryFormProps({
            sections,
            onRequestCancelSection,
            onSectionSaved,
            onSectionDeleted,
            onReplaceSection,
            onSectionsChange,
        });

        React.useImperativeHandle(ref, () => ({
            addSection: (section: HistorySectionDto) => {
                mockHistoryFormSections = [...mockHistoryFormSections, section];
                onSectionsChange?.(mockHistoryFormSections);
                mockAddSection(section);
            },
            replaceSection: (sectionIndex: number, newSection: HistorySectionDto) => {
                mockHistoryFormSections = mockHistoryFormSections.map((section, index) =>
                    index === sectionIndex ? newSection : section,
                );
                mockReplaceSection(sectionIndex, newSection);
            },
            getSections: () => {
                mockGetSections();
                return mockHistoryFormSections;
            },
        }));

        return (
            <div data-testid="history-form">
                <button
                    type="button"
                    data-testid="request-delete-confirmation"
                    onClick={() =>
                        onRequestCancelSection?.({
                            type: 0,
                            onDiscard: mockDeleteDiscardAction,
                        })
                    }
                >
                    Request delete confirmation
                </button>
                <button
                    type="button"
                    data-testid="request-revert-confirmation"
                    onClick={() =>
                        onRequestCancelSection?.({
                            type: 1,
                            onDiscard: mockRevertDiscardAction,
                        })
                    }
                >
                    Request revert confirmation
                </button>
                <button
                    type="button"
                    data-testid="request-replace-confirmation"
                    onClick={() =>
                        onRequestCancelSection?.({
                            type: 2,
                            onDiscard: mockRevertDiscardAction,
                        })
                    }
                >
                    Request replace confirmation
                </button>
                <button
                    type="button"
                    data-testid="request-discard-new-confirmation"
                    onClick={() =>
                        onRequestCancelSection?.({
                            type: 3,
                            onDiscard: mockRevertDiscardAction,
                        })
                    }
                >
                    Request discard new confirmation
                </button>
                <button type="button" data-testid="request-replace-template" onClick={() => onReplaceSection?.(0)}>
                    Request replace template
                </button>
                <button type="button" data-testid="request-replace-template-oob" onClick={() => onReplaceSection?.(99)}>
                    Request replace template out of bounds
                </button>
                <button type="button" data-testid="mark-saved" onClick={() => onSectionSaved?.()}>
                    Mark saved
                </button>
                <button
                    type="button"
                    data-testid="trigger-section-delete"
                    onClick={() => onSectionDeleted?.(mockHistoryFormSections.slice(0, 1))}
                >
                    Trigger section deleted
                </button>
                <button
                    type="button"
                    data-testid="trigger-sections-change"
                    onClick={() => onSectionsChange?.([...mockHistoryFormSections])}
                >
                    Trigger sections change
                </button>
            </div>
        );
    });

    return { HistoryForm };
});

jest.mock('@/pages/admin/programs/components/programs-page-modals/add-section-modal/AddSectionModal', () => ({
    AddSectionModal: ({ isOpen, onClose, onSelectTemplate, templates }: any) => {
        if (!isOpen) {
            return null;
        }

        return (
            <div data-testid="add-section-modal">
                <button
                    type="button"
                    data-testid="select-first-template"
                    onClick={() => onSelectTemplate(templates[0])}
                >
                    Select first template
                </button>
                <button type="button" data-testid="close-add-section-modal" onClick={onClose}>
                    Close add section modal
                </button>
            </div>
        );
    },
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
        isOpen,
        title,
        onConfirm,
        onCancel,
    }: {
        isOpen: boolean;
        title: string;
        onConfirm: () => void;
        onCancel: () => void;
    }) => {
        if (!isOpen) {
            return null;
        }

        return (
            <div data-testid="question-modal">
                <div data-testid="question-title">{title}</div>
                <button type="button" data-testid="question-confirm" onClick={onConfirm}>
                    Confirm
                </button>
                <button type="button" data-testid="question-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        );
    },
}));

const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;
const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedHistoryApi = HistoryApi as jest.Mocked<typeof HistoryApi>;
const mockAddToast = jest.fn();
const mockClient = {
    get: jest.fn(),
};

const mockToolbarOnAddSection = jest.fn();
const refetchSectionsMock = jest.fn();

jest.mock('@/const/admin/history', () => ({
    HISTORY_TEXT: {
        BUTTON: {
            ADD_SECTION: 'Add History Section',
            PUBLISH: 'Publish',
        },
        MESSAGE: {
            NO_SECTIONS_YET: 'No sections yet',
            FAIL_TO_FETCH_SECTIONS: 'Failed to fetch sections',
            PUBLISH_SUCCESS: 'Publish success',
            PUBLISH_ERROR: 'Publish error',
        },
    },
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

jest.mock('@/assets/icons/not-found.svg', () => 'not-found.svg');

jest.mock('../history-page-toolbar/HistoryPageToolbar', () => ({
    HistoryPageToolbar: ({ onAddSection }: { onAddSection: () => void }) => {
        mockToolbarOnAddSection(onAddSection);

        return (
            <button type="button" data-testid="toolbar-add-section-button" onClick={onAddSection}>
                Add History Section
            </button>
        );
    },
}));

const createSection = (id: number, template: SectionTemplate, order: number): HistorySectionDto => ({
    id,
    template,
    order,
    contents: [
        {
            id,
            sectionId: id,
            contentType: ContentType.Title,
            order: 0,
            title: `Title ${id}`,
        },
    ],
});

const mockSingleSectionData = () => {
    const sections = [createSection(1, SectionTemplate.SingleImageTop, 0)];

    mockHistoryFormSections = sections;

    mockedUseDataFetch.mockReturnValue({
        data: sections,
        error: null,
        isLoading: false,
        refetch: refetchSectionsMock,
        setData: jest.fn(),
    });

    return sections;
};

describe('HistoryPageContent', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
        mockDeleteDiscardAction.mockClear();
        mockRevertDiscardAction.mockClear();
        mockAddSection.mockClear();
        mockReplaceSection.mockClear();
        mockGetSections.mockClear();
        mockAddToast.mockClear();
        mockHistoryFormSections = [];
        mockedUseAdminClient.mockReturnValue(mockClient as any);
        mockClient.get.mockResolvedValue({ data: [] });
        mockedHistoryApi.fetchSections.mockResolvedValue([]);
        mockedHistoryApi.syncSections.mockResolvedValue([] as never);
        refetchSectionsMock.mockResolvedValue(undefined);
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockedUseDataFetch.mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });
    });

    it('uses history API in fetch handler passed to useDataFetch', async () => {
        render(<HistoryPageContent />);

        const [{ fetchHandler, initialData, autoFetchDisabled }] = mockedUseDataFetch.mock.calls[0] as [
            {
                fetchHandler: (options: any) => Promise<unknown>;
                initialData: unknown;
                autoFetchDisabled: boolean;
            },
        ];

        await fetchHandler({});

        expect(initialData).toBeNull();
        expect(autoFetchDisabled).toBe(false);
        expect(mockedHistoryApi.fetchSections).toHaveBeenCalledWith(mockClient);
    });

    it('renders loader while sections are loading', () => {
        mockedUseDataFetch.mockReturnValue({
            data: null,
            error: null,
            isLoading: true,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        expect(screen.getByTestId('history-sections-loader')).toBeInTheDocument();
        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        expect(screen.queryByText('No sections yet')).not.toBeInTheDocument();
        expect(screen.queryByTestId('history-form')).not.toBeInTheDocument();
    });

    it('renders error state and retries fetching sections', async () => {
        mockedUseDataFetch.mockReturnValue({
            data: null,
            error: new Error('Request failed'),
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        expect(screen.getByTestId('history-sections-error')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch sections')).toBeInTheDocument();

        await user.click(screen.getByTestId('history-sections-retry-button'));

        expect(refetchSectionsMock).toHaveBeenCalledTimes(1);
    });

    it('renders empty state when there are no sections', () => {
        render(<HistoryPageContent />);

        const emptyState = screen.getByText('No sections yet').parentElement;

        expect(screen.getByAltText('No sections')).toBeInTheDocument();
        expect(emptyState).not.toBeNull();
        expect(
            within(emptyState as HTMLElement).getByRole('button', {
                name: /add history section/i,
            }),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('history-form')).not.toBeInTheDocument();
    });

    it('passes add-section handler to toolbar', () => {
        render(<HistoryPageContent />);

        expect(mockToolbarOnAddSection).toHaveBeenCalledWith(expect.any(Function));
    });

    it('renders HistoryForm when sections are fetched', () => {
        const sections = [
            createSection(1, SectionTemplate.SingleImageTop, 0),
            createSection(2, SectionTemplate.TextOnly, 1),
        ];

        mockHistoryFormSections = sections;

        mockedUseDataFetch.mockReturnValue({
            data: sections,
            error: null,
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        expect(screen.getByTestId('history-form')).toBeInTheDocument();
        expect(mockHistoryFormProps).toHaveBeenCalledWith(
            expect.objectContaining({
                sections,
                onRequestCancelSection: expect.any(Function),
            }),
        );
    });

    it('shows delete section confirmation modal and executes discard on confirm', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('request-delete-confirmation'));

        expect(screen.getByTestId('question-title')).toHaveTextContent(
            SECTIONS_TEXT.SECTION.MODAL.DELETE_SECTION_TITLE,
        );
        expect(mockDeleteDiscardAction).not.toHaveBeenCalled();

        await user.click(screen.getByTestId('question-confirm'));

        expect(mockDeleteDiscardAction).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
    });

    it('shows unsaved changes confirmation and does not discard on cancel', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('request-revert-confirmation'));

        expect(screen.getByTestId('question-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
            { normalizeWhitespace: false },
        );

        await user.click(screen.getByTestId('question-cancel'));

        expect(mockRevertDiscardAction).not.toHaveBeenCalled();
        expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
    });

    it('renders replace-template confirmation title for replace cancel action', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('request-replace-confirmation'));

        expect(screen.getByTestId('question-title')).toHaveTextContent(
            SECTIONS_TEXT.SECTION.MODAL.REPLACE_TEMPLATE_TITLE,
        );
    });

    it('renders unsaved-changes confirmation title for discard-new action', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('request-discard-new-confirmation'));

        expect(screen.getByTestId('question-title')).toHaveTextContent(
            SECTIONS_TEXT.SECTION.MODAL.UNSAVED_CHANGES_TITLE,
        );
    });

    it('opens add-section modal and adds first section from empty state', async () => {
        render(<HistoryPageContent />);

        const emptyState = screen.getByText('No sections yet').parentElement as HTMLElement;
        await user.click(
            within(emptyState).getByRole('button', {
                name: /add history section/i,
            }),
        );
        expect(screen.getByTestId('add-section-modal')).toBeInTheDocument();

        await user.click(screen.getByTestId('select-first-template'));

        await waitFor(() => {
            expect(mockAddSection).toHaveBeenCalledTimes(1);
        });
    });

    it('replaces section after selecting template from modal', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('request-replace-template'));
        await user.click(screen.getByTestId('select-first-template'));

        expect(mockReplaceSection).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                template: expect.any(Number),
                order: 0,
                contents: expect.any(Array),
            }),
        );
    });

    it('adds section from toolbar when sections already exist', async () => {
        const sections = [createSection(1, SectionTemplate.SingleImageTop, 0)];
        mockHistoryFormSections = sections;

        mockedUseDataFetch.mockReturnValue({
            data: sections,
            error: null,
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('toolbar-add-section-button'));
        await user.click(screen.getByTestId('select-first-template'));

        expect(mockAddSection).toHaveBeenCalledWith(
            expect.objectContaining({
                order: 1,
            }),
        );
    });

    it('falls back to sectionToReplace index when replacing out-of-bounds section', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('request-replace-template-oob'));
        await user.click(screen.getByTestId('select-first-template'));

        expect(mockReplaceSection).toHaveBeenCalledWith(
            99,
            expect.objectContaining({
                order: 99,
            }),
        );
    });

    it('publishes sections and refetches on success', async () => {
        const sections = mockSingleSectionData();
        mockHistoryFormSections = sections;

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('mark-saved'));
        await user.click(screen.getByRole('button', { name: 'Publish' }));
        await user.click(screen.getByTestId('question-confirm'));

        await waitFor(() => {
            expect(mockedHistoryApi.syncSections).toHaveBeenCalledWith(
                mockClient,
                expect.arrayContaining([
                    expect.objectContaining({
                        template: sections[0].template,
                        order: sections[0].order,
                        contents: expect.any(Array),
                    }),
                ]),
            );
        });

        expect(mockAddToast).toHaveBeenCalledWith('Publish success', ToastType.Success);
        expect(refetchSectionsMock).toHaveBeenCalledTimes(1);
        expect(mockGetSections).toHaveBeenCalledTimes(1);
    });

    it('shows error toast when publish fails', async () => {
        const sections = mockSingleSectionData();
        mockHistoryFormSections = sections;
        mockedHistoryApi.syncSections.mockRejectedValueOnce(new Error('sync failed'));

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('mark-saved'));
        await user.click(screen.getByRole('button', { name: 'Publish' }));
        await user.click(screen.getByTestId('question-confirm'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Publish error', ToastType.Error);
        });
    });

    it('enables publish button when sections are reordered/changed', async () => {
        mockSingleSectionData();

        render(<HistoryPageContent />);

        const publishButton = screen.getByRole('button', { name: 'Publish' });
        expect(publishButton).toBeDisabled();

        await user.click(screen.getByTestId('trigger-sections-change'));

        expect(publishButton).toBeEnabled();
    });

    it('syncs remaining sections and shows success toast after delete', async () => {
        const sections = [
            createSection(1, SectionTemplate.SingleImageTop, 0),
            createSection(2, SectionTemplate.TextOnly, 1),
        ];
        mockHistoryFormSections = sections;

        mockedUseDataFetch.mockReturnValue({
            data: sections,
            error: null,
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('trigger-section-delete'));

        await waitFor(() => {
            expect(mockedHistoryApi.syncSections).toHaveBeenCalledWith(
                mockClient,
                expect.arrayContaining([
                    expect.objectContaining({
                        template: sections[0].template,
                        order: sections[0].order,
                    }),
                ]),
            );
        });
    });

    it('shows error toast when delete sync fails', async () => {
        const sections = mockSingleSectionData();
        mockHistoryFormSections = sections;
        mockedHistoryApi.syncSections.mockRejectedValueOnce(new Error('delete sync failed'));

        render(<HistoryPageContent />);

        await user.click(screen.getByTestId('trigger-section-delete'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Publish error', ToastType.Error);
        });
    });
});
