import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistoryForm } from './HistoryForm';
import { SectionCancelActionType } from '@/types/admin/programs';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import type { HistorySectionDto } from '@/types/common/history-sections';
import type { HistorySectionFormProps } from '../history-section-form/HistorySectionForm';

const mockHistorySectionFormProps = jest.fn();
const mockIsHistoryTemplate = jest.fn();

jest.mock('@/utils/functions/render-history-section', () => ({
    isHistoryTemplate: (...args: unknown[]) => mockIsHistoryTemplate(...args),
}));

jest.mock('../history-section-form/HistorySectionForm', () => ({
    HistorySectionForm: (props: HistorySectionFormProps) => {
        mockHistorySectionFormProps(props);

        return (
            <div data-testid={`mock-history-section-${props.sectionKey}`}>
                <button
                    type="button"
                    data-testid={`change-${props.sectionKey}`}
                    onClick={() => props.onSectionChange?.({ ...props.section, order: props.section.order + 10 })}
                >
                    Change section
                </button>
                <button type="button" data-testid={`delete-${props.sectionKey}`} onClick={props.onDelete}>
                    Delete section
                </button>
                <button type="button" data-testid={`replace-${props.sectionKey}`} onClick={props.onRequestReplace}>
                    Replace section
                </button>
                <button type="button" data-testid={`move-down-${props.sectionKey}`} onClick={props.onMoveDownSection}>
                    Move down
                </button>
                <button
                    type="button"
                    data-testid={`cancel-dirty-${props.sectionKey}`}
                    onClick={() =>
                        props.onCancel({
                            isDirty: true,
                            shouldRemove: false,
                            revertTo: { ...props.section, order: 99 },
                            onAfterDiscard: () => undefined,
                        })
                    }
                >
                    Cancel dirty
                </button>
                <button
                    type="button"
                    data-testid={`cancel-replace-${props.sectionKey}`}
                    onClick={() =>
                        props.onCancel({
                            isDirty: false,
                            shouldRemove: false,
                            revertTo: props.section,
                            onAfterDiscard: () => undefined,
                            isTemplateReplacement: true,
                        })
                    }
                >
                    Cancel replace
                </button>
                <button
                    type="button"
                    data-testid={`cancel-new-${props.sectionKey}`}
                    onClick={() =>
                        props.onCancel({
                            isDirty: true,
                            shouldRemove: true,
                            revertTo: props.section,
                            onAfterDiscard: () => undefined,
                        })
                    }
                >
                    Cancel new
                </button>
            </div>
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

const createSections = (): HistorySectionDto[] => [
    createSection(1, SectionTemplate.SingleImageTop, 0),
    createSection(2, SectionTemplate.TextOnly, 1),
];

describe('HistoryForm', () => {
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
            value: jest.fn(),
            writable: true,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsHistoryTemplate.mockImplementation((template: number) => template === SectionTemplate.SingleImageTop);
    });

    it('renders nothing when there are no sections', () => {
        const { container } = render(<HistoryForm sections={[]} />);

        expect(container.firstChild).toBeNull();
    });

    it('passes positional and validity props to child section forms', () => {
        const sections = createSections();
        const onRequestSaveSection = jest.fn();

        render(<HistoryForm sections={sections} onRequestSaveSection={onRequestSaveSection} />);

        expect(mockHistorySectionFormProps).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                sectionKey: 'history-section-1',
                isFirstSection: true,
                isLastSection: false,
                isSectionValid: true,
                onRequestSaveSection,
            }),
        );

        expect(mockHistorySectionFormProps).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                sectionKey: 'history-section-2',
                isFirstSection: false,
                isLastSection: true,
                isSectionValid: false,
                onRequestSaveSection,
            }),
        );
    });

    it('updates sections when a child section changes', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();

        render(<HistoryForm sections={sections} onSectionsChange={onSectionsChange} />);

        fireEvent.click(screen.getByTestId('change-history-section-1'));

        expect(onSectionsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({ id: 1, order: 10 }),
            expect.objectContaining({ id: 2, order: 1 }),
        ]);
    });

    it('requests deletion confirmation and removes section on discard', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();
        const onRequestCancelSection = jest.fn();

        render(
            <HistoryForm
                sections={sections}
                onSectionsChange={onSectionsChange}
                onRequestCancelSection={onRequestCancelSection}
            />,
        );

        fireEvent.click(screen.getByTestId('delete-history-section-1'));

        expect(onRequestCancelSection).toHaveBeenCalledWith(
            expect.objectContaining({
                type: SectionCancelActionType.RemoveSection,
                onDiscard: expect.any(Function),
            }),
        );

        const removeRequest = onRequestCancelSection.mock.calls[0][0] as { onDiscard: () => void };
        removeRequest.onDiscard();

        expect(onSectionsChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: 2 })]);
    });

    it('maps cancel requests to expected action types', () => {
        const sections = createSections();
        const onRequestCancelSection = jest.fn();

        render(<HistoryForm sections={sections} onRequestCancelSection={onRequestCancelSection} />);

        fireEvent.click(screen.getByTestId('cancel-dirty-history-section-1'));
        fireEvent.click(screen.getByTestId('cancel-replace-history-section-1'));
        fireEvent.click(screen.getByTestId('cancel-new-history-section-1'));

        expect(onRequestCancelSection).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ type: SectionCancelActionType.RevertSection }),
        );
        expect(onRequestCancelSection).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ type: SectionCancelActionType.RevertAfterReplace }),
        );
        expect(onRequestCancelSection).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({ type: SectionCancelActionType.DiscardNewSection }),
        );
    });

    it('reorders sections when moving down', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();

        render(<HistoryForm sections={sections} onSectionsChange={onSectionsChange} />);

        fireEvent.click(screen.getByTestId('move-down-history-section-1'));

        expect(onSectionsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({ id: 2 }),
            expect.objectContaining({ id: 1 }),
        ]);
    });

    it('calls onReplaceSection with the matching section index', () => {
        const sections = createSections();
        const onReplaceSection = jest.fn();

        render(<HistoryForm sections={sections} onReplaceSection={onReplaceSection} />);

        fireEvent.click(screen.getByTestId('replace-history-section-2'));

        expect(onReplaceSection).toHaveBeenCalledWith(1);
    });
});
