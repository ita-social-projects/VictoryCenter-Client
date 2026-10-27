import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SectionTranslationHeader, SectionTranslationHeaderProps } from './SectionTranslationHeader';
import { mockTranslationLanguages, mockLocalizations } from '@/utils/mock-data/admin/section-translation-test-helpers';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses');

describe('SectionTranslationHeader', () => {
    const renderHeader = (props: SectionTranslationHeaderProps = {}) => render(<SectionTranslationHeader {...props} />);

    const getTranslateButton = () =>
        screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION });

    const getStatuses = () => screen.queryByTestId('localization-statuses');

    describe('when there is nothing to show', () => {
        it.each<[string, SectionTranslationHeaderProps]>([
            ['no props', {}],
            ['empty languages and empty localizations', { languages: [], localizations: [] }],
            ['empty languages without localizations', { languages: [] }],
            ['languages without localizations', { languages: mockTranslationLanguages }],
            ['localizations without languages', { localizations: mockLocalizations }],
        ])('renders nothing for %s (no translate button)', (_name, props) => {
            const { container } = renderHeader(props);

            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('translation statuses', () => {
        it('renders only statuses when languages and localizations are provided without translate button', () => {
            renderHeader({ languages: mockTranslationLanguages, localizations: mockLocalizations });

            const statuses = getStatuses();
            expect(statuses).toBeInTheDocument();
            expect(statuses).toHaveAttribute('data-languages-count', String(mockTranslationLanguages.length));
            expect(statuses).toHaveAttribute('data-localizations-count', String(mockLocalizations.length));
            expect(getTranslateButton()).not.toBeInTheDocument();
        });

        it('renders statuses when localizations is an empty array but languages are present', () => {
            renderHeader({ languages: mockTranslationLanguages, localizations: [] });

            expect(getStatuses()).toBeInTheDocument();
        });

        it.each<[string, SectionTranslationHeaderProps]>([
            ['localizations are not provided', { languages: mockTranslationLanguages }],
            ['languages are empty', { languages: [], localizations: mockLocalizations }],
            ['languages are not provided', { localizations: mockLocalizations }],
        ])('does not render statuses when %s', (_name, props) => {
            renderHeader({ ...props, onTranslateClick: jest.fn() });

            expect(getStatuses()).not.toBeInTheDocument();
        });
    });

    describe('translate button', () => {
        it('renders only the button when onTranslateClick is provided without languages', () => {
            renderHeader({ onTranslateClick: jest.fn() });

            expect(getTranslateButton()).toBeInTheDocument();
            expect(getStatuses()).not.toBeInTheDocument();
        });

        it('renders only the button when languages are empty (no empty statuses container content)', () => {
            renderHeader({ languages: [], localizations: [], onTranslateClick: jest.fn() });

            expect(getTranslateButton()).toBeInTheDocument();
            expect(getStatuses()).not.toBeInTheDocument();
        });

        it('renders both statuses and button when both are provided', () => {
            renderHeader({
                languages: mockTranslationLanguages,
                localizations: mockLocalizations,
                onTranslateClick: jest.fn(),
            });

            expect(getStatuses()).toBeInTheDocument();
            expect(getTranslateButton()).toBeInTheDocument();
        });

        it('calls onTranslateClick when clicked', () => {
            const onTranslateClick = jest.fn();
            renderHeader({ onTranslateClick });

            fireEvent.click(getTranslateButton()!);

            expect(onTranslateClick).toHaveBeenCalledTimes(1);
        });

        it('is disabled and does not call onTranslateClick when isTranslateDisabled is true', () => {
            const onTranslateClick = jest.fn();
            renderHeader({ onTranslateClick, isTranslateDisabled: true });

            expect(getTranslateButton()).toBeDisabled();
            fireEvent.click(getTranslateButton()!);

            expect(onTranslateClick).not.toHaveBeenCalled();
        });
    });
});
