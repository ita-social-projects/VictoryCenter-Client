import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistorySectionForm } from './HistorySectionForm';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import type { HistorySectionDto } from '@/types/common/history-sections';
import type { ImageValues } from '@/types/common/image';

const mockRenderHistorySection = jest.fn();
const mockGetInitialHistorySectionContents = jest.fn();
const mockIsHistoryTemplate = jest.fn();

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
    }) => (
        <button {...props}>{children}</button>
    ),
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
        },
        {
            id: 2,
            sectionId: 1,
            contentType: ContentType.Description,
            order: 1,
            description: 'Original description',
        },
        {
            id: 3,
            sectionId: 1,
            contentType: ContentType.Image,
            order: 2,
            image: { id: 3, url: 'image.jpg', mimeType: 'image/jpeg' },
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

describe('HistorySectionForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockIsHistoryTemplate.mockReturnValue(true);
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
                    <button type="button" data-testid="change-title" onClick={() => handlers.onTitleChange('Updated title')}>
                        Change title
                    </button>
                    <button
                        type="button"
                        data-testid="remove-image"
                        onClick={() => handlers.onImagesChange(0, null)}
                    >
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

        const confirmSave = onRequestSaveSection.mock.calls[0][0].onConfirm as () => void;
        confirmSave();

        expect(props.onSave).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(props.onEditStateChange).toHaveBeenLastCalledWith(false);
        });
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
});
