import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
                <button type="button" data-testid={`move-up-${props.sectionKey}`} onClick={props.onMoveUpSection}>
                    Move up
                </button>
                <button type="button" data-testid={`save-${props.sectionKey}`} onClick={props.onSave}>
                    Save section
                </button>
                <button
                    type="button"
                    data-testid={`edit-state-${props.sectionKey}`}
                    onClick={() => props.onEditStateChange?.(true)}
                >
                    Edit state
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

const triggerDeleteAndDiscard = (testId: string, mockCancelFn: jest.Mock) => {
    fireEvent.click(screen.getByTestId(testId));
    const { onDiscard } = mockCancelFn.mock.calls[mockCancelFn.mock.calls.length - 1][0];
    act(() => {
        onDiscard();
    });
};

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

    it('reorders sections when moving up or down', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();

        render(<HistoryForm sections={sections} onSectionsChange={onSectionsChange} />);

        fireEvent.click(screen.getByTestId('move-down-history-section-1'));
        expect(onSectionsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({ id: 2 }),
            expect.objectContaining({ id: 1 }),
        ]);

        fireEvent.click(screen.getByTestId('move-up-history-section-2'));
        expect(onSectionsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({ id: 2 }),
            expect.objectContaining({ id: 1 }),
        ]);
    });

    it('does nothing when moving up first section or moving down last section', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();

        render(<HistoryForm sections={sections} onSectionsChange={onSectionsChange} />);

        fireEvent.click(screen.getByTestId('move-up-history-section-1'));
        fireEvent.click(screen.getByTestId('move-down-history-section-2'));

        expect(onSectionsChange).not.toHaveBeenCalled();
    });

    it('calls onReplaceSection with the matching section index', () => {
        const sections = createSections();
        const onReplaceSection = jest.fn();

        render(<HistoryForm sections={sections} onReplaceSection={onReplaceSection} />);

        fireEvent.click(screen.getByTestId('replace-history-section-2'));

        expect(onReplaceSection).toHaveBeenCalledWith(1);
    });

    it('keeps local edits when rerendered with a new sections reference but the same structure', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();

        const { rerender } = render(<HistoryForm sections={sections} onSectionsChange={onSectionsChange} />);

        fireEvent.click(screen.getByTestId('change-history-section-1'));

        expect(onSectionsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({ id: 1, order: 10 }),
            expect.objectContaining({ id: 2, order: 1 }),
        ]);

        const nextSections = sections.map((section) => ({
            ...section,
            contents: section.contents.map((content) => ({ ...content })),
        }));

        rerender(<HistoryForm sections={nextSections} onSectionsChange={onSectionsChange} />);

        const latestFirstSectionProps = mockHistorySectionFormProps.mock.calls
            .map(([props]) => props as HistorySectionFormProps)
            .filter((props) => props.sectionKey === 'history-section-1')
            .at(-1);

        expect(latestFirstSectionProps?.section.order).toBe(10);
    });

    it('resyncs when incoming sections structure changes (grow or shrink)', () => {
        const sections = createSections();

        const { rerender } = render(<HistoryForm sections={sections} />);

        // grow: new section appears
        const grownSections = [...sections, createSection(3, SectionTemplate.SingleImageTop, 2)];
        rerender(<HistoryForm sections={grownSections} />);
        expect(screen.getByTestId('mock-history-section-history-section-3')).toBeInTheDocument();

        // shrink: removed section disappears
        rerender(<HistoryForm sections={[sections[0]]} />);
        expect(screen.getByTestId('mock-history-section-history-section-1')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-history-section-history-section-2')).not.toBeInTheDocument();
    });

    it('keeps section states when rerendered with same length but different signature', () => {
        const sections = createSections();

        const { rerender } = render(<HistoryForm sections={sections} />);

        const nextSections = [
            { ...sections[0], order: 10, contents: sections[0].contents.map((content) => ({ ...content })) },
            { ...sections[1], contents: sections[1].contents.map((content) => ({ ...content })) },
        ];

        rerender(<HistoryForm sections={nextSections} />);

        expect(screen.getByTestId('mock-history-section-history-section-1')).toBeInTheDocument();
        expect(screen.getByTestId('mock-history-section-history-section-2')).toBeInTheDocument();
    });

    it('calls onSectionSaved when a section is saved', () => {
        const sections = createSections();
        const onSectionSaved = jest.fn();

        render(<HistoryForm sections={sections} onSectionSaved={onSectionSaved} />);

        fireEvent.click(screen.getByTestId('save-history-section-1'));

        expect(onSectionSaved).toHaveBeenCalledTimes(1);
    });

    it('updates editing state through onEditStateChange callback path', () => {
        const sections = createSections();

        render(<HistoryForm sections={sections} />);

        fireEvent.click(screen.getByTestId('edit-state-history-section-1'));

        const latestFirstSectionProps = mockHistorySectionFormProps.mock.calls
            .map(([props]) => props as HistorySectionFormProps)
            .filter((props) => props.sectionKey === 'history-section-1')
            .at(-1);

        expect(latestFirstSectionProps?.isNewSection).toBe(false);
    });

    it('removes section and fires both onSectionsChange and onSectionDeleted on delete discard', () => {
        const sections = createSections();
        const onSectionsChange = jest.fn();
        const onRequestCancelSection = jest.fn();
        const onSectionDeleted = jest.fn();

        render(
            <HistoryForm
                sections={sections}
                onSectionsChange={onSectionsChange}
                onRequestCancelSection={onRequestCancelSection}
                onSectionDeleted={onSectionDeleted}
            />,
        );

        triggerDeleteAndDiscard('delete-history-section-1', onRequestCancelSection);

        const expected = [expect.objectContaining({ id: 2 })];
        expect(onSectionsChange).toHaveBeenLastCalledWith(expected);
        expect(onSectionDeleted).toHaveBeenCalledWith(expected);
    });

    it('supports imperative ref methods addSection, replaceSection and getSections', () => {
        const sections = createSections();
        const ref = React.createRef<{ addSection: Function; replaceSection: Function; getSections: Function }>();

        render(<HistoryForm ref={ref as any} sections={sections} />);

        const addedSection = createSection(3, SectionTemplate.TextOnly, 2);
        act(() => {
            ref.current?.addSection(addedSection);
        });

        expect(ref.current?.getSections()).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: 3 }), expect.objectContaining({ id: 2 })]),
        );

        const replacement = createSection(20, SectionTemplate.SingleImageTop, 0);
        act(() => {
            ref.current?.replaceSection(0, replacement);
        });

        expect(ref.current?.getSections()).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: 20 }), expect.objectContaining({ id: 2 })]),
        );
    });

    it('ignores imperative replaceSection for out-of-bounds indexes', () => {
        const sections = createSections();
        const ref = React.createRef<{ replaceSection: Function; getSections: Function }>();

        render(<HistoryForm ref={ref as any} sections={sections} />);

        const before = ref.current?.getSections();
        ref.current?.replaceSection(-1, createSection(999, SectionTemplate.TextOnly, 0));
        ref.current?.replaceSection(100, createSection(1000, SectionTemplate.TextOnly, 1));

        expect(ref.current?.getSections()).toEqual(before);
    });

    it('does not mutate sections when revert discard runs after the section was removed', async () => {
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

        fireEvent.click(screen.getByTestId('cancel-dirty-history-section-1'));
        const revertRequest = onRequestCancelSection.mock.calls[0][0] as { onDiscard: () => void };

        fireEvent.click(screen.getByTestId('delete-history-section-1'));
        const removeRequest = onRequestCancelSection.mock.calls[1][0] as { onDiscard: () => void };
        act(() => {
            removeRequest.onDiscard();
        });

        await waitFor(() => {
            expect(screen.queryByTestId('mock-history-section-history-section-1')).not.toBeInTheDocument();
        });

        const callsBeforeRevert = onSectionsChange.mock.calls.length;
        act(() => {
            revertRequest.onDiscard();
        });

        expect(onSectionsChange.mock.calls.length).toBe(callsBeforeRevert);
    });

    it('ignores repeated remove discard for an already removed section', () => {
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

        const removeRequest = onRequestCancelSection.mock.calls[0][0] as { onDiscard: () => void };

        act(() => {
            removeRequest.onDiscard();
        });
        const callsAfterFirstDiscard = onSectionsChange.mock.calls.length;

        act(() => {
            removeRequest.onDiscard();
        });

        expect(onSectionsChange.mock.calls.length).toBe(callsAfterFirstDiscard);
    });

    it('falls back to false when template validity is undefined', () => {
        const sections = createSections();
        mockIsHistoryTemplate.mockImplementation(() => undefined as unknown as boolean);

        render(<HistoryForm sections={sections} />);

        expect(mockHistorySectionFormProps).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                isSectionValid: false,
            }),
        );
    });
});
