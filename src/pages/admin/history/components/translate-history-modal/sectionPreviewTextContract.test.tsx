import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HISTORY_SUPPORTED_TEMPLATES, renderHistorySection } from '@/utils/functions/render-history-section';
import { SectionMode } from '@/types/common/sections';

// TranslateHistoryModal.module.scss hides `.section-preview [data-section-text]` to keep only the
// images in the preview. Fails if an image template ships without that marker (blank gap otherwise).
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
