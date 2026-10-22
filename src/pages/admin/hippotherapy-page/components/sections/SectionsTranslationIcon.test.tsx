import { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EthicsSection } from './ethics-section/EthicsSection';
import { GallerySection } from './gallery-section/GallerySection';
import { HippotherapyQuoteSection } from './hippotherapy-quote-section/HippotherapyQuoteSection';
import { HippoventionCenterSection } from './hippovention-center-section/HippoventionCenterSection';
import { IntroBannerSection } from './intro-banner-section/IntroBannerSection';
import { ScientificReferencesSection } from './scientific-references-section/ScientificReferencesSection';
import { TextCardSection } from './text-card-section/TextCardSection';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

jest.mock('@/components/admin/image-input/ImageInput');

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

jest.mock('./scientific-references-section/scientific-reference-card/ScientificReferenceCard', () => ({
    ScientificReferenceCard: () => null,
}));

interface TranslationProps {
    onTranslateClick?: () => void;
    isTranslateDisabled?: boolean;
}

const image = { image: null, imageId: null };

const SECTIONS: Array<[string, (props: TranslationProps) => ReactElement]> = [
    [
        'IntroBannerSection',
        (props) => (
            <IntroBannerSection
                value={{ title: 'Title', description: 'Description', ...image }}
                onChange={jest.fn()}
                {...props}
            />
        ),
    ],
    [
        'TextCardSection',
        (props) => (
            <TextCardSection
                value={{ title: 'Title', description: 'Description' }}
                onChange={jest.fn()}
                fieldIdPrefix="text-card"
                {...props}
            />
        ),
    ],
    [
        'HippotherapyQuoteSection',
        (props) => (
            <HippotherapyQuoteSection
                value={{ quoteText: 'Quote', authorName: 'Author', ...image }}
                onChange={jest.fn()}
                fieldIdPrefix="quote"
                {...props}
            />
        ),
    ],
    [
        'HippoventionCenterSection',
        (props) => (
            <HippoventionCenterSection
                value={{ title: 'Title', description: 'Description', pros: 'Pros', ...image }}
                onChange={jest.fn()}
                {...props}
            />
        ),
    ],
    [
        'GallerySection',
        (props) => (
            <GallerySection
                value={{ title: 'Title', cards: [{ description: 'Card', ...image }] }}
                onChange={jest.fn()}
                fieldIdPrefix="gallery"
                {...props}
            />
        ),
    ],
    [
        'ScientificReferencesSection',
        (props) => (
            <ScientificReferencesSection
                value={{
                    title: 'Title',
                    description: 'Description',
                    scientificReferences: [{ localId: 'ref-1', id: 1, name: 'Citation', url: 'https://example.com' }],
                }}
                onChange={jest.fn()}
                {...props}
            />
        ),
    ],
    [
        'EthicsSection',
        (props) => (
            <EthicsSection
                value={{ title: 'Title', description: 'Description', principles: ['Principle'], ...image }}
                onChange={jest.fn()}
                {...props}
            />
        ),
    ],
];

const queryTranslateButton = () =>
    screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION });

describe.each(SECTIONS)('%s translation icon', (_, renderSection) => {
    it('is not rendered without onTranslateClick', () => {
        render(renderSection({}));

        expect(queryTranslateButton()).not.toBeInTheDocument();
    });

    it('calls onTranslateClick when it is clicked', () => {
        const onTranslateClick = jest.fn();
        render(renderSection({ onTranslateClick }));

        fireEvent.click(queryTranslateButton()!);

        expect(onTranslateClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when isTranslateDisabled is true', () => {
        render(renderSection({ onTranslateClick: jest.fn(), isTranslateDisabled: true }));

        expect(queryTranslateButton()).toBeDisabled();
    });
});
