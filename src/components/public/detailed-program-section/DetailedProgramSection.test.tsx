import { render, screen } from '@testing-library/react';
import { DetailedProgramSection } from './DetailedProgramSection';
import {
    HippotherapyProgramSectionDto,
    ProgramSectionTemplate,
    ProgramSectionMode,
} from '@/types/common/program-sections';
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
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: ['Test Description'],
                images: [],
                cards: [{ title: 'Test Title', description: 'Test Description' }],
                descriptionAuthorPairs: [],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
        expect(screen.getByTestId('rendered-section')).toBeInTheDocument();
    });

    it('handles missing title content', () => {
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: ['Test Description'],
                images: [],
                cards: [],
                descriptionAuthorPairs: [],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('handles missing description content', () => {
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: [],
                images: [],
                cards: [{ title: 'Test Title', description: '' }],
                descriptionAuthorPairs: [],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('extracts and sorts images by order', () => {
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: ['Desc'],
                images: [
                    { id: 11, url: 'img1.jpg', mimeType: 'image/jpeg' },
                    { id: 12, url: 'img2.jpg', mimeType: 'image/jpeg' },
                    { id: 10, url: 'img3.jpg', mimeType: 'image/jpeg' },
                ],
                cards: [{ title: 'Title', description: 'Desc' }],
                descriptionAuthorPairs: [],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('handles image content with null image value', () => {
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: ['Desc'],
                images: [null],
                cards: [{ title: 'Title', description: 'Desc' }],
                descriptionAuthorPairs: [],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('passes correct template to renderProgramSection', () => {
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: [],
                images: [],
                cards: [],
                descriptionAuthorPairs: [],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('extracts description-author pairs by group index and passes them sorted', () => {
        const section: HippotherapyProgramSectionDto = {
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
                descriptions: ['', 'Desc 2', 'Ignored no group'],
                images: [],
                cards: [],
                descriptionAuthorPairs: [
                    { description: '', author: 'Author 1' },
                    { description: 'Desc 2', author: 'Author 2' },
                ],
                faqQuestions: [],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('extracts and sorts faqQuestions from section contents', () => {
        const section: HippotherapyProgramSectionDto = {
            id: 1,
            template: ProgramSectionTemplate.SingleTitleQuestionAnswerPairs,
            contents: [
                {
                    id: 1,
                    contentType: ContentType.Title,
                    title: 'FAQ Title',
                    order: 0,
                    description: null,
                    image: null,
                },
                {
                    id: 2,
                    contentType: ContentType.FaqQuestion,
                    order: 3,
                    title: null,
                    description: null,
                    image: null,
                    faqQuestion: {
                        id: 10,
                        questionText: 'Question B',
                        answerText: 'Answer B',
                        status: 1,
                        pages: [],
                        localizations: [],
                    },
                },
                {
                    id: 3,
                    contentType: ContentType.FaqQuestion,
                    order: 1,
                    title: null,
                    description: null,
                    image: null,
                    faqQuestion: {
                        id: 11,
                        questionText: 'Question A',
                        answerText: 'Answer A',
                        status: 1,
                        pages: [],
                        localizations: [],
                    },
                },
                {
                    id: 4,
                    contentType: ContentType.FaqQuestion,
                    order: 2,
                    title: null,
                    description: null,
                    image: null,
                    faqQuestion: null,
                },
            ],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        expect(mockRenderProgramSection).toHaveBeenCalledWith({
            templateId: ProgramSectionTemplate.SingleTitleQuestionAnswerPairs,
            data: {
                title: 'FAQ Title',
                description: '',
                descriptions: [],
                images: [],
                cards: [{ title: 'FAQ Title', description: '' }],
                descriptionAuthorPairs: [],
                faqQuestions: [
                    {
                        id: 11,
                        questionText: 'Question A',
                        answerText: 'Answer A',
                        status: 1,
                        pages: [],
                        localizations: [],
                    },
                    {
                        id: 10,
                        questionText: 'Question B',
                        answerText: 'Answer B',
                        status: 1,
                        pages: [],
                        localizations: [],
                    },
                ],
            },
            mode: ProgramSectionMode.View,
        });
    });

    it('always passes Published mode to renderProgramSection', () => {
        const section: HippotherapyProgramSectionDto = {
            id: 1,
            template: ProgramSectionTemplate.TextOnly,
            contents: [],
            order: 0,
        };

        render(<DetailedProgramSection section={section} />);

        const callArgs = mockRenderProgramSection.mock.calls[0][0];
        expect(callArgs.mode).toBe(ProgramSectionMode.View);
    });
});
