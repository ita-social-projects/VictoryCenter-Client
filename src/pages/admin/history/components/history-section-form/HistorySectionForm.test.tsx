import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistorySectionForm } from './HistorySectionForm';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import type { HistorySectionDto } from '@/types/common/history-sections';
import type { ImageValues } from '@/types/common/image';
import type { LocalizationLanguage } from '@/types/common/language';

const mockRenderHistorySection = jest.fn();
const mockGetInitialHistorySectionContents = jest.fn();
const mockIsHistoryTemplate = jest.fn();
const mockMapHistorySectionContentDtoToModel = jest.fn();
const mockReturnDisplayedLocalization = jest.fn();

jest.mock('@/utils/functions/mappers/admin/history/history-mappers', () => ({
    mapHistorySectionContentDtoToModel: (...args: unknown[]) => mockMapHistorySectionContentDtoToModel(...args),
}));

jest.mock('@/utils/functions/localization/localization', () => ({
    returnDisplayedLocalization: (...args: unknown[]) => mockReturnDisplayedLocalization(...args),
}));

jest.mock('@/utils/functions/render-history-section', () => ({
    renderHistorySection: (...args: unknown[]) => mockRenderHistorySection(...args),
    getInitialHistorySectionContents: (...args: unknown[]) => mockGetInitialHistorySectionContents(...args),
    isHistoryTemplate: (...args: unknown[]) => mockIsHistoryTemplate(...args),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        type = 'button',
    }: {
        children: React.ReactNode;
        onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
        disabled?: boolean;
        type?: 'button' | 'submit' | 'reset';
    }) => (
        <button type={type} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({
        children,
        DefaultIcon: _defaultIcon,
        FilledIcon: _filledIcon,
        ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: React.ReactNode;
        DefaultIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        FilledIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    }) => <button {...props}>{children}</button>,
}));

jest.mock('@/const/common/action-icons', () => ({
    ACTION_ICONS: {
        edit: { default: () => null, hover: () => null },
        delete: { default: () => null, hover: () => null },
    },
}));

jest.mock('@/assets/icons/change.svg', () => ({
    ReactComponent: () => <svg data-testid="change-icon" />,
}));

const createSection = (): HistorySectionDto => ({
    id: 1,
    template: SectionTemplate.SingleImageTop,
    order: 0,
    contents: [
        {
            id: 1,
            sectionId: 1,
            contentType: ContentType.Title,
            order: 0,
            title: 'Original title',
            localizations: [],
        },
        {
            id: 2,
            sectionId: 1,
            contentType: ContentType.Description,
            order: 1,
            description: 'Original description',
            localizations: [],
        },
        {
            id: 3,
            sectionId: 1,
            contentType: ContentType.Image,
            order: 2,
            image: { id: 3, url: 'image.jpg', mimeType: 'image/jpeg' },
            localizations: [],
        },
    ],
});

