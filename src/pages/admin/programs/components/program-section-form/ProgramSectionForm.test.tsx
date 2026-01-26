import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProgramSectionForm, ProgramSectionFormProps } from './ProgramSectionForm';
import { ProgramSection, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: jest.fn(() => <div data-testid="editable-section" />),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ buttonStyle: _buttonStyle, ...props }: any) => <button {...props}>{props.children}</button>,
}));

const renderProgramSectionMock = renderProgramSection as unknown as jest.Mock;

const mockImage = (id: string, url: string): any => ({
    id,
    url,
    mimeType: 'image/png',
});

const makeSection = (overrides?: Partial<ProgramSection>): ProgramSection => ({
    template: ProgramSectionTemplate.TextOnly,
    order: 0,
    contents: [
        { contentType: ContentType.Title, order: 0, title: 'Title', description: null, image: null },
        { contentType: ContentType.Description, order: 1, title: null, description: 'Desc-1', image: null },
        { contentType: ContentType.Description, order: 2, title: null, description: 'Desc-2', image: null },
        {
            contentType: ContentType.Image,
            order: 3,
            title: null,
            description: null,
            image: mockImage('img1', 'img1-url'),
        },
        { contentType: ContentType.Image, order: 4, title: null, description: null, image: { id: 'no-url' } as any },
        { contentType: ContentType.Image, order: 5, title: null, description: null, image: null },
    ],
    ...overrides,
});

