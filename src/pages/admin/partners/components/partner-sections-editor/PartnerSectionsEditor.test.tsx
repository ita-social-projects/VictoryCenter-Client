import React, { createRef } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerSectionsEditor, PartnerSectionsEditorRef } from './PartnerSectionsEditor';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { PartnersApi } from '@/services/api/admin/partners/partners-api';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { ToastType } from '@/types/admin/toast';

const mockPartnerSectionFormRender = jest.fn((props: any) => {
    const { value, errors, disabled, onChange, onDelete, onPublish, onTranslate } = props;
    return (
        <div data-testid={`partner-section-${value.localId}`} data-disabled={disabled}>
            <span>{value.title}</span>
            <button
                type="button"
                data-testid={`section-change-${value.localId}`}
                onClick={() => onChange({ ...value, title: 'Updated title' }, errors)}
                disabled={disabled}
            >
                Change Section
            </button>
            <button
                type="button"
                data-testid={`section-delete-${value.localId}`}
                onClick={() => onDelete(value.localId)}
                disabled={disabled}
            >
                Delete Section
            </button>
            <button
                type="button"
                data-testid={`section-publish-${value.localId}`}
                onClick={() => onPublish(value.localId, value)}
                disabled={disabled}
            >
                Publish Section
            </button>
            <button
                type="button"
                data-testid={`section-translate-${value.localId}`}
                onClick={() => onTranslate(value.sectionId)}
                disabled={disabled}
            >
                Translate Section
            </button>
        </div>
    );
});

jest.mock('../partner-section/PartnerSectionForm', () => ({
    PartnerSectionForm: (props: any) => mockPartnerSectionFormRender(props),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid={`inline-loader-${size}`} />,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal" data-title={title}>
                <p>{title}</p>
                <button onClick={onConfirm} data-testid={`confirm-${title}`}>
                    Confirm
                </button>
                <button onClick={onCancel} data-testid={`cancel-${title}`}>
                    Cancel
                </button>
            </div>
        ) : null,
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch');
jest.mock('@/services/api/admin/partners/partners-api');
jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');

const mockTranslationLanguages = [{ id: 2, code: 'en', name: 'English' }];

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => ({
        allLanguages: mockTranslationLanguages,
        translationLanguages: mockTranslationLanguages,
        selectedLanguage: mockTranslationLanguages[0],
        onLanguageChange: jest.fn(),
        translationStatusFilter: undefined,
        onTranslationStatusFilterChange: jest.fn(),
        retryFetchLanguages: jest.fn(),
    }),
}));

jest.mock('../translate-partner-section-modal/TranslatePartnerSectionModal', () => ({
    TranslatePartnerSectionModal: ({ isOpen, onClose, section, onTranslated }: any) =>
        isOpen ? (
            <div data-testid="translate-partner-section-modal">
                <span data-testid="translate-section-id">{section?.id ?? 'none'}</span>
                <button onClick={onTranslated}>mock-translated-success</button>
                <button onClick={onClose}>mock-translate-close</button>
            </div>
        ) : null,
}));

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedPartnersApi = PartnersApi as jest.Mocked<typeof PartnersApi>;
const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const addToastMock = jest.fn();
const uuidMock = jest.fn();

beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
        value: {
            randomUUID: () => uuidMock(),
        },
        configurable: true,
    });
});

beforeEach(() => {
    jest.clearAllMocks();
    mockPartnerSectionFormRender.mockClear();

    let counter = 0;
    uuidMock.mockImplementation(() => `uuid-${++counter}`);

    mockedUseAdminClient.mockReturnValue('mock-client');
    mockedUseToast.mockReturnValue({ addToast: addToastMock });

    mockedPartnersApi.postSection.mockResolvedValue({
        id: 101,
        title: 'Saved section',
        description: 'Saved description',
        partners: [
            {
                id: 201,
                description: 'Saved partner',
                image: { id: 301, url: 'saved.jpg', mimeType: 'image/jpeg' },
                imageId: 301,
            },
        ],
        localizations: [],
    });

    mockedPartnersApi.updateSection.mockResolvedValue({
        id: 1,
        title: 'Updated server section',
        description: 'Updated server description',
        partners: [
            {
                id: 10,
                description: 'Server partner',
                image: { id: 20, url: 'server.jpg', mimeType: 'image/png' },
                imageId: 20,
            },
        ],
        localizations: [],
    });

    mockedPartnersApi.deleteSection.mockResolvedValue();
});

