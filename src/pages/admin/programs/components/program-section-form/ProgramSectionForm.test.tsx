import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ProgramSectionForm } from './ProgramSectionForm';
import type { ProgramSectionFormProps } from './ProgramSectionForm';
import type { ProgramSection } from '@/types/common/program-sections';
import { ProgramSectionTemplate, ProgramSectionMode } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: jest.fn(() => <div data-testid="editable-section" />),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ buttonStyle: _buttonStyle, ...props }: any) => <button {...props}>{props.children}</button>,
}));

const renderProgramSectionMock = renderProgramSection as unknown as jest.Mock;

const makeImage = (id: string, url?: string): any =>
    url
        ? { id, url, mimeType: 'image/png' }
        : {
              id,
          };

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

const makeSection = (overrides?: Partial<ProgramSection>): ProgramSection => ({
    template: ProgramSectionTemplate.TextOnly,
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

const getUpdatedSection = (onSectionChange: jest.Mock) => onSectionChange.mock.calls[0][0] as ProgramSection;

const getContentsBy = (s: ProgramSection, type: ContentType) => s.contents.filter((c: any) => c.contentType === type);

const getContentByGroupAndType = (s: ProgramSection, groupIndex: number, type: ContentType) =>
    s.contents.find((c: any) => c.groupIndex === groupIndex && c.contentType === type);

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
        renderProgramSectionMock.mockReturnValue(<div data-testid="editable-section" />);
        baseProps = {
            section: makeSection(),
            onSave: jest.fn(),
            onCancel: jest.fn(),
            isDisabled: false,
            onSectionChange: jest.fn(),
            isNewSection: false,
            isSectionValid: false,
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

    it('save button is disabled when isSectionValid is false', () => {
        renderForm({ isNewSection: true, isSectionValid: false });
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE)).toBeDisabled();
    });

    it('cancel button is disabled when isDisabled is true', () => {
        renderForm({ isDisabled: true, isNewSection: true });
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL)).toBeDisabled();
    });

    it('defaults isDisabled to false when omitted', () => {
        const { isDisabled: _omit, ...propsWithoutIsDisabled } = baseProps as any;
        render(<ProgramSectionForm {...propsWithoutIsDisabled} isNewSection={true} isSectionValid={false} />);
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL)).not.toBeDisabled();
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
        expect(callPayload.mode).toBe(ProgramSectionMode.View);

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

        const updated = getUpdatedSection(onSectionChange);
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

        const updated = getUpdatedSection(onSectionChange);
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

        const updated = getUpdatedSection(onSectionChange);
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

        const updated = getUpdatedSection(onSectionChange);
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
                template: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
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

            const updated = getUpdatedSection(onSectionChange);
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

            const updated = getUpdatedSection(onSectionChange);
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

        it('adds a pair with next groupIndex', () => {
            const section = makePairsSection([
                makeTitleContent('T', 0),
                makePairDescription(1, 0, 'D0'),
                makePairAuthor(2, 0, 'A0'),
                makePairDescription(3, 2, 'D2'),
                makePairAuthor(4, 2, 'A2'),
            ]);

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onAddPair();
            });

            const updated = getUpdatedSection(onSectionChange);
            const newDesc = getContentByGroupAndType(updated, 3, ContentType.Description) as any;
            const newAuth = getContentByGroupAndType(updated, 3, ContentType.Author) as any;

            expect(newDesc).toBeTruthy();
            expect(newAuth).toBeTruthy();
        });

        it('adds first pair with groupIndex 0 when no groupIndex exists', () => {
            const section = makePairsSection([makeTitleContent('T', 0), makeDescriptionContent(1, 'D')]);
            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onAddPair();
            });

            const updated = getUpdatedSection(onSectionChange);
            expect(getContentByGroupAndType(updated, 0, ContentType.Description)).toBeTruthy();
        });

        it('adds pair with orders 0 and 1 when section has no contents', () => {
            const section = makeSection({
                template: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
                contents: [],
            });

            const { handlers, onSectionChange } = renderWithHandlers({ section });

            act(() => {
                handlers.onAddPair();
            });

            const updated = getUpdatedSection(onSectionChange);
            const orders = updated.contents.map((c: any) => c.order).sort((a: number, b: number) => a - b);

            expect(orders).toEqual([0, 1]);
        });

        it('deletes pair by index', () => {
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

            const updated = getUpdatedSection(onSectionChange);
            const stillHas0 = updated.contents.some((c: any) => c.groupIndex === 0);
            expect(stillHas0).toBe(false);
        });

        it('does nothing when delete index is out of range', () => {
            const section = makePairsSection([makeTitleContent('T', 0), makePairDescription(1, 0, 'D0')]);
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
            expect(screen.queryByText(PROGRAMS_TEXT.BUTTON.CANCEL)).not.toBeInTheDocument();
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
            renderForm({ isNewSection: false, onEditStateChange });

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

    it('calls onSectionChange and updates card title when onCardTitleChange is invoked', () => {
        const section = makeSection({
            template: ProgramSectionTemplate.DualTitleDescription,
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

        expect(onSectionChange).toHaveBeenCalledTimes(1);

        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;
        const orderedTitles = updated.contents
            .filter((c) => c.contentType === ContentType.Title)
            .sort((a, b) => a.order - b.order);

        expect(orderedTitles[0].title).toBe('Card 1 Title');
        expect(orderedTitles[1].title).toBe('Updated Card 2 Title');
    });

    it('calls onSectionChange and updates card description when onCardDescriptionChange is invoked', () => {
        const section = makeSection({
            template: ProgramSectionTemplate.TripleTitleDescription,
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

        expect(onSectionChange).toHaveBeenCalledTimes(1);

        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;
        const orderedDescs = updated.contents
            .filter((c) => c.contentType === ContentType.Description)
            .sort((a, b) => a.order - b.order);

        expect(orderedDescs[0].description).toBe('Updated Desc 1');
        expect(orderedDescs[1].description).toBe('Desc 2');
        expect(orderedDescs[2].description).toBe('Desc 3');
    });

    it('calls onDelete when Delete button is clicked', () => {
        const onDelete = jest.fn();
        renderForm({ isNewSection: false, onDelete });

        fireEvent.click(screen.getByLabelText('Delete section'));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onRequestReplace when Replace button is clicked', () => {
        const onRequestReplace = jest.fn();
        renderForm({ isNewSection: false, onRequestReplace });

        fireEvent.click(screen.getByLabelText('Replace section'));

        expect(onRequestReplace).toHaveBeenCalledTimes(1);
    });
});
