import {
    getExpectedHistoryImageCount,
    getHistorySectionData,
    getOrderedHistoryContentsByType,
} from './historySectionData';
import { HistorySectionContentDto, HistorySectionDto } from '@/types/common/history-sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { Image } from '@/types/common/image';

const image = (id: number): Image => ({ id, url: `img-${id}`, mimeType: 'image/jpeg' });

const content = (overrides: Partial<HistorySectionContentDto>): HistorySectionContentDto => ({
    contentType: ContentType.Image,
    order: 0,
    localizations: [],
    ...overrides,
});

describe('getOrderedHistoryContentsByType', () => {
    it('filters by content type and sorts by order', () => {
        const contents: HistorySectionContentDto[] = [
            content({ contentType: ContentType.Image, order: 3, image: image(3) }),
            content({ contentType: ContentType.Title, order: 0, title: 'title' }),
            content({ contentType: ContentType.Image, order: 1, image: image(1) }),
            content({ contentType: ContentType.Image, order: 2, image: image(2) }),
        ];

        const images = getOrderedHistoryContentsByType(contents, ContentType.Image);

        expect(images.map((c) => c.order)).toEqual([1, 2, 3]);
        expect(images.map((c) => c.image)).toEqual([image(1), image(2), image(3)]);
    });
});

describe('getExpectedHistoryImageCount', () => {
    it.each([
        [SectionTemplate.TextOnly, 0],
        [SectionTemplate.SingleImageTop, 1],
        [SectionTemplate.DualImagesBottom, 2],
        [SectionTemplate.TripleImagesBottom, 3],
        [SectionTemplate.QuadImagesBottom, 4],
    ])('returns the image slot count for template %s', (template, expected) => {
        expect(getExpectedHistoryImageCount({ template, order: 0, contents: [] })).toBe(expected);
    });
});

describe('getHistorySectionData', () => {
    it('orders images by their order field regardless of the contents array order', () => {
        const section: HistorySectionDto = {
            id: 1,
            template: SectionTemplate.QuadImagesBottom,
            order: 0,
            contents: [
                content({ contentType: ContentType.Image, order: 5, image: image(20) }),
                content({ contentType: ContentType.Description, order: 1, description: 'desc' }),
                content({ contentType: ContentType.Image, order: 2, image: image(10) }),
                content({ contentType: ContentType.Title, order: 0, title: 'title' }),
                content({ contentType: ContentType.Image, order: 4, image: image(15) }),
                content({ contentType: ContentType.Image, order: 3, image: image(12) }),
            ],
        };

        expect(getHistorySectionData(section)).toEqual({
            title: 'title',
            description: 'desc',
            images: [image(10), image(12), image(15), image(20)],
        });
    });

    it('pads the images array with nulls up to the template image count', () => {
        const section: HistorySectionDto = {
            template: SectionTemplate.QuadImagesBottom,
            order: 0,
            contents: [
                content({ contentType: ContentType.Title, order: 0, title: 't' }),
                content({ contentType: ContentType.Description, order: 1, description: 'd' }),
                content({ contentType: ContentType.Image, order: 2, image: image(1) }),
            ],
        };

        expect(getHistorySectionData(section).images).toEqual([image(1), null, null, null]);
    });

    it('falls back to empty strings when title/description contents are missing', () => {
        const section: HistorySectionDto = {
            template: SectionTemplate.SingleImageBottom,
            order: 0,
            contents: [content({ contentType: ContentType.Image, order: 2, image: image(1) })],
        };

        expect(getHistorySectionData(section)).toEqual({
            title: '',
            description: '',
            images: [image(1)],
        });
    });

    it('maps an image content with no image value to null', () => {
        const section: HistorySectionDto = {
            template: SectionTemplate.DualImagesBottom,
            order: 0,
            contents: [
                content({ contentType: ContentType.Image, order: 2 }),
                content({ contentType: ContentType.Image, order: 3, image: image(1) }),
            ],
        };

        expect(getHistorySectionData(section).images).toEqual([null, image(1)]);
    });
});