const createProps = (
    overrides: Partial<React.ComponentProps<typeof HistorySectionForm>> = {},
): React.ComponentProps<typeof HistorySectionForm> => ({
    section: createSection(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onSectionChange: jest.fn(),
    onEditStateChange: jest.fn(),
    onDelete: jest.fn(),
    onRequestReplace: jest.fn(),
    isFirstSection: false,
    isLastSection: false,
    onMoveUpSection: jest.fn(),
    onMoveDownSection: jest.fn(),
    ...overrides,
});

const createDenormalizedSection = (): HistorySectionDto => ({
    ...createSection(),
    contents: [
        {
            id: 3,
            sectionId: 1,
            contentType: ContentType.Image,
            order: 0,
            image: { id: 3, url: 'image.jpg', mimeType: 'image/jpeg' },
            localizations: [],
        },
        {
            id: 1,
            sectionId: 1,
            contentType: ContentType.Title,
            order: 1,
            title: 'Original title',
            localizations: [],
        },
        {
            id: 2,
            sectionId: 1,
            contentType: ContentType.Description,
            order: 2,
            description: 'Original description',
            localizations: [],
        },
    ],
});

describe('HistorySectionForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockIsHistoryTemplate.mockReturnValue(true);
        mockMapHistorySectionContentDtoToModel.mockReturnValue({});
        mockReturnDisplayedLocalization.mockReturnValue(null);
        mockGetInitialHistorySectionContents.mockReturnValue([
            {
                contentType: ContentType.Title,
                order: 0,
                title: '',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description: '',
                image: null,
            },
            {
                contentType: ContentType.Image,
                order: 2,
                title: null,
                description: null,
                image: null,
            },
        ]);

        mockRenderHistorySection.mockImplementation(
            ({
                handlers,
                mode,
            }: {
                handlers: {
                    onTitleChange: (value: string) => void;
                    onDescriptionChange: (value: string) => void;
                    onImagesChange: (index: number, file: ImageValues | null) => void;
                };
                mode: SectionMode;
            }) => (
                <div data-testid="rendered-history-section" data-mode={mode}>
                    <button
                        type="button"
                        data-testid="change-title"
                        onClick={() => handlers.onTitleChange('Updated title')}
                    >
                        Change title
                    </button>
                    <button
                        type="button"
                        data-testid="change-description"
                        onClick={() => handlers.onDescriptionChange('Updated description')}
                    >
                        Change description
                    </button>
                    <button type="button" data-testid="remove-image" onClick={() => handlers.onImagesChange(0, null)}>
                        Remove image
                    </button>
                </div>
            ),
        );
    });

    it('renders view actions and movement controls', () => {
        const props = createProps();

        render(<HistorySectionForm {...props} />);

        expect(screen.getByRole('button', { name: 'Edit section' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete section' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Replace section' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Move up section' }));
        fireEvent.click(screen.getByRole('button', { name: 'Move down section' }));
        fireEvent.click(screen.getByRole('button', { name: 'Delete section' }));
        fireEvent.click(screen.getByRole('button', { name: 'Replace section' }));

        expect(props.onMoveUpSection).toHaveBeenCalledTimes(1);
        expect(props.onMoveDownSection).toHaveBeenCalledTimes(1);
        expect(props.onDelete).toHaveBeenCalledTimes(1);
        expect(props.onRequestReplace).toHaveBeenCalledTimes(1);
    });

    it('enters edit mode and requests save confirmation when dirty', async () => {
        const onRequestSaveSection = jest.fn();
        const props = createProps({ onRequestSaveSection });

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        expect(props.onEditStateChange).toHaveBeenLastCalledWith(true);

        fireEvent.click(screen.getByTestId('change-title'));

        expect(props.onSectionChange).toHaveBeenCalledWith(
            expect.objectContaining({
                contents: expect.arrayContaining([
                    expect.objectContaining({
                        contentType: ContentType.Title,
                        title: 'Updated title',
                    }),
                ]),
            }),
        );

        const saveButton = screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE });
        expect(saveButton).toBeEnabled();

        fireEvent.click(saveButton);

        expect(onRequestSaveSection).toHaveBeenCalledWith(
            expect.objectContaining({
                onConfirm: expect.any(Function),
            }),
        );
        expect(props.onSave).not.toHaveBeenCalled();

        const { onConfirm: confirmSave } = onRequestSaveSection.mock.calls[0][0] as { onConfirm: () => void };

        act(() => {
            confirmSave();
        });

        expect(props.onSave).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(props.onEditStateChange).toHaveBeenLastCalledWith(false);
        });
    });

    it('keeps cancel active and save disabled when section enters edit mode without changes', () => {
        const props = createProps();

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));

        const cancelButton = screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.CANCEL });
        const saveButton = screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE });

        expect(cancelButton).toBeEnabled();
        expect(saveButton).toBeDisabled();
    });

    it('passes remove intent when cancelling a new section', () => {
        const props = createProps({ isNewSection: true });

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.CANCEL }));

        expect(props.onCancel).toHaveBeenCalledWith(
            expect.objectContaining({
                isDirty: false,
                shouldRemove: true,
                isTemplateReplacement: false,
                revertTo: expect.any(Object),
                onAfterDiscard: expect.any(Function),
            }),
        );
    });

    it('disables save when an existing image is removed', () => {
        const props = createProps();

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('remove-image'));

        expect(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE })).toBeDisabled();
    });

    it('does not call onSave when save is clicked while disabled', () => {
        const props = createProps({ isDisabled: true });

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-title'));

        const saveButton = screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE });
        fireEvent.click(saveButton);

        expect(props.onSave).not.toHaveBeenCalled();
    });

    it('saves directly without confirmation when onRequestSaveSection is not provided', async () => {
        const props = createProps({ onRequestSaveSection: undefined });

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-title'));

        fireEvent.click(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE }));

        expect(props.onSave).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(props.onEditStateChange).toHaveBeenLastCalledWith(false);
        });
    });

    it('passes dirty flag and correct revert section when cancelling a dirty existing section', () => {
        const props = createProps({ isNewSection: false });

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-title'));

        fireEvent.click(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.CANCEL }));

        expect(props.onCancel).toHaveBeenCalledWith(
            expect.objectContaining({
                isDirty: true,
                shouldRemove: false,
                isTemplateReplacement: false,
                revertTo: expect.any(Object),
                onAfterDiscard: expect.any(Function),
            }),
        );
    });

    it('reverts local state and exits edit mode when the discard callback is invoked', async () => {
        const props = createProps({ isNewSection: false });

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-title'));

        fireEvent.click(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.CANCEL }));

        const { onAfterDiscard } = (props.onCancel as jest.Mock).mock.calls[0][0] as {
            onAfterDiscard: () => void;
        };

        act(() => {
            onAfterDiscard();
        });

        await waitFor(() => {
            expect(props.onEditStateChange).toHaveBeenLastCalledWith(false);
        });

        const renderedSection = screen.getByTestId('rendered-history-section');
        expect(renderedSection).toHaveAttribute('data-mode', SectionMode.View);
    });

    it('hides move up button for first section and move down button for last section', () => {
        const firstSectionProps = createProps({ isFirstSection: true, isLastSection: false });

        const { rerender } = render(<HistorySectionForm {...firstSectionProps} />);

        expect(screen.queryByRole('button', { name: 'Move up section' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Move down section' })).toBeInTheDocument();

        const lastSectionProps = createProps({ isFirstSection: false, isLastSection: true });
        rerender(<HistorySectionForm {...lastSectionProps} />);

        expect(screen.getByRole('button', { name: 'Move up section' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Move down section' })).not.toBeInTheDocument();
    });

    it('emits a normalized section via onSectionChange when the incoming section needs normalization', () => {
        const denormalizedSection = createDenormalizedSection();

        const props = createProps({ section: denormalizedSection });

        render(<HistorySectionForm {...props} />);

        expect(props.onSectionChange).toHaveBeenCalledWith(
            expect.objectContaining({
                contents: expect.arrayContaining([
                    expect.objectContaining({ contentType: ContentType.Title, order: 0 }),
                    expect.objectContaining({ contentType: ContentType.Description, order: 1 }),
                    expect.objectContaining({ contentType: ContentType.Image, order: 2 }),
                ]),
            }),
        );
    });

    it('skips normalisation and does not emit a section change when the template is not a history template', () => {
        mockIsHistoryTemplate.mockReturnValue(false);

        const props = createProps();
        render(<HistorySectionForm {...props} />);

        expect(props.onSectionChange).not.toHaveBeenCalled();
    });

    it('saves directly without confirmation when onRequestSaveSection is provided but section is not dirty', async () => {
        const onRequestSaveSection = jest.fn();
        const props = createProps({ onRequestSaveSection, isNewSection: true });

        render(<HistorySectionForm {...props} />);
        fireEvent.click(screen.getByTestId('change-title'));

        fireEvent.click(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE }));
        expect(onRequestSaveSection).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        onRequestSaveSection.mockClear();

        const cleanProps = createProps({ onRequestSaveSection, isNewSection: false });
        const { unmount } = render(<HistorySectionForm {...cleanProps} />);

        unmount();

        expect(onRequestSaveSection).not.toHaveBeenCalled();
    });

    it('does nothing when handleImagesChange is called with an out-of-bounds index', () => {
        mockGetInitialHistorySectionContents.mockReturnValue([
            { contentType: ContentType.Image, order: 0, title: null, description: null, image: null },
            { contentType: ContentType.Image, order: 1, title: null, description: null, image: null },
        ]);

        mockRenderHistorySection.mockImplementation(
            ({
                handlers,
                mode,
            }: {
                handlers: { onImagesChange: (index: number, file: ImageValues | null) => void };
                mode: SectionMode;
            }) => (
                <div data-testid="rendered-history-section" data-mode={mode}>
                    <button
                        type="button"
                        data-testid="trigger-oob-image"
                        onClick={() => handlers.onImagesChange(99, null)}
                    >
                        Trigger OOB
                    </button>
                </div>
            ),
        );

        const props = createProps();
        render(<HistorySectionForm {...props} />);

        (props.onSectionChange as jest.Mock).mockClear();

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('trigger-oob-image'));

        expect(props.onSectionChange).not.toHaveBeenCalled();
    });

    it('updates description content through handler and emits section change', () => {
        const props = createProps();

        render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-description'));

        expect(props.onSectionChange).toHaveBeenCalledWith(
            expect.objectContaining({
                contents: expect.arrayContaining([
                    expect.objectContaining({
                        contentType: ContentType.Description,
                        description: 'Updated description',
                    }),
                ]),
            }),
        );
    });

    it('does nothing when description change is requested but section has no description content', () => {
        mockIsHistoryTemplate.mockReturnValue(false);

        const baseSection = createSection();
        const sectionWithoutDescription: HistorySectionDto = {
            ...baseSection,
            contents: baseSection.contents.filter((content) => content.contentType !== ContentType.Description),
        };

        const props = createProps({ section: sectionWithoutDescription });

        render(<HistorySectionForm {...props} />);

        (props.onSectionChange as jest.Mock).mockClear();

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-description'));

        expect(props.onSectionChange).not.toHaveBeenCalled();
    });

    it('does nothing when image index is in range but matching image content is absent', () => {
        mockIsHistoryTemplate.mockReturnValue(false);
        mockGetInitialHistorySectionContents.mockReturnValue([
            { contentType: ContentType.Image, order: 0, title: null, description: null, image: null },
        ]);

        const sectionWithoutImages: HistorySectionDto = {
            ...createSection(),
            contents: [
                {
                    id: 1,
                    sectionId: 1,
                    contentType: ContentType.Title,
                    order: 0,
                    title: 'Original title',
                    localizations: [],
                },
            ],
        };

        const props = createProps({ section: sectionWithoutImages });
        render(<HistorySectionForm {...props} />);

        (props.onSectionChange as jest.Mock).mockClear();

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('remove-image'));

        expect(props.onSectionChange).not.toHaveBeenCalled();
    });

    it('does nothing when title change is requested but section has no title content', () => {
        mockIsHistoryTemplate.mockReturnValue(false);

        const baseSection = createSection();
        const sectionWithoutTitle: HistorySectionDto = {
            ...baseSection,
            contents: baseSection.contents.filter((content) => content.contentType !== ContentType.Title),
        };

        const props = createProps({ section: sectionWithoutTitle });

        render(<HistorySectionForm {...props} />);

        (props.onSectionChange as jest.Mock).mockClear();

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-title'));

        expect(props.onSectionChange).not.toHaveBeenCalled();
    });

    it('skips processing when rerendered with previously emitted section object', () => {
        const sectionNeedingNormalization = createDenormalizedSection();

        const props = createProps({ section: sectionNeedingNormalization });

        const { rerender } = render(<HistorySectionForm {...props} />);

        const emittedNormalizedSection = (props.onSectionChange as jest.Mock).mock.calls[0][0] as HistorySectionDto;

        (props.onSectionChange as jest.Mock).mockClear();

        rerender(<HistorySectionForm {...props} section={emittedNormalizedSection} />);

        expect(props.onSectionChange).not.toHaveBeenCalled();
    });

    it('applies localized text fields when language prop is provided', () => {
        const language: LocalizationLanguage = { id: 1, code: 'en', name: 'English' };

        mockReturnDisplayedLocalization
            .mockReturnValueOnce({
                title: 'EN Title',
                description: null,
                language: { id: 1, code: 'en' },
                translationStatus: 'TRANSLATED',
            })
            .mockReturnValueOnce({
                title: null,
                description: 'EN Description',
                language: { id: 1, code: 'en' },
                translationStatus: 'TRANSLATED',
            });

        const props = createProps({ language });

        render(<HistorySectionForm {...props} />);

        expect(mockMapHistorySectionContentDtoToModel).toHaveBeenCalled();
        expect(mockReturnDisplayedLocalization).toHaveBeenCalledWith(expect.anything(), 'en');
    });

    it('allows save when isReplacingTemplate is true even when an existing image is removed', () => {
        const props = createProps({ isReplacingTemplate: true });

        render(<HistorySectionForm {...props} />);

        // Component already starts in Edit mode due to isReplacingTemplate=true
        fireEvent.click(screen.getByTestId('remove-image'));

        // isReplacingTemplate=true overrides the deleted-image restriction
        expect(screen.getByRole('button', { name: SECTIONS_TEXT.BUTTON.SAVE })).not.toBeDisabled();
    });

    it('does not reset the draft when only the onSectionChange callback identity changes', () => {
        const props = createProps();
        const firstOnSectionChange = props.onSectionChange as jest.Mock;

        const { rerender } = render(<HistorySectionForm {...props} />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit section' }));
        fireEvent.click(screen.getByTestId('change-title'));

        expect(screen.getByTestId('rendered-history-section')).toHaveAttribute('data-mode', SectionMode.Edit);
        expect(mockRenderHistorySection).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ title: 'Updated title' }),
            }),
        );

        const nextProps = createProps({
            section: props.section,
            onSectionChange: jest.fn(),
        });

        rerender(<HistorySectionForm {...nextProps} />);

        expect(screen.getByTestId('rendered-history-section')).toHaveAttribute('data-mode', SectionMode.Edit);
        expect(mockRenderHistorySection).toHaveBeenLastCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ title: 'Updated title' }),
            }),
        );
        expect(firstOnSectionChange).toHaveBeenCalledWith(
            expect.objectContaining({
                contents: expect.arrayContaining([
                    expect.objectContaining({ contentType: ContentType.Title, title: 'Updated title' }),
                ]),
            }),
        );
    });
});
