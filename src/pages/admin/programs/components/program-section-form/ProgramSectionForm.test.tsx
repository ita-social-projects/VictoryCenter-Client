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
        };
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
        renderForm();
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL));
        expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('save button is always disabled', () => {
        renderForm();
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.SAVE)).toBeDisabled();
    });

    it('cancel button is disabled when isDisabled is true', () => {
        renderForm({ isDisabled: true });
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL)).toBeDisabled();
    });

    it('defaults isDisabled to false when omitted', () => {
        const { isDisabled: _omit, ...propsWithoutIsDisabled } = baseProps;
        render(<ProgramSectionForm {...propsWithoutIsDisabled} />);
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CANCEL)).not.toBeDisabled();
    });

    it('passes normalized title/description/descriptions/images and handlers into renderProgramSection', () => {
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

        renderForm({ section });

        expect(renderProgramSectionMock).toHaveBeenCalledTimes(1);

        const callPayload = renderProgramSectionMock.mock.calls[0][0];

        expect(callPayload.templateId).toBe(section.template);
        expect(callPayload.mode).toBe(ProgramSectionMode.Edit);

        expect(callPayload.data).toEqual({
            title: '',
            description: 'D-1',
            descriptions: ['D-1', ''],
            images: [{ id: 'img1', url: 'img1-url', mimeType: 'image/png' }, { id: 'no-url' }, null],
        });

        expect(callPayload.handlers).toEqual({
            onTitleChange: expect.any(Function),
            onDescriptionChange: expect.any(Function),
            onDescriptionsChange: expect.any(Function),
            onImagesChange: expect.any(Function),
        });
    });

    it('calls onSectionChange with updated title when onTitleChange is invoked', () => {
        const section = makeSection();
        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onTitleChange('New Title');
        });

        expect(onSectionChange).toHaveBeenCalledTimes(1);

        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;
        const title = updated.contents.find((c) => c.contentType === ContentType.Title);
        expect(title?.title).toBe('New Title');
    });

    it('calls onSectionChange and updates all descriptions when onDescriptionChange is invoked', () => {
        const section = makeSection({
            contents: [makeTitleContent('T', 0), makeDescriptionContent(1, 'A'), makeDescriptionContent(2, 'B')],
        });

        const { handlers, onSectionChange } = renderWithHandlers({ section });

        act(() => {
            handlers.onDescriptionChange('NEW');
        });

        expect(onSectionChange).toHaveBeenCalledTimes(1);

        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;
        const descs = updated.contents.filter((c) => c.contentType === ContentType.Description);
        expect(descs.map((d) => d.description)).toEqual(['NEW', 'NEW']);
    });

    it('calls onSectionChange and updates only targeted description when onDescriptionsChange is invoked', () => {
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

        expect(onSectionChange).toHaveBeenCalledTimes(1);

        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;
        const ordered = updated.contents
            .filter((c) => c.contentType === ContentType.Description)
            .sort((a, b) => a.order - b.order);

        expect(ordered.map((d) => d.description)).toEqual(['D10', 'UPDATED', 'D30']);
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

    it('calls onSectionChange and updates correct image by index when onImagesChange is invoked', () => {
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

        expect(onSectionChange).toHaveBeenCalledTimes(1);

        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;
        const orderedImages = updated.contents
            .filter((c) => c.contentType === ContentType.Image)
            .sort((a, b) => a.order - b.order);

        expect(orderedImages[0].image).toEqual(newFile);
        expect((orderedImages[1].image as any).url).toBe('A');
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
});
