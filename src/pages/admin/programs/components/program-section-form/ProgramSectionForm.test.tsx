import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ProgramSectionForm } from './ProgramSectionForm';
import type { ProgramSectionFormProps } from './ProgramSectionForm';
import type { CreateHippotherapyProgramSectionDto } from '@/types/common/program-sections';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: jest.fn(() => <div data-testid="editable-section" />),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ buttonStyle: _buttonStyle, ...props }: any) => <button {...props}>{props.children}</button>,
}));

jest.mock('@/utils/functions/program-section-template-validation/programSectionTemplateValidation', () => ({
    getProgramSectionTemplateMaxGroupCount: jest.fn(),
    normalizeGroupedContentsGroupIndexes: jest.fn(),
}));

jest.mock('@/validation/admin/program-schema/program-schema', () => ({
    PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
        validateContentText: jest.fn(),
        validateFaqQuestion: jest.fn(),
        validateFaqAnswer: jest.fn(),
    },
}));

const renderProgramSectionMock = renderProgramSection as unknown as jest.Mock;

const getTemplateValidationMocks = () => {
    const mod = jest.requireMock(
        '@/utils/functions/program-section-template-validation/programSectionTemplateValidation',
    ) as {
        getProgramSectionTemplateMaxGroupCount: jest.Mock;
        normalizeGroupedContentsGroupIndexes: jest.Mock;
    };

    return {
        getProgramSectionTemplateMaxGroupCount: mod.getProgramSectionTemplateMaxGroupCount,
        normalizeGroupedContentsGroupIndexes: mod.normalizeGroupedContentsGroupIndexes,
    };
};

const getProgramValidationMocks = () => {
    const mod = jest.requireMock('@/validation/admin/program-schema/program-schema') as {
        PROGRAM_SECTION_VALIDATION_FUNCTIONS: {
            validateContentText: jest.Mock;
            validateFaqQuestion: jest.Mock;
            validateFaqAnswer: jest.Mock;
        };
    };

    return mod.PROGRAM_SECTION_VALIDATION_FUNCTIONS;
};

const makeImage = (id: string, url?: string): any => (url ? { id, url, mimeType: 'image/png' } : { id });

const makeTitleContent = (title: string | null, order = 0) => ({
    contentType: ContentType.Title,
    order,
    title,
    description: null,
    image: null,
});

const makeDescriptionContent = (order: number, description: string | null | undefined) => ({
    contentType: ContentType.Description,
    order,
    title: null,
    description,
    image: null,
});

const makeImageContent = (order: number, image: any) => ({
    contentType: ContentType.Image,
    order,
    title: null,
    description: null,
    image,
});

const makePairDescription = (order: number, groupIndex: number | null | undefined, description: any) => ({
    contentType: ContentType.Description,
    order,
    groupIndex,
    title: null,
    description,
    image: null,
});

const makePairAuthor = (order: number, groupIndex: number | null | undefined, author: any) => ({
    contentType: ContentType.Author,
    order,
    groupIndex,
    title: null,
    author,
    description: null,
    image: null,
});

const makeSection = (
    overrides?: Partial<CreateHippotherapyProgramSectionDto>,
): CreateHippotherapyProgramSectionDto => ({
    template: SectionTemplate.TextOnly,
    order: 0,
    contents: [
        makeTitleContent('Title', 0),
        makeDescriptionContent(1, 'Desc-1'),
        makeDescriptionContent(2, 'Desc-2'),
        makeImageContent(3, makeImage('img1', 'img1-url')),
        makeImageContent(4, makeImage('no-url')),
        makeImageContent(5, null),
    ],
    ...overrides,
});

const getLastUpdatedSection = (onSectionChange: jest.Mock) =>
    onSectionChange.mock.calls[onSectionChange.mock.calls.length - 1][0] as CreateHippotherapyProgramSectionDto;

const getContentsBy = (s: CreateHippotherapyProgramSectionDto, type: ContentType) =>
    s.contents.filter((c: any) => c.contentType === type);

