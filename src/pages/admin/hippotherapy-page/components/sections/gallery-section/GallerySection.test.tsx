import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GallerySection, GallerySectionProps } from './GallerySection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippotherapyGallerySectionContent } from '@/types/admin/hippotherapy-page';
import {
    itHidesToolbarWhenReadOnly,
    itRendersTranslationStatuses,
} from '@/utils/mock-data/admin/section-translation-test-helpers';
import {
    getValidateTextMock,
    itDisablesInputsWhenDisabled,
    itShowsValidationErrorOnBlur,
    itSupportsTranslateButton,
    itUpdatesFieldsOnChange,
    setupValidateTextMock,
} from '@/utils/mock-data/admin/hippotherapy-section-test-helpers';
import { HippotherapyReadOnlyContext } from '../../../context/HippotherapyReadOnlyContext';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses');
jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');
jest.mock('@/components/admin/image-input/ImageInput');
jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema');

describe('GallerySection', () => {
    setupValidateTextMock();

    const TITLE_ID = 'mock-rich-input-test-gallery-title';
    const cardDescriptionId = (index: number) => `mock-rich-input-test-gallery-card-${index}-description`;

    const defaultValue: HippotherapyGallerySectionContent = {
        title: 'Initial title',
        cards: [
            { description: 'Card one', image: null, imageId: null },
            { description: 'Card two', image: null, imageId: null },
        ],
    };

    const renderComponent = (props: Partial<GallerySectionProps> = {}, isReadOnly = false) =>
        render(
            <HippotherapyReadOnlyContext.Provider value={isReadOnly}>
                <GallerySection value={defaultValue} onChange={jest.fn()} fieldIdPrefix="test-gallery" {...props} />
            </HippotherapyReadOnlyContext.Provider>,
        );

    it('renders the title and one image/description pair per card', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getAllByTestId('mock-image-input')).toHaveLength(2);
        expect(screen.getByTestId(cardDescriptionId(0))).toHaveValue('Card one');
        expect(screen.getByTestId(cardDescriptionId(1))).toHaveValue('Card two');
    });

    itUpdatesFieldsOnChange(renderComponent, defaultValue, [{ testId: TITLE_ID, field: 'title', value: 'New title' }]);

    it('updates only the targeted card image, leaving the others untouched', () => {
        const onChange = jest.fn();
        renderComponent({ onChange });
        const file = new File(['dummy'], 'test.png', { type: 'image/png' });

        fireEvent.change(screen.getAllByTestId('mock-image-input-file')[1], { target: { files: [file] } });

        expect(onChange).toHaveBeenCalledWith({
            ...defaultValue,
            cards: [defaultValue.cards[0], { ...defaultValue.cards[1], image: file }],
        });
    });

    it('updates only the targeted card description, leaving the others untouched', () => {
        const onChange = jest.fn();
        renderComponent({ onChange });

        fireEvent.change(screen.getByTestId(cardDescriptionId(0)), { target: { value: 'Updated card one' } });

        expect(onChange).toHaveBeenCalledWith({
            ...defaultValue,
            cards: [{ ...defaultValue.cards[0], description: 'Updated card one' }, defaultValue.cards[1]],
        });
    });

    it('shows an image error scoped to the card that reported it', () => {
        renderComponent();

        fireEvent.click(screen.getAllByRole('button', { name: 'Set Error' })[0]);

        expect(screen.getByText('image size error')).toBeInTheDocument();
    });

    it('reports the card index and error to the parent via onCardImageError', () => {
        const onCardImageError = jest.fn();
        renderComponent({ onCardImageError });

        fireEvent.click(screen.getAllByRole('button', { name: 'Set Error' })[1]);

        expect(onCardImageError).toHaveBeenCalledWith(1, 'image size error');
    });

    itShowsValidationErrorOnBlur(renderComponent, cardDescriptionId(0));

    it('does not show an error on the card description when the image input is blurred', () => {
        getValidateTextMock().mockReturnValue('Too short');
        renderComponent();

        fireEvent.blur(screen.getAllByTestId('mock-image-input-file')[0]);

        expect(screen.queryByText('Too short')).not.toBeInTheDocument();
    });

    itDisablesInputsWhenDisabled(renderComponent, [TITLE_ID, cardDescriptionId(0), cardDescriptionId(1)]);

    describe('translate button', () => {
        itSupportsTranslateButton(renderComponent);
    });

    describe('translation statuses', () => {
        itRendersTranslationStatuses(renderComponent);
    });

    describe('read-only toolbar', () => {
        itHidesToolbarWhenReadOnly(
            (isReadOnly) => renderComponent({}, isReadOnly),
            [
                'mock-rich-input-test-gallery-title',
                'mock-rich-input-test-gallery-card-0-description',
                'mock-rich-input-test-gallery-card-1-description',
            ],
        );
    });
});
