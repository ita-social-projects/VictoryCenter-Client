import { Image, ImageValues } from '@/types/common/image';
import { HistorySectionContentDto, HistorySectionDto } from '@/types/common/history-sections';
import { ContentType } from '@/types/common/section-contents';
import { getInitialHistorySectionContents } from '@/utils/functions/render-history-section';

export const getOrderedHistoryContentsByType = (
    contents: HistorySectionContentDto[],
    type: ContentType,
): HistorySectionContentDto[] => {
    return contents.filter((content) => content.contentType === type).sort((a, b) => a.order - b.order);
};

export const getExpectedHistoryImageCount = (section: HistorySectionDto): number => {
    return getInitialHistorySectionContents(section.template).filter(
        (content) => content.contentType === ContentType.Image,
    ).length;
};

export interface HistorySectionFieldData {
    title: string;
    description: string;
    images: (Image | ImageValues | null)[];
}

export const getHistorySectionData = (section: HistorySectionDto): HistorySectionFieldData => {
    const title = getOrderedHistoryContentsByType(section.contents, ContentType.Title)[0]?.title ?? '';
    const description =
        getOrderedHistoryContentsByType(section.contents, ContentType.Description)[0]?.description ?? '';

    const images = getOrderedHistoryContentsByType(section.contents, ContentType.Image).map(
        (content) => content.image ?? null,
    );

    // Pad with nulls up to the template's image count so each index maps to a fixed template slot.
    const expectedImageCount = getExpectedHistoryImageCount(section);
    while (images.length < expectedImageCount) {
        images.push(null);
    }

    return {
        title,
        description,
        images,
    };
};
