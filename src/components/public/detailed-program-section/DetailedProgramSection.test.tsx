import { render, screen } from '@testing-library/react';
import { DetailedProgramSection } from './DetailedProgramSection';
import { ProgramSection, ProgramSectionTemplate, ProgramSectionMode } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import * as renderProgramSectionModule from '@/utils/functions/render-program-section';

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: jest.fn(),
}));

const mockRenderProgramSection = renderProgramSectionModule.renderProgramSection as jest.MockedFunction<
    typeof renderProgramSectionModule.renderProgramSection
>;

describe('DetailedProgramSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRenderProgramSection.mockReturnValue(<div data-testid="rendered-section">Rendered Section</div>);
    });

    it('renders with title and description content', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.TextOnly,
            contents: [
                {
                    id: 1,
                    contentType: ContentType.Title,
                    title: 'Test Title',
                    order: 0,
                    description: null,
                    image: null,
                },
                {
                    id: 2,
                    contentType: ContentType.Description,
                    description: 'Test Description',
                    order: 1,
                    title: null,
                    image: null,
                },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.TextOnly,
            data: {
                title: 'Test Title',
                description: 'Test Description',
                images: [],
                descriptionAuthorPairs: [],
            },
            mode: ProgramSectionMode.Published,
        });
        expect(screen.getByTestId('rendered-section')).toBeInTheDocument();
    });

    it('handles missing title content', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.TextOnly,
            contents: [
                {
                    id: 1,
                    contentType: ContentType.Description,
                    description: 'Test Description',
                    order: 0,
                    title: null,
                    image: null,
                },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.TextOnly,
            data: {
                title: '',
                description: 'Test Description',
                images: [],
                descriptionAuthorPairs: [],
            },
            mode: ProgramSectionMode.Published,
        });
    });

    it('handles missing description content', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.TextOnly,
            contents: [
                {
                    id: 1,
                    contentType: ContentType.Title,
                    title: 'Test Title',
                    order: 0,
                    description: null,
                    image: null,
                },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.TextOnly,
            data: {
                title: 'Test Title',
                description: '',
                images: [],
                descriptionAuthorPairs: [],
            },
            mode: ProgramSectionMode.Published,
        });
    });

    it('extracts and sorts images by order', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.QuadImagesBottom,
            contents: [
                { id: 1, contentType: ContentType.Title, title: 'Title', order: 0, description: null, image: null },
                {
                    id: 2,
                    contentType: ContentType.Description,
                    description: 'Desc',
                    order: 1,
                    title: null,
                    image: null,
                },
                {
                    id: 3,
                    contentType: ContentType.Image,
                    image: { id: 10, url: 'img3.jpg', mimeType: 'image/jpeg' },
                    order: 5,
                    title: null,
                    description: null,
                },
                {
                    id: 4,
                    contentType: ContentType.Image,
                    image: { id: 11, url: 'img1.jpg', mimeType: 'image/jpeg' },
                    order: 2,
                    title: null,
                    description: null,
                },
                {
                    id: 5,
                    contentType: ContentType.Image,
                    image: { id: 12, url: 'img2.jpg', mimeType: 'image/jpeg' },
                    order: 3,
                    title: null,
                    description: null,
                },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.QuadImagesBottom,
            data: {
                title: 'Title',
                description: 'Desc',
                images: [
                    { id: 11, url: 'img1.jpg', mimeType: 'image/jpeg' },
                    { id: 12, url: 'img2.jpg', mimeType: 'image/jpeg' },
                    { id: 10, url: 'img3.jpg', mimeType: 'image/jpeg' },
                ],
                descriptionAuthorPairs: [],
            },
            mode: ProgramSectionMode.Published,
        });
    });

    it('handles image content with null image value', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.SingleImageTop,
            contents: [
                { id: 1, contentType: ContentType.Title, title: 'Title', order: 0, description: null, image: null },
                {
                    id: 2,
                    contentType: ContentType.Description,
                    description: 'Desc',
                    order: 1,
                    title: null,
                    image: null,
                },
                { id: 3, contentType: ContentType.Image, image: null, order: 2, title: null, description: null },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.SingleImageTop,
            data: {
                title: 'Title',
                description: 'Desc',
                images: [null],
                descriptionAuthorPairs: [],
            },
            mode: ProgramSectionMode.Published,
        });
    });

    it('passes correct template to renderProgramSection', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.DualImagesBottom,
            contents: [],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.DualImagesBottom,
            data: {
                title: '',
                description: '',
                images: [],
                descriptionAuthorPairs: [],
            },
            mode: ProgramSectionMode.Published,
        });
    });

    it('extracts description-author pairs by group index and passes them sorted', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
            contents: [
                {
                    id: 1,
                    contentType: ContentType.Description,
                    description: 'Desc 2',
                    order: 5,
                    groupIndex: 2,
                    title: null,
                    image: null,
                },
                {
                    id: 2,
                    contentType: ContentType.Author,
                    author: 'Author 2',
                    order: 6,
                    groupIndex: 2,
                    title: null,
                    description: null,
                    image: null,
                },
                {
                    id: 3,
                    contentType: ContentType.Author,
                    author: 'Author 1',
                    order: 3,
                    groupIndex: 1,
                    title: null,
                    description: null,
                    image: null,
                },
                {
                    id: 4,
                    contentType: ContentType.Description,
                    description: null,
                    order: 2,
                    groupIndex: 1,
                    title: null,
                    image: null,
                },
                {
                    id: 5,
                    contentType: ContentType.Description,
                    description: 'Ignored no group',
                    order: 7,
                    groupIndex: null,
                    title: null,
                    image: null,
                },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs,
            data: {
                title: '',
                description: 'Desc 2',
                images: [],
                descriptionAuthorPairs: [
                    { description: '', author: 'Author 1' },
                    { description: 'Desc 2', author: 'Author 2' },
                ],
            },
            mode: ProgramSectionMode.Published,
        });
    });

    it('always passes Published mode to renderProgramSection', () => {
        const section: ProgramSection = {
            id: 1,
            template: ProgramSectionTemplate.TextOnly,
            contents: [],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        const callArgs = mockRenderProgramSection.mock.calls[0][0];
        expect(callArgs.mode).toBe(ProgramSectionMode.Published);
    });
});