const defaultProps: ProgramSectionFormProps = {
    section: makeSection(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    isDisabled: false,
    onSectionChange: jest.fn(),
};

describe('ProgramSectionForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        renderProgramSectionMock.mockReturnValue(<div data-testid="editable-section" />);
    });

    it('renders editable section', () => {
        render(<ProgramSectionForm {...defaultProps} />);
        expect(screen.getByTestId('editable-section')).toBeInTheDocument();
    });

    it('renders template info if editableSection is null', () => {
        renderProgramSectionMock.mockReturnValueOnce(null);
        render(<ProgramSectionForm {...defaultProps} />);
        expect(screen.getByText(/Template ID:/)).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<ProgramSectionForm {...defaultProps} />);
        fireEvent.click(screen.getByText('Відмінити'));
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('save button is always disabled', () => {
        render(<ProgramSectionForm {...defaultProps} />);
        expect(screen.getByText('Зберегти')).toBeDisabled();
    });

    it('cancel button is disabled when isDisabled is true', () => {
        render(<ProgramSectionForm {...defaultProps} isDisabled={true} />);
        expect(screen.getByText('Відмінити')).toBeDisabled();
    });

    it('defaults isDisabled to false when omitted', () => {
        const { isDisabled: _isDisabled, ...propsWithoutIsDisabled } = defaultProps;
        render(<ProgramSectionForm {...propsWithoutIsDisabled} />);
        expect(screen.getByText('Відмінити')).not.toBeDisabled();
    });

    it('passes normalized title/description/descriptions/images and handlers into renderProgramSection', () => {
        const section = makeSection({
            contents: [
                { contentType: ContentType.Title, order: 0, title: null, description: null, image: null },
                { contentType: ContentType.Description, order: 2, title: null, description: undefined, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: 'D-1', image: null },
                {
                    contentType: ContentType.Image,
                    order: 3,
                    title: null,
                    description: null,
                    image: mockImage('img1', 'img1-url'),
                },
                {
                    contentType: ContentType.Image,
                    order: 4,
                    title: null,
                    description: null,
                    image: { id: 'no-url' } as any,
                },
                { contentType: ContentType.Image, order: 5, title: null, description: null, image: null },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} />);

        expect(renderProgramSectionMock).toHaveBeenCalledTimes(1);
        const arg = renderProgramSectionMock.mock.calls[0][0];

        expect(arg.templateId).toBe(section.template);
        expect(arg.isEditable).toBe(true);

        expect(arg.data).toEqual({
            title: '',
            description: 'D-1',
            descriptions: ['D-1', ''],
            images: ['img1-url', '', ''],
        });

        expect(arg.handlers).toEqual({
            onTitleChange: expect.any(Function),
            onDescriptionChange: expect.any(Function),
            onDescriptionsChange: expect.any(Function),
            onImagesChange: expect.any(Function),
        });
    });

    it('calls onSectionChange with updated title when onTitleChange is invoked', () => {
        let handlers: any;

        renderProgramSectionMock.mockImplementation((args: any) => {
            handlers = args.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = jest.fn();
        const section = makeSection();

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={onSectionChange} />);

        act(() => {
            handlers.onTitleChange('New Title');
        });

        expect(onSectionChange).toHaveBeenCalledTimes(1);
        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;

        const title = updated.contents.find((c) => c.contentType === ContentType.Title);
        expect(title?.title).toBe('New Title');
    });

    it('calls onSectionChange and updates all descriptions when onDescriptionChange is invoked', () => {
        let handlers: any;

        renderProgramSectionMock.mockImplementation((args: any) => {
            handlers = args.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = jest.fn();
        const section = makeSection({
            contents: [
                { contentType: ContentType.Title, order: 0, title: 'T', description: null, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: 'A', image: null },
                { contentType: ContentType.Description, order: 2, title: null, description: 'B', image: null },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={onSectionChange} />);

        act(() => {
            handlers.onDescriptionChange('NEW');
        });

        expect(onSectionChange).toHaveBeenCalledTimes(1);
        const updated = onSectionChange.mock.calls[0][0] as ProgramSection;

        const descs = updated.contents.filter((c) => c.contentType === ContentType.Description);
        expect(descs.map((d) => d.description)).toEqual(['NEW', 'NEW']);
    });

    it('calls onSectionChange and updates only targeted description when onDescriptionsChange is invoked', () => {
        let handlers: any;

        renderProgramSectionMock.mockImplementation((args: any) => {
            handlers = args.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = jest.fn();
        const section = makeSection({
            contents: [
                { contentType: ContentType.Title, order: 0, title: 'T', description: null, image: null },
                { contentType: ContentType.Description, order: 10, title: null, description: 'D10', image: null },
                { contentType: ContentType.Description, order: 20, title: null, description: 'D20', image: null },
                { contentType: ContentType.Description, order: 30, title: null, description: 'D30', image: null },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={onSectionChange} />);

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
        let handlers: any;

        renderProgramSectionMock.mockImplementation((args: any) => {
            handlers = args.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = jest.fn();
        const section = makeSection({
            contents: [
                { contentType: ContentType.Title, order: 0, title: 'T', description: null, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: 'D1', image: null },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={onSectionChange} />);

        act(() => {
            handlers.onDescriptionsChange(5, 'NOPE');
        });

        expect(onSectionChange).not.toHaveBeenCalled();
    });

    it('calls onSectionChange and updates correct image by index when onImagesChange is invoked', () => {
        let handlers: any;

        renderProgramSectionMock.mockImplementation((args: any) => {
            handlers = args.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = jest.fn();
        const section = makeSection({
            contents: [
                { contentType: ContentType.Title, order: 0, title: 'T', description: null, image: null },
                {
                    contentType: ContentType.Image,
                    order: 2,
                    title: null,
                    description: null,
                    image: mockImage('a', 'A'),
                },
                {
                    contentType: ContentType.Image,
                    order: 1,
                    title: null,
                    description: null,
                    image: mockImage('b', 'B'),
                },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={onSectionChange} />);

        const newFile = { id: 'new', url: 'NEW', mimeType: 'image/png' } as any;

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
        let handlers: any;

        renderProgramSectionMock.mockImplementation((args: any) => {
            handlers = args.handlers;
            return <div data-testid="editable-section" />;
        });

        const onSectionChange = jest.fn();
        const section = makeSection({
            contents: [
                { contentType: ContentType.Title, order: 0, title: 'T', description: null, image: null },
                {
                    contentType: ContentType.Image,
                    order: 1,
                    title: null,
                    description: null,
                    image: mockImage('a', 'A'),
                },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={onSectionChange} />);

        act(() => {
            handlers.onImagesChange(5, null);
        });

        expect(onSectionChange).not.toHaveBeenCalled();
    });
});
