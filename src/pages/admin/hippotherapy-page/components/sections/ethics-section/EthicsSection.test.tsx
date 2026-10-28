import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EthicsSection, EthicsSectionProps } from './EthicsSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippotherapyEthicsSectionContent } from '@/types/admin/hippotherapy-page';
import { itRendersTranslationStatuses } from '@/utils/mock-data/admin/section-translation-test-helpers';
import {
    itDisablesInputsWhenDisabled,
    itHandlesImageField,
    itShowsValidationErrorOnBlur,
    itSupportsTranslateButton,
    itUpdatesFieldsOnChange,
    setupValidateTextMock,
} from '@/utils/mock-data/admin/hippotherapy-section-test-helpers';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses');
jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');
jest.mock('@/components/admin/image-input/ImageInput');
jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema');

describe('EthicsSection', () => {
    setupValidateTextMock();

    const TITLE_ID = 'mock-rich-input-hippotherapy-ethics-title';
    const DESCRIPTION_ID = 'mock-rich-input-hippotherapy-ethics-description';
    const principleId = (index: number) => `mock-rich-input-hippotherapy-ethics-principle-${index}`;

    const defaultValue: HippotherapyEthicsSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        principles: ['Principle one', 'Principle two'],
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<EthicsSectionProps> = {}) =>
        render(<EthicsSection value={defaultValue} onChange={jest.fn()} {...props} />);

    it('renders title, image, description, and one field per principle', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getAllByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toHaveLength(3);
        expect(screen.getByTestId(principleId(0))).toHaveValue('Principle one');
    });

    itHandlesImageField(renderComponent, defaultValue);
    itUpdatesFieldsOnChange(renderComponent, defaultValue, [
        { testId: TITLE_ID, field: 'title', value: 'New title' },
        { testId: DESCRIPTION_ID, field: 'description', value: 'New description' },
    ]);

    it('updates only the targeted principle, leaving others intact', () => {
        const onChange = jest.fn();
        renderComponent({ onChange });

        fireEvent.change(screen.getByTestId(principleId(1)), { target: { value: 'Updated principle two' } });

        expect(onChange).toHaveBeenCalledWith({
            ...defaultValue,
            principles: ['Principle one', 'Updated principle two'],
        });
    });

    itShowsValidationErrorOnBlur(renderComponent, principleId(0), 'x');
    itDisablesInputsWhenDisabled(renderComponent, [TITLE_ID, DESCRIPTION_ID, principleId(0)]);

    describe('translate button', () => {
        itSupportsTranslateButton(renderComponent);
    });

    describe('translation statuses', () => {
        itRendersTranslationStatuses(renderComponent);
    });
});
