import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramSectionForm, ProgramSectionFormProps } from './ProgramSectionForm';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType, ProgramSection } from '@/types/admin/programs';

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: jest.fn(() => <div data-testid="editable-section" />),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => <button {...props}>{props.children}</button>,
}));

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
        { contentType: ContentType.Description, order: 1, title: null, description: 'Desc', image: null },
        { contentType: ContentType.Image, order: 2, title: null, description: null, image: mockImage('img1', 'img1') },
        { contentType: ContentType.Image, order: 3, title: null, description: null, image: mockImage('img2', 'img2') },
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
    });

    it('renders editable section', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        renderProgramSection.mockReturnValue(<div data-testid="editable-section" />);
        render(<ProgramSectionForm {...defaultProps} />);
        expect(screen.getByTestId('editable-section')).toBeInTheDocument();
    });

    it('renders template info if editableSection is null', () => {
        jest.spyOn(require('@/utils/functions/render-program-section'), 'renderProgramSection').mockReturnValueOnce(
            null,
        );
        render(<ProgramSectionForm {...defaultProps} />);
        expect(screen.getByText(/Template ID:/)).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        renderProgramSection.mockReturnValue(<div data-testid="editable-section" />);
        render(<ProgramSectionForm {...defaultProps} />);
        fireEvent.click(screen.getByText('Відмінити'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('save button is always disabled', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        renderProgramSection.mockReturnValue(<div data-testid="editable-section" />);
        render(<ProgramSectionForm {...defaultProps} />);
        expect(screen.getByText('Зберегти')).toBeDisabled();
    });

    it('cancel button is disabled when isDisabled is true', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        renderProgramSection.mockReturnValue(<div data-testid="editable-section" />);
        render(<ProgramSectionForm {...defaultProps} isDisabled={true} />);
        expect(screen.getByText('Відмінити')).toBeDisabled();
    });

    it('defaults isDisabled to false when omitted', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        renderProgramSection.mockReturnValue(<div data-testid="editable-section" />);

        const { isDisabled: _isDisabled, ...propsWithoutIsDisabled } = defaultProps;
        render(<ProgramSectionForm {...propsWithoutIsDisabled} />);

        expect(screen.getByText('Відмінити')).not.toBeDisabled();
    });

    it('passes normalized title/description and images into renderProgramSection (branch coverage)', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        renderProgramSection.mockReturnValue(<div data-testid="editable-section" />);

        const section = makeSection({
            template: ProgramSectionTemplate.TextOnly,
            contents: [
                { contentType: ContentType.Title, order: 0, title: null, description: null, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: undefined, image: null },
                {
                    contentType: ContentType.Image,
                    order: 2,
                    title: null,
                    description: null,
                    image: mockImage('img1', 'img1-url'),
                },
                {
                    contentType: ContentType.Image,
                    order: 3,
                    title: null,
                    description: null,
                    image: { id: 'no-url' } as any,
                },
                { contentType: ContentType.Image, order: 4, title: null, description: null, image: null },
            ],
        });

        render(<ProgramSectionForm {...defaultProps} section={section} onSectionChange={jest.fn()} />);

        expect(renderProgramSection).toHaveBeenCalledTimes(1);
        const callArg = renderProgramSection.mock.calls[0][0];

        expect(callArg.templateId).toBe(section.template);
        expect(callArg.isEditable).toBe(true);
        expect(callArg.data).toEqual({
            title: '',
            description: '',
            images: ['img1-url', '', ''],
        });

        expect(callArg.handlers).toEqual({
            onTitleChange: expect.any(Function),
            onDescriptionChange: expect.any(Function),
            onImagesChange: expect.any(Function),
        });
    });

    it('calls onSectionChange when title changes', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        let handler: any;
        renderProgramSection.mockImplementation(({ handlers }: any) => {
            handler = handlers.onTitleChange;
            return <div data-testid="editable-section" />;
        });
        render(<ProgramSectionForm {...defaultProps} />);
        handler('New Title');
        expect(defaultProps.onSectionChange).toHaveBeenCalled();
    });

    it('calls onSectionChange when description changes', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        let handler: any;
        renderProgramSection.mockImplementation(({ handlers }: any) => {
            handler = handlers.onDescriptionChange;
            return <div data-testid="editable-section" />;
        });
        render(<ProgramSectionForm {...defaultProps} />);
        handler('New Desc');
        expect(defaultProps.onSectionChange).toHaveBeenCalled();
    });

    it('calls onSectionChange when image changes', () => {
        const { renderProgramSection } = require('@/utils/functions/render-program-section');
        let handler: any;
        renderProgramSection.mockImplementation(({ handlers }: any) => {
            handler = handlers.onImagesChange;
            return <div data-testid="editable-section" />;
        });
        render(<ProgramSectionForm {...defaultProps} />);
        handler(0, { id: 'newimg', url: 'newimg', mimeType: 'image/png' });
        expect(defaultProps.onSectionChange).toHaveBeenCalled();
    });
});
