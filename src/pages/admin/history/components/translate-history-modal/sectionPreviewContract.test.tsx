import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    getInitialHistorySectionContents,
    HISTORY_SUPPORTED_TEMPLATES,
    renderHistorySection,
} from '@/utils/functions/render-history-section';
import { ContentType } from '@/types/common/section-contents';
import { SectionMode } from '@/types/common/sections';
import { Image } from '@/types/common/image';
import { getHistoryImagePosition } from './TranslateHistoryModal';

const sampleImage: Image = { id: 1, url: 'sample.jpg', mimeType: 'image/jpeg' };

const IMAGE_TEMPLATES = HISTORY_SUPPORTED_TEMPLATES.filter((templateId) =>
    getInitialHistorySectionContents(templateId).some((content) => content.contentType === ContentType.Image),
);

// The modal CSS hides `[data-section-text]` in the preview — a template missing it shows a blank gap.
describe('history section preview: [data-section-text] contract', () => {
    it.each(HISTORY_SUPPORTED_TEMPLATES)(
        'template %s exposes a [data-section-text] block the translation preview can hide',
        (templateId) => {
            const view = renderHistorySection({
                templateId,
                mode: SectionMode.View,
                data: { title: '', description: '', images: [] },
            });

            expect(view).not.toBeNull();

            const { container } = render(view!);

            expect(container.querySelector('[data-section-text]')).toBeInTheDocument();
        },
    );
});

describe('history section preview: image position matches template render order', () => {
    it.each(IMAGE_TEMPLATES)('template %s render order agrees with its configured image position', (templateId) => {
        const view = renderHistorySection({
            templateId,
            mode: SectionMode.View,
            data: { title: 't', description: 'd', images: [sampleImage, sampleImage, sampleImage, sampleImage] },
        });

        const { container } = render(view!);
        const textBlock = container.querySelector('[data-section-text]')!;
        const firstImage = container.querySelector('img')!;

        const imageRendersBeforeText = Boolean(
            textBlock.compareDocumentPosition(firstImage) & Node.DOCUMENT_POSITION_PRECEDING,
        );

        // Only 'top' renders the image before the text; 'bottom' and 'right' render it after.
        expect(imageRendersBeforeText).toBe(getHistoryImagePosition(templateId) === 'top');
    });
});
