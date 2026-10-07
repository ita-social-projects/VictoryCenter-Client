import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventModal } from './EventModal';
import { executeCancelCofirmationFlow, executeConfirmCloseFlow } from '@/utils/test-mocks/events-modals-mocks';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { EventItemDto } from '@/types/admin/events';
import { ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { EVENTS_TEXT, EVENT_VALIDATION as mockEventValidation } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_UKRAINIAN_LANGUAGE_ID } from '@/const/common/locales';
import { EventsApi } from '@/services/api/admin/events/events-api';

const mockAddToast = jest.fn();
const mockClient = {};

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => mockClient,
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({ addToast: mockAddToast }),
}));

jest.mock('@/services/api/admin/events/events-api', () => ({
    EventsApi: {
        getEventById: jest.fn(),
        createEvent: jest.fn(),
        updateEvent: jest.fn(),
    },
}));

const mockedEventsApi = EventsApi as jest.Mocked<typeof EventsApi>;

const getTodayLabel = () => {
    const today = new Date();

    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(
        2,
        '0',
    )}/${today.getFullYear()}`;
};

const openDatePickerAndSelectToday = (todayLabel: string) => {
    fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
    fireEvent.click(screen.getByRole('button', { name: todayLabel }));
};

const expectDatePickerClosed = () => {
    expect(screen.queryByRole('dialog', { name: 'Вибір дати' })).not.toBeInTheDocument();
};

const fillTextField = (label: string, value: string) => {
    fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value } });
};

jest.mock('@/components/common/modal/Modal', () => ({
    Modal: require('@/utils/test-mocks/events-modals-mocks').MockModal,
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, error, name, id, label, onBlur }: any) => (
        <div>
            <label htmlFor={id}>{label}</label>
            <input name={name} id={id} value={value} onChange={onChange} onBlur={onBlur} />
            {error && <span data-testid="input-error">{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: require('@/utils/test-mocks/events-modals-mocks').MockButton,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: require('@/utils/test-mocks/events-modals-mocks').MockConfirmationModal,
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ value, onChange, error, name, id, label, onBlur }: any) => (
            <div>
                <label htmlFor={id}>{label}</label>
                <textarea name={name} id={id} value={value} onChange={onChange} onBlur={onBlur} />
                {error && <span data-testid="description-error">{error}</span>}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/image-input/ImageInput', () => {
    const getImageSrc = (image: any) => {
        if (!image) return '';
        if (typeof image === 'string') return image;
        if ('url' in image && image.url) return image.url;
        if ('base64' in image) return `data:${image.mimeType};base64,${image.base64}`;
        return '';
    };

    return {
        ImageInput: ({ value, onChange, setError }: Pick<ImageInputProps, 'value' | 'onChange' | 'setError'>) => (
            <div data-testid="image-input">
                {value && <img data-testid="event-image-preview" src={getImageSrc(value)} alt="preview" />}
                <button
                    type="button"
                    data-testid="upload-valid-image"
                    onClick={() => {
                        setError('');
                        onChange({ base64: 'test-base64-data', mimeType: 'image/png' });
                    }}
                >
                    Upload Image
                </button>
                <button
                    type="button"
                    data-testid="trigger-image-error"
                    onClick={() =>
                        setError(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB))
                    }
                >
                    Trigger Error
                </button>
            </div>
        ),
        getImageSrc,
    };
});

const currentCategory: EventCategoryDto | null = {
    id: 1,
    name: 'Category 1',
    relatedEventNewsCount: 0,
};

const defaultProps = {
    mode: ModalMode.Add as const,
    isOpen: true,
    onClose: jest.fn(),
    currentCategory,
};

const eventToEdit: EventItemDto = {
    id: 1,
    priority: 1,
    resource: 'https://example.com',
    resourceEn: 'https://example.com/en/news',
    publishedAt: '2026-08-18T00:00:00Z',
    title: 'Завершилась програма',
    description: 'Цього тижня ми успішно завершили програму реабілітації',
    additionalDescription: 'Київ, 18:00',
    status: VisibilityStatus.Draft,
    previewImage: null,
    backgroundImage: null,
};

const eventWithImage: EventItemDto = {
    ...eventToEdit,
    previewImage: { id: 7, url: 'https://example.com/event.png', mimeType: 'image/png' },
};

describe('EventModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('elements rendering', () => {
        it('renders modal title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toHaveTextContent(EVENTS_TEXT.FORM.MODAL_TITLE);
        });

        it('prefills the form with the event data in edit mode', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            expect(screen.getByDisplayValue(eventToEdit.title)).toBeInTheDocument();
            expect(screen.getByDisplayValue(eventToEdit.description)).toBeInTheDocument();
            expect(screen.getByDisplayValue(eventToEdit.resource)).toBeInTheDocument();
            expect(screen.getByText('18/08/2026')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Київ, 18:00')).toBeInTheDocument();
            expect(screen.getByDisplayValue('https://example.com/en/news')).toBeInTheDocument();
        });

        it('shows the edit title in edit mode', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            expect(screen.getByTestId('modal-title')).toHaveTextContent(EVENTS_TEXT.FORM.EDIT_MODAL_TITLE);
        });

        it('renders link section title', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(EVENTS_TEXT.FORM.LINKS_SECTION_TITLE)).toBeInTheDocument();
        });

        it('renders all input fields', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.DESCRIPTION })).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION }),
            ).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_UKR })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_ENG })).toBeInTheDocument();
        });

        it('renders date picker trigger', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByRole('button', { name: /Вибір дати/i })).toBeInTheDocument();
        });

        it('renders category chip when currentCategory is provided', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(currentCategory.name)).toBeInTheDocument();
        });

        it('does not render category chip when currentCategory is null', () => {
            render(<EventModal {...defaultProps} currentCategory={null} />);

            expect(screen.queryByText(currentCategory.name)).not.toBeInTheDocument();
        });

        it('renders modal buttons in disable state initially', () => {
            render(<EventModal {...defaultProps} />);

            const saveAsDraftButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT });
            const saveAsPublishedButton = screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
            });

            expect(saveAsDraftButton).toBeInTheDocument();
            expect(saveAsPublishedButton).toBeInTheDocument();

            expect(saveAsDraftButton).toBeDisabled();
            expect(saveAsPublishedButton).toBeDisabled();
        });

        it('sets validation error on blur', async () => {
            render(<EventModal {...defaultProps} />);

            const input = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });

            fireEvent.change(input, {
                target: { value: '' },
            });

            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByTestId('input-error')).toHaveTextContent(
                    mockEventValidation.title.getRequiredError(),
                );
            });
        });

        it('enables saving as draft immediately after entering a valid title', () => {
            render(<EventModal {...defaultProps} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('disables both actions immediately when a valid title becomes invalid', () => {
            render(<EventModal {...defaultProps} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'short');

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeDisabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('keeps publishing disabled when required publishing fields are missing', () => {
            render(<EventModal {...defaultProps} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fillTextField(EVENTS_TEXT.FORM.LABEL.DESCRIPTION, 'Valid event description');
            fillTextField(EVENTS_TEXT.FORM.LABEL.LINK_UKR, 'valid link');

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('enables publishing when every required field is valid', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fillTextField(EVENTS_TEXT.FORM.LABEL.DESCRIPTION, 'Valid event description');
            fillTextField(EVENTS_TEXT.FORM.LABEL.LINK_UKR, 'valid link');
            openDatePickerAndSelectToday(todayLabel);
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));
            fireEvent.click(screen.getByTestId('upload-valid-image'));

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
        });

        it('keeps saving as draft enabled when optional fields are invalid', () => {
            render(<EventModal {...defaultProps} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fillTextField(EVENTS_TEXT.FORM.LABEL.DESCRIPTION, 'bad');
            fillTextField(EVENTS_TEXT.FORM.LABEL.LINK_ENG, 'bad');

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('keeps saving as draft enabled when image validation fails', () => {
            render(<EventModal {...defaultProps} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fireEvent.click(screen.getByTestId('trigger-image-error'));

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });
    });

    describe('close behavior', () => {
        it('calls onClose immediately when form is not dirty', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('shows confirmation modal when form has unsaved changes', () => {
            render(<EventModal {...defaultProps} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        it('does not close the modal when confirmation is cancelled', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            executeCancelCofirmationFlow(onClose);
        });

        it('closes the modal when unsaved changes are confirmed', () => {
            const onClose = jest.fn();

            render(<EventModal {...defaultProps} onClose={onClose} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            executeConfirmCloseFlow(onClose);
        });
    });

    describe('save and publish confirmations', () => {
        it.each([
            [
                ModalMode.Add,
                VisibilityStatus.Draft,
                COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT,
                EVENTS_TEXT.QUESTION.SAVE_NEW_MATERIAL,
            ],
            [
                ModalMode.Add,
                VisibilityStatus.Published,
                COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
                EVENTS_TEXT.QUESTION.PUBLISH_NEW_MATERIAL,
            ],
            [
                ModalMode.Edit,
                VisibilityStatus.Draft,
                COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT,
                COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES,
            ],
            [
                ModalMode.Edit,
                VisibilityStatus.Draft,
                COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
                EVENTS_TEXT.QUESTION.PUBLISH_MATERIAL,
            ],
            [
                ModalMode.Edit,
                VisibilityStatus.Published,
                COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
                COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES,
            ],
            [
                ModalMode.Edit,
                VisibilityStatus.Published,
                COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT,
                COMMON_TEXT_ADMIN.QUESTION.REMOVE_FROM_PUBLICATION,
            ],
        ])('shows %s confirmation and leaves data intact after No', (mode, status, buttonText, confirmationText) => {
            const editedEvent = { ...eventToEdit, status };
            render(
                mode === ModalMode.Edit ? (
                    <EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={editedEvent} />
                ) : (
                    <EventModal {...defaultProps} mode={ModalMode.Add} />
                ),
            );

            if (mode === ModalMode.Add) {
                fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            } else {
                fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Changed event title');
            }

            if (buttonText === COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED) {
                if (mode === ModalMode.Add) {
                    fillTextField(EVENTS_TEXT.FORM.LABEL.DESCRIPTION, 'Valid event description');
                    fillTextField(EVENTS_TEXT.FORM.LABEL.LINK_UKR, 'valid link');
                    openDatePickerAndSelectToday(getTodayLabel());
                    fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));
                }
                fireEvent.click(screen.getByTestId('upload-valid-image'));
            }

            fireEvent.click(screen.getByRole('button', { name: buttonText as string }));

            expect(screen.getByTestId('confirmation-modal')).toHaveTextContent(confirmationText as string);
            fireEvent.click(screen.getByTestId('confirmation-cancel'));

            expect(mockedEventsApi.createEvent).not.toHaveBeenCalled();
            expect(mockedEventsApi.updateEvent).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toHaveValue(
                mode === ModalMode.Add ? 'Valid event title' : 'Changed event title',
            );
        });

        it('does not call the API or change data when the confirmation popup is closed', () => {
            render(<EventModal {...defaultProps} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT }));
            fireEvent.click(screen.getByTestId('confirmation-close'));

            expect(mockedEventsApi.createEvent).not.toHaveBeenCalled();
            expect(mockedEventsApi.updateEvent).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toHaveValue(
                'Valid event title',
            );
        });

        it('creates a draft only after confirmation with the active category', async () => {
            const onClose = jest.fn();
            const onSaveSuccess = jest.fn();
            mockedEventsApi.createEvent.mockResolvedValueOnce({ ...eventToEdit, status: VisibilityStatus.Draft });
            render(<EventModal {...defaultProps} onClose={onClose} onSaveSuccess={onSaveSuccess} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT }));
            expect(mockedEventsApi.createEvent).not.toHaveBeenCalled();
            fireEvent.click(screen.getByTestId('confirmation-confirm'));

            await waitFor(() => expect(mockedEventsApi.createEvent).toHaveBeenCalledTimes(1));
            expect(mockedEventsApi.createEvent).toHaveBeenCalledWith(
                mockClient,
                expect.objectContaining({
                    existingPreviewImageId: null,
                    request: expect.objectContaining({
                        status: VisibilityStatus.Draft,
                        categoryIds: [currentCategory.id],
                    }),
                }),
            );
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(onSaveSuccess).toHaveBeenCalledWith({
                event: { ...eventToEdit, status: VisibilityStatus.Draft },
                categoryId: currentCategory.id,
                isFirstPublication: false,
                shouldMoveDraftToTop: true,
            });
        });

        it('preserves fetched category ids on edit', async () => {
            const fullEvent = {
                ...eventToEdit,
                categories: [{ id: 7 }, { id: 8 }],
                localizations: [
                    {
                        language: { id: DEFAULT_UKRAINIAN_LANGUAGE_ID },
                        title: eventToEdit.title,
                        description: eventToEdit.description,
                        additionalDescription: eventToEdit.additionalDescription,
                    },
                    {
                        language: { id: 2 },
                        title: 'English title',
                        description: 'English description',
                        additionalDescription: 'English additional description',
                    },
                ],
            };
            mockedEventsApi.getEventById.mockResolvedValueOnce(fullEvent);
            mockedEventsApi.updateEvent.mockResolvedValueOnce({ ...eventToEdit, status: VisibilityStatus.Published });
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Changed event title');
            fireEvent.click(screen.getByTestId('upload-valid-image'));
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
            fireEvent.click(screen.getByTestId('confirmation-confirm'));

            await waitFor(() => expect(mockedEventsApi.updateEvent).toHaveBeenCalledTimes(1));
            expect(mockedEventsApi.updateEvent).toHaveBeenCalledWith(
                mockClient,
                eventToEdit.id,
                expect.objectContaining({
                    request: expect.objectContaining({
                        categoryIds: [7, 8],
                        localizations: [
                            expect.objectContaining({
                                languageId: DEFAULT_UKRAINIAN_LANGUAGE_ID,
                                title: 'Changed event title',
                            }),
                            {
                                languageId: 2,
                                title: 'English title',
                                description: 'English description',
                                additionalDescription: 'English additional description',
                            },
                        ],
                    }),
                }),
            );
        });

        it.each([
            {
                mode: ModalMode.Add,
                targetStatus: VisibilityStatus.Draft,
                isFirstPublication: false,
                shouldMoveDraftToTop: true,
            },
            {
                mode: ModalMode.Add,
                targetStatus: VisibilityStatus.Published,
                isFirstPublication: true,
                shouldMoveDraftToTop: false,
            },
            {
                mode: ModalMode.Edit,
                initialStatus: VisibilityStatus.Draft,
                targetStatus: VisibilityStatus.Draft,
                isFirstPublication: false,
                shouldMoveDraftToTop: true,
            },
            {
                mode: ModalMode.Edit,
                initialStatus: VisibilityStatus.Draft,
                targetStatus: VisibilityStatus.Published,
                isFirstPublication: true,
                shouldMoveDraftToTop: false,
            },
            {
                mode: ModalMode.Edit,
                initialStatus: VisibilityStatus.Published,
                targetStatus: VisibilityStatus.Published,
                isFirstPublication: false,
                shouldMoveDraftToTop: false,
            },
            {
                mode: ModalMode.Edit,
                initialStatus: VisibilityStatus.Published,
                targetStatus: VisibilityStatus.Draft,
                isFirstPublication: false,
                shouldMoveDraftToTop: true,
            },
        ])(
            'submits the expected $mode/$targetStatus request and success flags only after confirmation',
            async (scenario) => {
                const onClose = jest.fn();
                const onSaveSuccess = jest.fn();
                const isPublish = scenario.targetStatus === VisibilityStatus.Published;
                const buttonText = isPublish
                    ? COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED
                    : COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT;

                if (scenario.mode === ModalMode.Edit) {
                    const fullEvent = {
                        ...eventToEdit,
                        status: scenario.initialStatus!,
                        categories: [{ id: 7 }, { id: 8 }],
                        localizations: [
                            {
                                language: { id: DEFAULT_UKRAINIAN_LANGUAGE_ID },
                                title: eventToEdit.title,
                                description: eventToEdit.description,
                                additionalDescription: eventToEdit.additionalDescription,
                            },
                        ],
                    };
                    mockedEventsApi.getEventById.mockResolvedValueOnce(fullEvent);
                    mockedEventsApi.updateEvent.mockResolvedValueOnce({
                        ...eventToEdit,
                        status: scenario.targetStatus,
                    });
                    render(
                        <EventModal
                            {...defaultProps}
                            mode={ModalMode.Edit}
                            eventToEdit={{ ...eventToEdit, status: scenario.initialStatus! }}
                            onClose={onClose}
                            onSaveSuccess={onSaveSuccess}
                        />,
                    );
                    fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Changed event title');
                } else {
                    mockedEventsApi.createEvent.mockResolvedValueOnce({
                        ...eventToEdit,
                        status: scenario.targetStatus,
                    });
                    render(<EventModal {...defaultProps} onClose={onClose} onSaveSuccess={onSaveSuccess} />);
                    fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
                }

                if (isPublish) {
                    if (scenario.mode === ModalMode.Add) {
                        fillTextField(EVENTS_TEXT.FORM.LABEL.DESCRIPTION, 'Valid event description');
                        fillTextField(EVENTS_TEXT.FORM.LABEL.LINK_UKR, 'valid link');
                        openDatePickerAndSelectToday(getTodayLabel());
                        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));
                    }
                    fireEvent.click(screen.getByTestId('upload-valid-image'));
                }

                fireEvent.click(screen.getByRole('button', { name: buttonText }));
                fireEvent.click(screen.getByTestId('confirmation-confirm'));

                expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();

                await waitFor(() => {
                    expect(
                        mockedEventsApi.updateEvent.mock.calls.length + mockedEventsApi.createEvent.mock.calls.length,
                    ).toBe(1);
                });

                expect(mockedEventsApi.updateEvent).toHaveBeenCalledTimes(scenario.mode === ModalMode.Edit ? 1 : 0);
                expect(mockedEventsApi.createEvent).toHaveBeenCalledTimes(scenario.mode === ModalMode.Add ? 1 : 0);

                const request =
                    scenario.mode === ModalMode.Edit
                        ? mockedEventsApi.updateEvent.mock.calls[0][2].request
                        : mockedEventsApi.createEvent.mock.calls[0][1].request;

                expect(request).toEqual(
                    expect.objectContaining({
                        status: scenario.targetStatus,
                        categoryIds: scenario.mode === ModalMode.Edit ? [7, 8] : [currentCategory.id],
                    }),
                );

                expect(onSaveSuccess).toHaveBeenCalledWith({
                    event: { ...eventToEdit, status: scenario.targetStatus },
                    categoryId: currentCategory.id,
                    isFirstPublication: scenario.isFirstPublication,
                    shouldMoveDraftToTop: scenario.shouldMoveDraftToTop,
                });
                expect(onClose).toHaveBeenCalledTimes(1);
            },
        );

        it('keeps the form open and allows retry when the event request fails', async () => {
            const onClose = jest.fn();
            mockedEventsApi.createEvent
                .mockRejectedValueOnce(new Error('Request failed'))
                .mockResolvedValueOnce({ ...eventToEdit, status: VisibilityStatus.Draft });
            render(<EventModal {...defaultProps} onClose={onClose} />);

            fillTextField(EVENTS_TEXT.FORM.LABEL.TITLE, 'Valid event title');
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT }));
            fireEvent.click(screen.getByTestId('confirmation-confirm'));

            await waitFor(() => expect(mockAddToast).toHaveBeenCalledTimes(1));
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toHaveValue(
                'Valid event title',
            );

            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT }));
            fireEvent.click(screen.getByTestId('confirmation-confirm'));

            await waitFor(() => expect(mockedEventsApi.createEvent).toHaveBeenCalledTimes(2));
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('modal opening', () => {
        it('resets form when modal is opened', () => {
            const { rerender } = render(<EventModal {...defaultProps} />);

            const titleInput = screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE });
            fireEvent.change(titleInput, {
                target: { value: 'New Event' },
            });

            expect(titleInput).toHaveValue('New Event');

            rerender(<EventModal {...defaultProps} isOpen={false} />);

            rerender(<EventModal {...defaultProps} />);

            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.TITLE })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.DESCRIPTION })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.ADDITIONAL_DESCRIPTION })).toHaveValue(
                '',
            );
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_UKR })).toHaveValue('');
            expect(screen.getByRole('textbox', { name: EVENTS_TEXT.FORM.LABEL.LINK_ENG })).toHaveValue('');
        });
    });

    describe('date picker', () => {
        it('applies the selected date only after confirming', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            openDatePickerAndSelectToday(todayLabel);
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));

            expect(screen.getByRole('button', { name: `Вибір дати: ${todayLabel}` })).toBeInTheDocument();
            expectDatePickerClosed();
        });

        it('discards a pending date when cancelled', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            openDatePickerAndSelectToday(todayLabel);
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

            expect(screen.getByRole('button', { name: /Вибір дати/i })).toHaveTextContent('');
            expectDatePickerClosed();
        });

        it('deselects a day and confirms the current date when no date remains selected', () => {
            render(<EventModal {...defaultProps} />);
            const todayLabel = getTodayLabel();

            openDatePickerAndSelectToday(todayLabel);
            expect(screen.getByRole('button', { name: todayLabel })).toHaveAttribute('aria-pressed', 'false');

            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK }));

            expect(screen.getByRole('button', { name: `Вибір дати: ${todayLabel}` })).toBeInTheDocument();
            expectDatePickerClosed();
        });

        it('opens month and year selection from the calendar header', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Вибрати місяць і рік' }));

            expect(screen.getByRole('button', { name: String(new Date().getFullYear()) })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Січ' })).toBeInTheDocument();
        });

        it('opens a month calendar with an inactive confirmation button', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Вибрати місяць і рік' }));
            fireEvent.click(screen.getByRole('button', { name: 'Січ' }));

            expect(screen.getByText('ПН')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK })).toBeDisabled();
            expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Вибрати місяць і рік' })).not.toBeInTheDocument();
        });

        it('does not allow interaction with the parent date picker while the month selector is open', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /Вибір дати/i }));
            fireEvent.click(screen.getByRole('button', { name: 'Вибрати місяць і рік' }));

            expect(screen.queryByText('ПН')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.OK })).not.toBeInTheDocument();
        });
    });

    describe('image handling', () => {
        it('renders image section label and upload component initially', () => {
            render(<EventModal {...defaultProps} />);

            expect(screen.getByText(EVENTS_TEXT.FORM.LABEL.IMAGE)).toBeInTheDocument();
            expect(screen.getByTestId('image-input')).toBeInTheDocument();
            expect(screen.queryByTestId('event-image-preview')).not.toBeInTheDocument();
        });

        it('renders image preview when an image is selected', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('upload-valid-image'));

            expect(screen.getByTestId('event-image-preview')).toBeInTheDocument();
            expect(screen.getByTestId('event-image-preview')).toHaveAttribute(
                'src',
                'data:image/png;base64,test-base64-data',
            );
            expect(screen.getByTestId('image-input')).toBeInTheDocument();
        });

        it('displays error message when image validation fails', async () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('trigger-image-error'));

            const errorMessage = await screen.findByText(
                mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB),
            );
            expect(errorMessage).toBeInTheDocument();
        });

        it('clears image error when a valid image is selected', async () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('trigger-image-error'));
            expect(
                await screen.findByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
            ).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('upload-valid-image'));

            await waitFor(() => {
                expect(
                    screen.queryByText(mockEventValidation.image.getSizeError(mockEventValidation.image.maxSizeMB)),
                ).not.toBeInTheDocument();
            });
        });

        it('shows confirmation modal on close when image was added (isDirty state)', () => {
            render(<EventModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('upload-valid-image'));
            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });
    });

    describe('edit mode', () => {
        it('keeps the save buttons disabled in edit mode until something changes', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeDisabled();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('enables both buttons after a valid change when all publish fields are filled', async () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventWithImage} />);

            fireEvent.change(screen.getByDisplayValue(eventWithImage.title), { target: { value: 'Нова назва події' } });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            });
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
        });

        it('enables only the draft button when a field required for publishing is empty', async () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.title), { target: { value: 'Нова назва події' } });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeEnabled();
            });
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('keeps the save buttons disabled in edit mode when the change is invalid', async () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.title), { target: { value: 'Коротко' } });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_DRAFT })).toBeDisabled();
            });
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('collapses repeated spaces in the title while typing', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.title), { target: { value: 'Нова  назва  події' } });

            expect(screen.getByDisplayValue('Нова назва події')).toBeInTheDocument();
        });

        it('collapses repeated spaces in the link while typing', () => {
            render(<EventModal {...defaultProps} mode={ModalMode.Edit} eventToEdit={eventToEdit} />);

            fireEvent.change(screen.getByDisplayValue(eventToEdit.resource), {
                target: { value: 'https://example.com/  news' },
            });

            expect(screen.getByDisplayValue('https://example.com/ news')).toBeInTheDocument();
        });
    });
});
