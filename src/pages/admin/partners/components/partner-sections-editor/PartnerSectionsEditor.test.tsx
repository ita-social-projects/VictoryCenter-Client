import React, { createRef } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PartnerSectionsEditor, PartnerSectionsEditorRef } from './PartnerSectionsEditor';
import { useDataFetch } from '../../../../../hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { ToastType } from '../../../../../types/admin/toast';

const mockPartnerSectionFormRender = jest.fn((props: any) => {
    const { value, errors, disabled, onChange, onDelete, onPublish } = props;
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
                onClick={() => onPublish(value.localId)}
                disabled={disabled}
            >
                Publish Section
            </button>
        </div>
    );
});

jest.mock('../partner-section/PartnerSectionForm', () => ({
    PartnerSectionForm: (props: any) => mockPartnerSectionFormRender(props),
}));

jest.mock('../../../../../components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size: number }) => <div data-testid={`inline-loader-${size}`} />,
}));

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('../../../../../components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <p>{title}</p>
                <button onClick={onConfirm} data-testid="confirm-delete">
                    Confirm
                </button>
                <button onClick={onCancel} data-testid="cancel-delete">
                    Cancel
                </button>
            </div>
        ) : null,
}));

jest.mock('../../../../../hooks/common/use-data-fetch/useDataFetch');
jest.mock('../../../../../services/api/admin/partners/partners-api');
jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient');
jest.mock('../../../../../contexts/admin/toast-context-provider/ToastContextProvider');

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
    });

    mockedPartnersApi.deleteSection.mockResolvedValue();
});

describe('PartnerSectionsEditor', () => {
    it('shows loader when sections are loading and none are rendered yet', () => {
        mockedUseDataFetch.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        expect(screen.getByTestId('inline-loader-2')).toBeInTheDocument();
        expect(mockPartnerSectionFormRender).not.toHaveBeenCalled();
    });

    it('renders error state and triggers refetch on retry', () => {
        const refetchMock = jest.fn();
        mockedUseDataFetch.mockReturnValue({
            data: [],
            isLoading: false,
            error: new Error('load error'),
            refetch: refetchMock,
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        expect(screen.getByText(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Спробувати ще' }));
        expect(refetchMock).toHaveBeenCalledTimes(1);
        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS, ToastType.Error);
    });

    it('renders partner sections returned from the API', async () => {
        let counter = 0;
        uuidMock.mockImplementation(() => `uuid-${++counter}`);

        mockedUseDataFetch.mockReturnValue({
            data: [
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
            ],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalledTimes(1);
        });

        const firstCallProps = mockPartnerSectionFormRender.mock.calls[0][0];
        expect(firstCallProps.value.sectionId).toBe(1);
        expect(firstCallProps.value.partners[0].partnerId).toBe(11);
        expect(firstCallProps.disabled).toBe(false);
    });

    it('updates local section state via onChange', async () => {
        let counter = 0;
        uuidMock.mockImplementation(() => `uuid-${++counter}`);

        mockedUseDataFetch.mockReturnValue({
            data: [
                {
                    id: 2,
                    title: 'Initial section',
                    description: 'Initial description',
                    partners: [],
                },
            ],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalled();
        });

        const initialCall = mockPartnerSectionFormRender.mock.calls[0][0];

        await act(async () => {
            initialCall.onChange(
                { ...initialCall.value, title: 'Changed title' },
                { ...initialCall.errors, title: 'title error' },
            );
        });

        await waitFor(() => {
            const lastCall =
                mockPartnerSectionFormRender.mock.calls[mockPartnerSectionFormRender.mock.calls.length - 1][0];
            expect(lastCall.value.title).toBe('Changed title');
            expect(lastCall.errors.title).toBe('title error');
        });
    });

    it('exposes addSection via ref and prevents duplicate empty sections', async () => {
        mockedUseDataFetch.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

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
        mockedUseDataFetch.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

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

        const latestProps =
            mockPartnerSectionFormRender.mock.calls[mockPartnerSectionFormRender.mock.calls.length - 1][0];

        await act(async () => {
            await latestProps.onPublish(populatedSection.localId);
        });

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

        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_CREATED, ToastType.Success);

        await waitFor(() => {
            const latestCall =
                mockPartnerSectionFormRender.mock.calls[mockPartnerSectionFormRender.mock.calls.length - 1][0];
            expect(latestCall.value.sectionId).toBe(101);
            expect(latestCall.value.partners[0].partnerId).toBe(201);
        });
    });

    it('publishes an existing section and handles success toast', async () => {
        mockedUseDataFetch.mockReturnValue({
            data: [
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
            ],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalled();
        });

        const props = mockPartnerSectionFormRender.mock.calls[0][0];

        await act(async () => {
            await props.onPublish(props.value.localId);
        });

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

        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_PUBLISHED, ToastType.Success);
    });

    it('shows error toast when publish fails', async () => {
        mockedPartnersApi.updateSection.mockRejectedValueOnce(new Error('publish failed'));

        mockedUseDataFetch.mockReturnValue({
            data: [
                {
                    id: 2,
                    title: 'Fail section',
                    description: 'Fail description',
                    partners: [],
                },
            ],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        const props = mockPartnerSectionFormRender.mock.calls[0][0];

        await act(async () => {
            await props.onPublish(props.value.localId);
        });

        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.FAIL_TO_PUBLISH_SECTION, ToastType.Error);

        const latestCall =
            mockPartnerSectionFormRender.mock.calls[mockPartnerSectionFormRender.mock.calls.length - 1][0];
        expect(latestCall.disabled).toBe(false);
    });

    it('deletes a persisted section after confirmation', async () => {
        mockedUseDataFetch.mockReturnValue({
            data: [
                {
                    id: 5,
                    title: 'Deletable',
                    description: 'To delete',
                    partners: [],
                },
            ],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(<PartnerSectionsEditor />);

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalled();
        });

        const latestProps =
            mockPartnerSectionFormRender.mock.calls[mockPartnerSectionFormRender.mock.calls.length - 1][0];

        await act(async () => {
            latestProps.onDelete(latestProps.value.localId);
        });

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('confirm-delete'));

        await waitFor(() => {
            expect(mockedPartnersApi.deleteSection).toHaveBeenCalledWith('mock-client', 5);
        });

        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_DELETED, ToastType.Success);
    });

    it('deletes an unsaved section without calling API', async () => {
        mockedUseDataFetch.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        const ref = createRef<PartnerSectionsEditorRef>();
        render(<PartnerSectionsEditor ref={ref} />);

        await act(async () => {
            ref.current?.addSection();
        });

        await waitFor(() => {
            expect(mockPartnerSectionFormRender).toHaveBeenCalled();
        });

        const latestProps =
            mockPartnerSectionFormRender.mock.calls[mockPartnerSectionFormRender.mock.calls.length - 1][0];

        await act(async () => {
            latestProps.onDelete(latestProps.value.localId);
        });
        fireEvent.click(screen.getByTestId('confirm-delete'));

        expect(mockedPartnersApi.deleteSection).not.toHaveBeenCalled();
        expect(addToastMock).toHaveBeenCalledWith(PARTNERS_TEXT.MESSAGE.SECTION_DELETED, ToastType.Success);
    });
});