function mockSections(sections: any[], overrides: { isLoading?: boolean; error?: any; refetch?: jest.Mock } = {}) {
    mockedUseDataFetch.mockReturnValue({
        data: sections,
        isLoading: overrides.isLoading ?? false,
        error: overrides.error ?? null,
        refetch: overrides.refetch ?? jest.fn(),
        setData: jest.fn(),
    });
}

async function renderEditor(ui: React.ReactElement = <PartnerSectionsEditor />) {
    render(ui);
    await waitFor(() => expect(mockPartnerSectionFormRender).toHaveBeenCalled());
}

function getLatestFormProps() {
    const calls = mockPartnerSectionFormRender.mock.calls;
    return calls[calls.length - 1][0];
}

function openPublishModal(props: any) {
    act(() => {
        props.onPublish(props.value.localId, props.value);
    });
    expect(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.TITLE.PUBLISH_SECTION}`)).toBeInTheDocument();
}

function confirmPublish() {
    fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.TITLE.PUBLISH_SECTION}`));
}

function openDeleteModal(props: any) {
    act(() => {
        props.onDelete(props.value.localId);
    });
    expect(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}`)).toBeInTheDocument();
}

describe('PartnerSectionsEditor', () => {
    it('shows loader when sections are loading and none are rendered yet', () => {
        mockSections([], { isLoading: true });

        render(<PartnerSectionsEditor />);

        expect(screen.getByTestId('inline-loader-2')).toBeInTheDocument();
        expect(mockPartnerSectionFormRender).not.toHaveBeenCalled();
    });

    it('renders error state and triggers refetch on retry', () => {
        const refetchMock = jest.fn();
        mockSections([], { error: new Error('load error'), refetch: refetchMock });

        render(<PartnerSectionsEditor />);

        expect(screen.getByText(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Спробувати ще' }));
        expect(refetchMock).toHaveBeenCalledTimes(1);
        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS, ToastType.Error);
    });

    it('renders partner sections returned from the API', async () => {
        mockSections([
            {
                id: 1,
                title: 'API section',
                description: 'API description',
                partners: [
                    {
                        id: 11,
                        description: 'API partner',
                        image: { id: 21, url: 'api.jpg', mimeType: 'image/png' },
                        imageId: 21,
                    },
                ],
            },
        ]);

        await renderEditor();

        const firstCallProps = mockPartnerSectionFormRender.mock.calls[0][0];
        expect(firstCallProps.value.sectionId).toBe(1);
        expect(firstCallProps.value.partners[0].partnerId).toBe(11);
        expect(firstCallProps.disabled).toBe(false);
    });

    it('updates local section state via onChange', async () => {
        mockSections([
            {
                id: 2,
                title: 'Initial section',
                description: 'Initial description',
                partners: [],
            },
        ]);

        await renderEditor();

        const initialCall = mockPartnerSectionFormRender.mock.calls[0][0];

        await act(async () => {
            initialCall.onChange(
                { ...initialCall.value, title: 'Changed title' },
                { ...initialCall.errors, title: 'title error' },
            );
        });

        await waitFor(() => {
            const lastCall = getLatestFormProps();
            expect(lastCall.value.title).toBe('Changed title');
            expect(lastCall.errors.title).toBe('title error');
        });
    });

    it('exposes addSection via ref and prevents duplicate empty sections', async () => {
        mockSections([]);

        const ref = createRef<PartnerSectionsEditorRef>();
        render(<PartnerSectionsEditor ref={ref} />);

        await act(async () => {
            ref.current?.addSection();
        });

        expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1);

        await act(async () => {
            ref.current?.addSection();
        });

        expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1);
    });

    it('publishes a newly created section and refreshes state', async () => {
        mockSections([]);

        const ref = createRef<PartnerSectionsEditorRef>();
        render(<PartnerSectionsEditor ref={ref} />);

        await act(async () => {
            ref.current?.addSection();
        });

        const initialProps = mockPartnerSectionFormRender.mock.calls[0][0];

        const populatedSection = {
            ...initialProps.value,
            title: 'New title',
            description: 'New description',
            partners: [
                {
                    localId: 'temp-partner',
                    partnerId: null,
                    description: 'Partner desc',
                    image: { base64: 'base64', mimeType: 'image/png' },
                    imageId: null,
                },
            ],
        };

        await act(async () => {
            initialProps.onChange(populatedSection, initialProps.errors);
        });

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(2);
        });

        await openPublishModal(getLatestFormProps());
        await confirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.postSection).toHaveBeenCalledWith('mock-client', {
                title: 'New title',
                description: 'New description',
                partners: [
                    {
                        description: 'Partner desc',
                        image: { base64: 'base64', mimeType: 'image/png' },
                        imageId: null,
                    },
                ],
            });
        });

        await waitFor(() => {
            expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_CREATED, ToastType.Success);
        });

        await waitFor(() => {
            const latestCall = getLatestFormProps();
            expect(latestCall.value.sectionId).toBe(101);
            expect(latestCall.value.partners[0].partnerId).toBe(201);
        });
    });

    it('publishes an existing section and handles success toast', async () => {
        mockSections([
            {
                id: 1,
                title: 'Existing title',
                description: 'Existing description',
                partners: [
                    {
                        id: 10,
                        description: 'Existing partner',
                        image: { id: 20, url: 'existing.jpg', mimeType: 'image/png' },
                        imageId: 20,
                    },
                ],
            },
        ]);

        await renderEditor();

        const props = mockPartnerSectionFormRender.mock.calls[0][0];

        await openPublishModal(props);
        await confirmPublish();

        await waitFor(() => {
            expect(mockedPartnersApi.updateSection).toHaveBeenCalledWith('mock-client', props.value.sectionId, {
                title: props.value.title,
                description: props.value.description,
                partnersToUpdate: props.value.partners.map((partner: any) => ({
                    id: partner.partnerId,
                    description: partner.description,
                    image: partner.image,
                    imageId: partner.imageId,
                })),
                partnerIdsToDelete: props.value.deletedPartnerIds || [],
            });
        });

        await waitFor(() => {
            expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_PUBLISHED, ToastType.Success);
        });
    });

    it('handles publish errors: shows toast on failure, no toast on cancellation', async () => {
        const setupAndPublish = async (rejectValue: Error | { name: string }) => {
            mockedPartnersApi.updateSection.mockRejectedValueOnce(rejectValue);
            mockSections([
                {
                    id: 2,
                    title: 'Test section',
                    description: 'Test description',
                    partners: [],
                },
            ]);

            await renderEditor();
            const props = mockPartnerSectionFormRender.mock.calls[0][0];

            await openPublishModal(props);
            await confirmPublish();
        };

        // Test error toast on regular failure
        await setupAndPublish(new Error('publish failed'));
        await waitFor(() => {
            expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_PUBLISH_SECTION, ToastType.Error);
        });
        expect(getLatestFormProps().disabled).toBe(false);

        // Clear mocks for next run
        jest.clearAllMocks();
        mockPartnerSectionFormRender.mockClear();

        // Test no toast on cancellation (AbortError)
        await setupAndPublish({ name: 'AbortError' } as any);
        expect(addToastMock).not.toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_PUBLISH_SECTION, ToastType.Error);
    });

    it('closes the publish modal without calling API when cancel is clicked', async () => {
        mockSections([
            {
                id: 3,
                title: 'Cancelable publish',
                description: 'Desc',
                partners: [],
            },
        ]);

        await renderEditor();
        const props = mockPartnerSectionFormRender.mock.calls[0][0];

        await openPublishModal(props);

        fireEvent.click(screen.getByTestId(`cancel-${PARTNERS_TEXT.FORM.TITLE.PUBLISH_SECTION}`));

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(mockedPartnersApi.postSection).not.toHaveBeenCalled();
        expect(mockedPartnersApi.updateSection).not.toHaveBeenCalled();
    });

    it('deletes a persisted section after confirmation', async () => {
        mockSections([
            {
                id: 5,
                title: 'Deletable',
                description: 'To delete',
                partners: [],
            },
        ]);

        await renderEditor();

        await openDeleteModal(getLatestFormProps());

        fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}`));

        await waitFor(() => {
            expect(
                screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}`),
            ).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}`));

        await waitFor(() => {
            expect(mockedPartnersApi.deleteSection).toHaveBeenCalledWith('mock-client', 5);
        });

        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_DELETED, ToastType.Success);
    });

    it('deletes an unsaved section without calling API', async () => {
        mockSections([]);

        const ref = createRef<PartnerSectionsEditorRef>();
        render(<PartnerSectionsEditor ref={ref} />);

        await act(async () => {
            ref.current?.addSection();
        });

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalled();
        });

        await openDeleteModal(getLatestFormProps());
        fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}`));

        await waitFor(() => {
            expect(
                screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}`),
            ).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}`));

        expect(mockedPartnersApi.deleteSection).not.toHaveBeenCalled();
        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_DELETED, ToastType.Success);
    });

    it('does not toast when fetch error is a cancellation', () => {
        mockSections([], { error: { name: 'AbortError' } });

        render(<PartnerSectionsEditor />);

        expect(addToastMock).not.toHaveBeenCalled();
    });

    it('prevents adding a new section when last section has no partners', async () => {
        mockSections([
            {
                id: 1,
                title: '',
                description: '',
                partners: [],
            },
        ]);

        const ref = createRef<PartnerSectionsEditorRef>();
        render(<PartnerSectionsEditor ref={ref} />);

        await waitFor(() => expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1));

        await act(async () => {
            ref.current?.addSection();
        });

        expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1);
    });

    it('closes the delete modal when cancel is clicked', async () => {
        mockSections([
            {
                id: 6,
                title: 'Cancelable',
                description: 'Desc',
                partners: [],
            },
        ]);

        await renderEditor();
        const props = mockPartnerSectionFormRender.mock.calls[0][0];

        await openDeleteModal(props);

        fireEvent.click(screen.getByTestId(`cancel-${PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}`));

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(mockedPartnersApi.deleteSection).not.toHaveBeenCalled();
    });

    it('shows error toast when deleting section fails', async () => {
        mockedPartnersApi.deleteSection.mockRejectedValueOnce(new Error('delete fail'));

        mockSections([
            {
                id: 7,
                title: 'Delete me',
                description: 'Desc',
                partners: [],
            },
        ]);

        render(<PartnerSectionsEditor />);

        const props = mockPartnerSectionFormRender.mock.calls[0][0];

        await openDeleteModal(props);
        fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}`));

        await waitFor(() => {
            expect(
                screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}`),
            ).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId(`confirm-${PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}`));

        await waitFor(() => {
            expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_DELETE_SECTION, ToastType.Error);
        });
    });

    it('opens the translate modal for the clicked section and closes it', async () => {
        const refetchMock = jest.fn();
        mockSections(
            [
                {
                    id: 4,
                    title: 'Translatable section',
                    description: 'Desc',
                    partners: [],
                },
            ],
            { refetch: refetchMock },
        );

        await renderEditor();

        expect(screen.queryByTestId('translate-partner-section-modal')).not.toBeInTheDocument();

        const props = getLatestFormProps();
        act(() => {
            props.onTranslate(props.value.sectionId);
        });

        expect(screen.getByTestId('translate-partner-section-modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-section-id')).toHaveTextContent('4');

        fireEvent.click(screen.getByText('mock-translate-close'));

        expect(screen.queryByTestId('translate-partner-section-modal')).not.toBeInTheDocument();
    });

    it('refetches sections when a translation is saved', async () => {
        const refetchMock = jest.fn();
        mockSections(
            [
                {
                    id: 4,
                    title: 'Translatable section',
                    description: 'Desc',
                    partners: [],
                },
            ],
            { refetch: refetchMock },
        );

        await renderEditor();

        const props = getLatestFormProps();
        act(() => {
            props.onTranslate(props.value.sectionId);
        });

        fireEvent.click(screen.getByText('mock-translated-success'));

        expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not add section while sections are loading', async () => {
        mockSections(
            [
                {
                    id: 8,
                    title: 'Loading title',
                    description: 'Desc',
                    partners: [],
                },
            ],
            { isLoading: true },
        );

        const ref = createRef<PartnerSectionsEditorRef>();
        render(<PartnerSectionsEditor ref={ref} />);

        await waitFor(() => expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1));

        await act(async () => {
            ref.current?.addSection();
        });

        expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1);
    });
});