const getContentByGroupAndType = (s: CreateHippotherapyProgramSectionDto, groupIndex: number, type: ContentType) =>
    s.contents.find((c: any) => c.groupIndex === groupIndex && c.contentType === type);

const createFocusableTextarea = (id: string) => {
    const el = document.createElement('textarea');
    el.id = id;
    const focusMock = jest.fn();
    (el as any).focus = focusMock;
    document.body.appendChild(el);
    return { el, focusMock };
};

describe('ProgramSectionForm', () => {
    let baseProps: ProgramSectionFormProps;

    const renderForm = (overrides: Partial<ProgramSectionFormProps> = {}) => {
        render(<ProgramSectionForm {...baseProps} {...overrides} />);
    };

    const renderWithHandlers = (overrides: Partial<ProgramSectionFormProps> = {}) => {
        let capturedHandlers: any;

        renderProgramSectionMock.mockImplementation((payload: any) => {
            capturedHandlers = payload.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = (overrides.onSectionChange as jest.Mock) ?? jest.fn();

        renderForm({
            isNewSection: true,
            isSectionValid: true,
            ...overrides,
            onSectionChange,
        });

        return { handlers: capturedHandlers, onSectionChange };
    };

    beforeEach(() => {
        jest.clearAllMocks();

        const { getProgramSectionTemplateMaxGroupCount, normalizeGroupedContentsGroupIndexes } =
            getTemplateValidationMocks();
        const { validateContentText, validateFaqQuestion, validateFaqAnswer } = getProgramValidationMocks();

        getProgramSectionTemplateMaxGroupCount.mockReset();
        normalizeGroupedContentsGroupIndexes.mockReset();
        validateContentText.mockReset();
        validateFaqQuestion.mockReset();
        validateFaqAnswer.mockReset();

        getProgramSectionTemplateMaxGroupCount.mockReturnValue(10);
        validateContentText.mockReturnValue(undefined);
        validateFaqQuestion.mockReturnValue(undefined);
        validateFaqAnswer.mockReturnValue(undefined);

        normalizeGroupedContentsGroupIndexes.mockImplementation((contents: any[], types: ContentType[]) => {
            const allowed = new Set<number>(types as any);

            const groups = Array.from(
                new Set(
                    contents
                        .filter(
                            (c: any) =>
                                allowed.has(c.contentType) &&
                                c.groupIndex !== null &&
                                c.groupIndex !== undefined &&
                                typeof c.groupIndex === 'number',
                        )
                        .map((c: any) => c.groupIndex as number),
                ),
            ).sort((a, b) => a - b);

            const map = new Map<number, number>();
            groups.forEach((g, i) => map.set(g, i));

            return contents.map((c: any) => {
                if (!allowed.has(c.contentType)) return c;
                if (c.groupIndex === null || c.groupIndex === undefined) return c;
                const ng = map.get(c.groupIndex);
                if (ng === undefined) return c;
                return { ...c, groupIndex: ng };
            });
        });

        renderProgramSectionMock.mockReturnValue(<div data-testid="editable-section" />);

        baseProps = {
            section: makeSection(),
            onSave: jest.fn(),
            onCancel: jest.fn(),
            isDisabled: false,
            onSectionChange: jest.fn(),
            isNewSection: false,
            isSectionValid: false,
            isFirstSection: false,
            isLastSection: false,
            onMoveUpSection: jest.fn(),
            onMoveDownSection: jest.fn(),
        } as ProgramSectionFormProps;
    });

    it('renders editable section', () => {
        renderForm();
        expect(screen.getByTestId('editable-section')).toBeInTheDocument();
    });

    it('renders template info if editableSection is null', () => {
        renderProgramSectionMock.mockReturnValueOnce(null);
        renderForm();
        expect(screen.getByText(/Template ID:/)).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
        renderForm({ isNewSection: true });
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL));
        expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('reverts section changes when onAfterDiscard is called for non-new section', () => {
        const section = makeSection({
            contents: [makeTitleContent('Original Title', 0), makeDescriptionContent(1, 'Original Description')],
        });

        const onCancel = jest.fn();
        const { handlers } = renderWithHandlers({ section, isNewSection: false, onCancel });

        const editButton = screen.getByLabelText('Edit section');
        fireEvent.click(editButton);

        act(() => {
            handlers.onTitleChange('Modified Title');
        });
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL));

        expect(onCancel).toHaveBeenCalledTimes(1);

        const cancelOptions = onCancel.mock.calls[0][0];
        expect(cancelOptions.shouldRemove).toBe(false);
        expect(cancelOptions.revertTo.contents[0].title).toBe('Original Title');

        act(() => {
            cancelOptions.onAfterDiscard();
        });
        expect(screen.getByLabelText('Edit section')).toBeInTheDocument();
    });

    it('save button is disabled when isSectionValid is false', () => {
        renderForm({ isNewSection: true, isSectionValid: false });
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE)).toBeDisabled();
    });

    it('cancel button is disabled when isDisabled is true', () => {
        renderForm({ isDisabled: true, isNewSection: true });
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).toBeDisabled();
    });

    it('defaults isDisabled to false when omitted', () => {
        const { isDisabled: _omit, ...propsWithoutIsDisabled } = baseProps as any;
        render(<ProgramSectionForm {...propsWithoutIsDisabled} isNewSection={true} isSectionValid={false} />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).not.toBeDisabled();
    });

    it('passes normalized title/description/descriptions/images into renderProgramSection', () => {
        const section = makeSection({
            contents: [
                makeTitleContent(null, 0),
                makeDescriptionContent(2, undefined),
                makeDescriptionContent(1, 'D-1'),
                makeImageContent(3, makeImage('img1', 'img1-url')),
                makeImageContent(4, makeImage('no-url')),
                makeImageContent(5, null),
            ],
        });

        renderForm({ section, isNewSection: false });

        const callPayload = renderProgramSectionMock.mock.calls[0][0];

        expect(callPayload.templateId).toBe(section.template);
        expect(callPayload.mode).toBe(SectionMode.View);

        expect(callPayload.data).toEqual({
            title: '',
            description: 'D-1',
            descriptions: ['D-1', ''],
            images: [{ id: 'img1', url: 'img1-url', mimeType: 'image/png' }, { id: 'no-url' }, null],
        });

        expect(callPayload.handlers).toEqual(
            callPayload.handlers
                ? expect.objectContaining({
                      onTitleChange: expect.any(Function),
                      onDescriptionChange: expect.any(Function),
                      onDescriptionsChange: expect.any(Function),
                      onImagesChange: expect.any(Function),
                  })
                : undefined,
        );
    });

    it('calls onSectionChange with updated title when onTitleChange is invoked', () => {
        const section = makeSection();
        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onTitleChange('New Title');
        });

        const updated = getLastUpdatedSection(onSectionChange);
        const title = updated.contents.find((c: any) => c.contentType === ContentType.Title);
        expect(title?.title).toBe('New Title');
    });

    it('updates all descriptions when onDescriptionChange is invoked', () => {
        const section = makeSection({
            contents: [makeTitleContent('T', 0), makeDescriptionContent(1, 'A'), makeDescriptionContent(2, 'B')],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onDescriptionChange('NEW');
        });

        const updated = getLastUpdatedSection(onSectionChange);
        const descs = getContentsBy(updated, ContentType.Description);
        expect(descs.map((d: any) => d.description)).toEqual(['NEW', 'NEW']);
    });

    it('updates only targeted description when onDescriptionsChange is invoked', () => {
        const section = makeSection({
            contents: [
                makeTitleContent('T', 0),
                makeDescriptionContent(10, 'D10'),
                makeDescriptionContent(20, 'D20'),
                makeDescriptionContent(30, 'D30'),
            ],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onDescriptionsChange(1, 'UPDATED');
        });

        const updated = getLastUpdatedSection(onSectionChange);
        const ordered = getContentsBy(updated, ContentType.Description).sort((a: any, b: any) => a.order - b.order);

        expect(ordered.map((d: any) => d.description)).toEqual(['D10', 'UPDATED', 'D30']);
    });

    it('does nothing when onDescriptionsChange index is out of range', () => {
        const section = makeSection({
            contents: [makeTitleContent('T', 0), makeDescriptionContent(1, 'D1')],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onDescriptionsChange(5, 'NOPE');
        });

        expect(onSectionChange).not.toHaveBeenCalled();
    });

    it('updates correct image by index when onImagesChange is invoked', () => {
        const section = makeSection({
            contents: [
                makeTitleContent('T', 0),
                makeImageContent(2, makeImage('a', 'A')),
                makeImageContent(1, makeImage('b', 'B')),
            ],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        const newFile = makeImage('new', 'NEW');

        act(() => {
            handlers.onImagesChange(0, newFile);
        });

        const updated = getLastUpdatedSection(onSectionChange);
        const orderedImages = getContentsBy(updated, ContentType.Image).sort((a: any, b: any) => a.order - b.order);

        expect(orderedImages[0].image).toEqual(newFile);
    });

    it('does nothing when onImagesChange index is out of range', () => {
        const section = makeSection({
            contents: [makeTitleContent('T', 0), makeImageContent(1, makeImage('a', 'A'))],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onImagesChange(5, null);
        });

        expect(onSectionChange).not.toHaveBeenCalled();
    });

    describe('DescriptionAuthorPairs template', () => {
        const makePairsSection = (contents: any[]) =>
            makeSection({
                template: SectionTemplate.SingleTitleDescriptionAuthorPairs,
                contents,
            });

        it('passes descriptionAuthorPairs into renderProgramSection', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(2, 1, 'D1'),
                makePairAuthor(3, 0, 'A0'),
                makePairDescription(4, 0, null),
                makePairAuthor(5, 1, undefined),
                makePairDescription(6, null, 'IGNORED'),
                makePairAuthor(7, undefined, 'IGNORED'),
            ]);

            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];
            expect(payload.data.descriptionAuthorPairs).toEqual([
                { description: '', author: 'A0' },
                { description: 'D1', author: '' },
            ]);
        });

        it('includes pair handlers in renderProgramSection handlers', () => {
            const section = makePairsSection([makeTitleContent('T', 0)]);
            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];

            expect(payload.handlers.onAddPair).toEqual(expect.any(Function));
            expect(payload.handlers.onDeletePair).toEqual(expect.any(Function));
            expect(payload.handlers.onCardDescriptionChange).toEqual(expect.any(Function));
            expect(payload.handlers.onCardAuthorChange).toEqual(expect.any(Function));
        });

        it('passes canAddPair=true when title and pair fields are valid', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
            ]);

            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];

            expect(payload.handlers.canAddPair).toBe(true);
            expect(getProgramValidationMocks().validateContentText).toHaveBeenNthCalledWith(
                1,
                'T',
                ContentType.Title,
                true,
                SectionTemplate.SingleTitleDescriptionAuthorPairs,
            );
            expect(getProgramValidationMocks().validateContentText).toHaveBeenNthCalledWith(
                2,
                'D0',
                ContentType.Description,
                true,
                SectionTemplate.SingleTitleDescriptionAuthorPairs,
            );
            expect(getProgramValidationMocks().validateContentText).toHaveBeenNthCalledWith(
                3,
                'A0',
                ContentType.Author,
                true,
                SectionTemplate.SingleTitleDescriptionAuthorPairs,
            );
        });

        it('passes canAddPair=false when title is invalid', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
            ]);

            getProgramValidationMocks().validateContentText.mockImplementation((value: string, type: ContentType) =>
                type === ContentType.Title && value === 'T' ? 'TITLE_ERROR' : undefined,
            );

            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];

            expect(payload.handlers.canAddPair).toBe(false);
            expect(getProgramValidationMocks().validateContentText).toHaveBeenCalledTimes(1);
        });

        it('passes canAddPair=false when pair description is invalid', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'BAD_DESC'),
                makePairAuthor(2, 0, 'A0'),
            ]);

            getProgramValidationMocks().validateContentText.mockImplementation((value: string, type: ContentType) =>
                type === ContentType.Description && value === 'BAD_DESC' ? 'DESCRIPTION_ERROR' : undefined,
            );

            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];

            expect(payload.handlers.canAddPair).toBe(false);
            expect(getProgramValidationMocks().validateContentText).toHaveBeenCalledTimes(2);
        });

        it('passes canAddPair=false when pair author is invalid', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'BAD_AUTHOR'),
            ]);

            getProgramValidationMocks().validateContentText.mockImplementation((value: string, type: ContentType) =>
                type === ContentType.Author && value === 'BAD_AUTHOR' ? 'AUTHOR_ERROR' : undefined,
            );

            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];

            expect(payload.handlers.canAddPair).toBe(false);
            expect(getProgramValidationMocks().validateContentText).toHaveBeenCalledTimes(3);
        });

        it('skips text validation for canAddPair when max pairs count is reached', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 1, 'D1'),
                makePairAuthor(4, 1, 'A1'),
            ]);

            getTemplateValidationMocks().getProgramSectionTemplateMaxGroupCount.mockReturnValue(2);

            renderForm({ section, isNewSection: true });

            const payload = renderProgramSectionMock.mock.calls[0][0];

            expect(payload.handlers.canAddPair).toBe(false);
            expect(getProgramValidationMocks().validateContentText).not.toHaveBeenCalled();
        });

        it('updates pair description when onCardDescriptionChange is invoked', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 1, 'D1'),
                makePairAuthor(4, 1, 'A1'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onCardDescriptionChange(1, 'NEW-D1');
            });

            const updated = getLastUpdatedSection(onSectionChange);
            expect((getContentByGroupAndType(updated, 1, ContentType.Description) as any).description).toBe('NEW-D1');
        });

        it('updates pair author when onCardAuthorChange is invoked', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 1, 'D1'),
                makePairAuthor(4, 1, 'A1'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onCardAuthorChange(0, 'NEW-A0');
            });

            const updated = getLastUpdatedSection(onSectionChange);
            expect((getContentByGroupAndType(updated, 0, ContentType.Author) as any).author).toBe('NEW-A0');
        });

        it('does nothing when pair change index is out of range', () => {
            const section = makePairsSection([makeTitleContent('T', 0), makePairDescription(1, 0, 'D0')]);
            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onCardAuthorChange(5, 'X');
            });

            expect(onSectionChange).not.toHaveBeenCalled();
        });

        it('adds a pair after normalizing grouped indexes and schedules focus on next textarea id', () => {
            jest.useFakeTimers();

            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 2, 'D2'),
                makePairAuthor(4, 2, 'A2'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            const maxOrder = Math.max(...section.contents.map((c: any) => c.order));
            const nextIndex = 2;
            const { focusMock } = createFocusableTextarea(`pair-description-${nextIndex}`);

            act(() => {
                handlers.onAddPair();
            });

            act(() => {
                jest.runAllTimers();
            });

            const updated = getLastUpdatedSection(onSectionChange);

            const newDesc = updated.contents.find(
                (c: any) => c.contentType === ContentType.Description && c.order === maxOrder + 1,
            );
            const newAuth = updated.contents.find(
                (c: any) => c.contentType === ContentType.Author && c.order === maxOrder + 2,
            );

            expect(newDesc?.groupIndex).toBe(2);
            expect((newDesc as any)?.description).toBe('');
            expect(newAuth?.groupIndex).toBe(2);
            expect((newAuth as any)?.author).toBe('');

            const descGroups = updated.contents
                .filter((c: any) => c.contentType === ContentType.Description)
                .map((c: any) => c.groupIndex)
                .filter((g: any) => g !== null && g !== undefined)
                .sort((a: number, b: number) => a - b);

            const authorGroups = updated.contents
                .filter((c: any) => c.contentType === ContentType.Author)
                .map((c: any) => c.groupIndex)
                .filter((g: any) => g !== null && g !== undefined)
                .sort((a: number, b: number) => a - b);

            expect(descGroups).toEqual([0, 1, 2]);
            expect(authorGroups).toEqual([0, 1, 2]);
            expect((getContentByGroupAndType(updated, 1, ContentType.Description) as any)?.description).toBe('D2');
            expect((getContentByGroupAndType(updated, 1, ContentType.Author) as any)?.author).toBe('A2');

            expect(focusMock).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });

        it('adds first pair with groupIndex 0 when no groupIndex exists', () => {
            const section = makePairsSection([makeTitleContent('T', 0), makeDescriptionContent(1, 'D')]);
            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onAddPair();
            });

            const updated = getLastUpdatedSection(onSectionChange);
            expect(getContentByGroupAndType(updated, 0, ContentType.Description)).toBeTruthy();
        });

        it('when initial section has no contents, it is prepared with title+one pair, and then onAddPair appends another pair', () => {
            jest.useFakeTimers();

            const section = makeSection({
                template: SectionTemplate.SingleTitleDescriptionAuthorPairs,
                contents: [],
            });

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            const { focusMock } = createFocusableTextarea('pair-description-1');

            act(() => {
                handlers.onAddPair();
            });

            act(() => {
                jest.runAllTimers();
            });

            const updated = getLastUpdatedSection(onSectionChange);
            const orders = updated.contents.map((c: any) => c.order).sort((a: number, b: number) => a - b);

            expect(orders).toEqual([0, 1, 2, 3, 4]);

            const g1d = getContentByGroupAndType(updated, 1, ContentType.Description) as any;
            const g1a = getContentByGroupAndType(updated, 1, ContentType.Author) as any;

            expect(g1d).toBeTruthy();
            expect(g1a).toBeTruthy();
            expect(g1d.description).toBe('');
            expect(g1a.author).toBe('');

            expect(focusMock).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });

        it('deletes pair by index and normalizes remaining group indexes', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 1, 'D1'),
                makePairAuthor(4, 1, 'A1'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onDeletePair(0);
            });

            const updated = getLastUpdatedSection(onSectionChange);

            const hasOld0Desc = updated.contents.some(
                (c: any) => c.contentType === ContentType.Description && c.description === 'D0',
            );
            const hasOld0Auth = updated.contents.some(
                (c: any) => c.contentType === ContentType.Author && c.author === 'A0',
            );

            expect(hasOld0Desc).toBe(false);
            expect(hasOld0Auth).toBe(false);

            expect((getContentByGroupAndType(updated, 0, ContentType.Description) as any)?.description).toBe('D1');
            expect((getContentByGroupAndType(updated, 0, ContentType.Author) as any)?.author).toBe('A1');
        });

        it('does nothing when delete index is out of range (pairs length > 1)', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 1, 'D1'),
                makePairAuthor(4, 1, 'A1'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onDeletePair(9);
            });

            expect(onSectionChange).not.toHaveBeenCalled();
        });
    });

    describe('View/Edit modes', () => {
        it('starts in View mode for saved sections and shows Edit/Delete/Replace buttons', () => {
            renderForm({ isNewSection: false });

            expect(screen.queryByText(PROGRAMS_TEXT.BUTTON.SAVE)).not.toBeInTheDocument();
            expect(screen.queryByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).not.toBeInTheDocument();
            expect(screen.getByLabelText('Edit section')).toBeInTheDocument();
            expect(screen.getByLabelText('Delete section')).toBeInTheDocument();
            expect(screen.getByLabelText('Replace section')).toBeInTheDocument();
        });

        it('starts in Edit mode for new sections and shows Save/Cancel buttons', () => {
            renderForm({ isNewSection: true });

            expect(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE)).toBeInTheDocument();
            expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL)).toBeInTheDocument();
            expect(screen.queryByLabelText('Edit section')).not.toBeInTheDocument();
        });

        it('transitions from View to Edit mode when Edit button is clicked', () => {
            renderForm({ isNewSection: false });

            expect(screen.queryByText(PROGRAMS_TEXT.BUTTON.SAVE)).not.toBeInTheDocument();

            fireEvent.click(screen.getByLabelText('Edit section'));

            expect(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE)).toBeInTheDocument();
            expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL)).toBeInTheDocument();
        });

        it('calls onEditStateChange when transitioning to Edit mode', () => {
            const onEditStateChange = jest.fn();
            renderForm({ isNewSection: false, onEditStateChange } as any);

            expect(onEditStateChange).toHaveBeenCalledWith(false);

            fireEvent.click(screen.getByLabelText('Edit section'));

            expect(onEditStateChange).toHaveBeenCalledWith(true);
        });

        it('calls onSave and transitions back to View mode when Save button is clicked', () => {
            renderForm({ isNewSection: true, isSectionValid: true });

            fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE));

            expect(baseProps.onSave).toHaveBeenCalledTimes(1);
            expect(screen.queryByText(PROGRAMS_TEXT.BUTTON.SAVE)).not.toBeInTheDocument();
            expect(screen.getByLabelText('Edit section')).toBeInTheDocument();
        });

        it('does not call onSave when Save button is clicked but section is invalid', () => {
            renderForm({ isNewSection: true, isSectionValid: false });

            fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE));

            expect(baseProps.onSave).not.toHaveBeenCalled();
        });
    });

    it('updates card title when onCardTitleChange is invoked', () => {
        const section = makeSection({
            template: SectionTemplate.DualTitleDescriptionPairs,
            contents: [
                makeTitleContent('Card 1 Title', 0),
                makeTitleContent('Card 2 Title', 1),
                makeDescriptionContent(0, 'Card 1 Desc'),
                makeDescriptionContent(1, 'Card 2 Desc'),
            ],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onCardTitleChange(1, 'Updated Card 2 Title');
        });

        const updated = getLastUpdatedSection(onSectionChange);
        const orderedTitles = updated.contents
            .filter((c: any) => c.contentType === ContentType.Title)
            .sort((a: any, b: any) => a.order - b.order);

        expect(orderedTitles[0].title).toBe('Card 1 Title');
        expect(orderedTitles[1].title).toBe('Updated Card 2 Title');
    });

    it('updates card description when onCardDescriptionChange is invoked', () => {
        const section = makeSection({
            template: SectionTemplate.TripleTitleDescriptionPairs,
            contents: [
                makeTitleContent('Card 1', 0),
                makeTitleContent('Card 2', 1),
                makeTitleContent('Card 3', 2),
                makeDescriptionContent(0, 'Desc 1'),
                makeDescriptionContent(1, 'Desc 2'),
                makeDescriptionContent(2, 'Desc 3'),
            ],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onCardDescriptionChange(0, 'Updated Desc 1');
        });

        const updated = getLastUpdatedSection(onSectionChange);
        const orderedDescs = updated.contents
            .filter((c: any) => c.contentType === ContentType.Description)
            .sort((a: any, b: any) => a.order - b.order);

        expect(orderedDescs[0].description).toBe('Updated Desc 1');
        expect(orderedDescs[1].description).toBe('Desc 2');
        expect(orderedDescs[2].description).toBe('Desc 3');
    });

    it('calls onDelete when Delete button is clicked', () => {
        const onDelete = jest.fn();
        renderForm({ isNewSection: false, onDelete } as any);

        fireEvent.click(screen.getByLabelText('Delete section'));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onRequestReplace when Replace button is clicked', () => {
        const onRequestReplace = jest.fn();
        renderForm({ isNewSection: false, onRequestReplace } as any);

        fireEvent.click(screen.getByLabelText('Replace section'));

        expect(onRequestReplace).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveUpSection when Move Up button is clicked', () => {
        const onMoveUpSection = jest.fn();

        renderForm({
            isFirstSection: false,
            isLastSection: false,
            onMoveUpSection,
        });

        fireEvent.click(screen.getByLabelText('Move up section'));

        expect(onMoveUpSection).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveDownSection when Move Down button is clicked', () => {
        const onMoveDownSection = jest.fn();

        renderForm({
            isFirstSection: false,
            isLastSection: false,
            onMoveDownSection,
        });

        fireEvent.click(screen.getByLabelText('Move down section'));

        expect(onMoveDownSection).toHaveBeenCalledTimes(1);
    });

    it('does not render Move Up button when section is first', () => {
        renderForm({
            isFirstSection: true,
            isLastSection: false,
        });

        expect(screen.queryByLabelText('Move up section')).not.toBeInTheDocument();
    });

    it('does not render Move Down button when section is last', () => {
        renderForm({
            isFirstSection: false,
            isLastSection: true,
        });

        expect(screen.queryByLabelText('Move down section')).not.toBeInTheDocument();
    });

    it('does not render move buttons when section is both first and last', () => {
        renderForm({
            isFirstSection: true,
            isLastSection: true,
        });

        expect(screen.queryByLabelText('Move up section')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Move down section')).not.toBeInTheDocument();
    });

    describe('FAQ template', () => {
        const makeFaqPairContent = (order: number, groupIndex: number, questionText: string, answerText: string) => ({
            contentType: ContentType.FaqQuestion,
            order,
            groupIndex,
            faqQuestion: {
                questionText,
                answerText,
            },
        });

        const makeFaqSection = (contents: any[]) =>
            makeSection({
                template: SectionTemplate.SingleTitleQuestionAnswerPairs,
                contents,
            });

        it('adds FAQ pair with correct structure', () => {
            const section = makeFaqSection([
                makeTitleContent('FAQ Title', 0),
                makeFaqPairContent(1, 0, 'Question 1', 'Answer 1'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onAddFaqPair('Question 2', 'Answer 2');
            });

            const updated = getLastUpdatedSection(onSectionChange);
            const faqPairs = updated.contents.filter((c: any) => c.contentType === ContentType.FaqQuestion);

            expect(faqPairs).toHaveLength(2);

            const newPair = faqPairs[1];
            expect(newPair.groupIndex).toBe(1);
            expect(newPair.faqQuestion!.questionText).toBe('Question 2');
            expect(newPair.faqQuestion!.answerText).toBe('Answer 2');
        });

        it('deletes FAQ pair and normalizes groupIndex', () => {
            const section = makeFaqSection([
                makeTitleContent('FAQ Title', 0),
                makeFaqPairContent(1, 0, 'Q1', 'A1'),
                makeFaqPairContent(2, 1, 'Q2', 'A2'),
                makeFaqPairContent(3, 2, 'Q3', 'A3'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onDeleteFaqPair(1);
            });

            const updated = getLastUpdatedSection(onSectionChange);
            const faqPairs = updated.contents
                .filter((c: any) => c.contentType === ContentType.FaqQuestion)
                .sort((a: any, b: any) => a.order - b.order);

            expect(faqPairs).toHaveLength(2);
            expect(faqPairs[0]!.faqQuestion!.questionText).toBe('Q1');
            expect(faqPairs[0].groupIndex).toBe(0);
            expect(faqPairs[1]!.faqQuestion!.questionText).toBe('Q3');
            expect(faqPairs[1].groupIndex).toBe(1);
        });

        it('updates FAQ question text', () => {
            const section = makeFaqSection([
                makeTitleContent('FAQ', 0),
                makeFaqPairContent(1, 0, 'Old Question', 'Answer'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onFaqQuestionChange(0, 'New Question');
            });

            const updated = getLastUpdatedSection(onSectionChange);
            const faqPair = updated.contents.find((c: any) => c.contentType === ContentType.FaqQuestion);

            expect(faqPair!.faqQuestion!.questionText).toBe('New Question');
            expect(faqPair!.faqQuestion!.answerText).toBe('Answer');
        });

        it('updates FAQ answer text', () => {
            const section = makeFaqSection([
                makeTitleContent('FAQ', 0),
                makeFaqPairContent(1, 0, 'Question', 'Old Answer'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onFaqAnswerChange(0, 'New Answer');
            });

            const updated = getLastUpdatedSection(onSectionChange);
            const faqPair = updated.contents.find((c: any) => c.contentType === ContentType.FaqQuestion);

            expect(faqPair!.faqQuestion!.questionText).toBe('Question');
            expect(faqPair!.faqQuestion!.answerText).toBe('New Answer');
        });
    });
});
