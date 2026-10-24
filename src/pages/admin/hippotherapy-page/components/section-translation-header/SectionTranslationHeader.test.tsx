import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SectionTranslationHeader } from './SectionTranslationHeader';
import { mockTranslationLanguages, mockLocalizations } from '@/utils/mock-data/admin/section-translation-test-helpers';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses', () => ({
    LocalizationStatuses: ({ languages, localizedEntity }: any) => (
        <div
            data-testid="localization-statuses"
            data-languages-count={languages?.length ?? 0}
            data-localizations-count={localizedEntity?.localizations?.length ?? 0}
        />
    ),
}));

describe('SectionTranslationHeader', () => {
    const getTranslateButton = () =>
        screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION });

    it('returns null when neither languages nor onTranslateClick are provided', () => {
        const { container } = render(<SectionTranslationHeader />);
        expect(container.firstChild).toBeNull();
    });

    it('renders only translation statuses when languages and localizations are provided without translate button', () => {
        render(<SectionTranslationHeader languages={mockTranslationLanguages} localizations={mockLocalizations} />);

        const statuses = screen.getByTestId('localization-statuses');
        expect(statuses).toBeInTheDocument();
        expect(statuses).toHaveAttribute('data-languages-count', String(mockTranslationLanguages.length));
        expect(getTranslateButton()).not.toBeInTheDocument();
    });

    it('does not render localization statuses if localizations prop is not provided', () => {
        render(<SectionTranslationHeader languages={mockTranslationLanguages} />);

        expect(screen.queryByTestId('localization-statuses')).not.toBeInTheDocument();
    });

    it('renders only the translate button when onTranslateClick is provided without languages', () => {
        render(<SectionTranslationHeader onTranslateClick={jest.fn()} />);

        expect(getTranslateButton()).toBeInTheDocument();
        expect(screen.queryByTestId('localization-statuses')).not.toBeInTheDocument();
    });

    it('renders both statuses and translate button when both are provided', () => {
        render(
            <SectionTranslationHeader
                languages={mockTranslationLanguages}
                localizations={mockLocalizations}
                onTranslateClick={jest.fn()}
            />,
        );

        expect(screen.getByTestId('localization-statuses')).toBeInTheDocument();
        expect(getTranslateButton()).toBeInTheDocument();
    });

    it('calls onTranslateClick when the translation icon is clicked', () => {
        const onTranslateClick = jest.fn();
        render(<SectionTranslationHeader onTranslateClick={onTranslateClick} />);

        fireEvent.click(getTranslateButton()!);

        expect(onTranslateClick).toHaveBeenCalledTimes(1);
    });

    it('disables the translation icon when isTranslateDisabled is true', () => {
        const onTranslateClick = jest.fn();
        render(<SectionTranslationHeader onTranslateClick={onTranslateClick} isTranslateDisabled />);

        expect(getTranslateButton()).toBeDisabled();
        fireEvent.click(getTranslateButton()!);
        expect(onTranslateClick).not.toHaveBeenCalled();
    });
});
